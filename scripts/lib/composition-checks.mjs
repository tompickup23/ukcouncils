import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {loadComposition, COLUMN_LABELS, controlLabel, CONTROL_CAVEAT} from './composition-data.mjs';

const textOf = node => node.type === TEXT_NODE ? node.value : (node.children ?? []).map(textOf).join(' ');
const clean = text => text.replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
export function compositionFieldLeaks(text) {
  text = text.replace(/&quot;|&#34;/g, '"').replace(/&#39;|&apos;/g, "'");
  return /(?:["'](?:councillor(?:s|[-_]?names?)?|seats|partySeats|partyTotals|control|coalition|administration|leader|majority(?:_?size)?)["']\s*:|data-(?:councillor(?:-name)?|coalition|administration|leader|majority)\b)/i.test(text);
}
/** Check actual rendered values and control, not just a marker that could surround anything.
 * @param {string} html
 * @param {string | null} gss
 */
export function compositionChecks(html, gss = null, root = process.cwd()) {
  const failures = [];
  if (compositionFieldLeaks(html)) failures.push('Held composition field in distribution');
  const {profiles, source} = loadComposition(root);
  const expected = profiles.get(gss);
  const elements = [];
  walkSync(parse(html), node => {if (node.type === ELEMENT_NODE) elements.push(node);});
  const has = (node, key) => Object.hasOwn(node.attributes ?? {}, key);
  const inside = (node, parent) => {for (let n = node.parent; n; n = n.parent) if (n === parent) return true; return false;};
  const sections = elements.filter(node => node.attributes?.id === 'composition');
  const controls = elements.filter(node => has(node, 'data-composition-control'));
  const tables = elements.filter(node => has(node, 'data-composition-table'));
  const cells = elements.filter(node => has(node, 'data-composition-column'));
  const seatsExpected = Boolean(expected?.seatsAdmitted);
  const controlExpected = Boolean(expected?.controlAdmitted);
  if (sections.length !== Number(seatsExpected) || tables.length !== Number(seatsExpected)) failures.push('Composition presence differs from admitted snapshot row');
  if (controls.length !== Number(controlExpected)) failures.push('Control line without admitted snapshot row or missing admitted control');
  const date = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${source.retrieved}T00:00:00Z`));
  const expectedControl = controlExpected ? `Control in the Open Council Data snapshot retrieved ${date}: ${controlLabel(expected)}` : null;
  for (const control of controls) {
    if (clean(textOf(control)) !== expectedControl || !sections.some(section => inside(control, section))) failures.push('Control differs from admitted compiler field');
  }
  const controlMentions = html.match(/Control in the Open Council Data snapshot retrieved /g) ?? [];
  if (controlMentions.length !== Number(controlExpected)) failures.push('Control text outside admitted line');
  if (seatsExpected && sections.length === 1 && tables.length === 1) {
    const section = sections[0];
    if (section.attributes['data-composition-source'] !== expected.sourceId) failures.push('Composition source ID differs from pin');
    if (!inside(tables[0], section)) failures.push('Composition table outside its source section');
    const actual = cells.map(cell => ({key: cell.attributes['data-composition-column'], value: clean(textOf(cell))}));
    const wanted = Object.entries(COLUMN_LABELS).map(([key, label]) => ({key, value: `${label} ${expected.columns[key]}`}));
    const numericCells = elements.filter(node => node.name === 'td' && inside(node, tables[0]));
    if (numericCells.length !== Object.keys(COLUMN_LABELS).length || JSON.stringify(actual) !== JSON.stringify(wanted) || cells.some(cell => !inside(cell, tables[0]))) failures.push('Unpinned composition value or column');
    const prose = clean(textOf(section));
    for (const required of [source.publisher, source.title, date, 'compiled by a third party, not an official council return', "Other is the publisher's aggregate category.", "not an effective date certified for each council.", 'CC BY-SA 4.0']) {
      if (!prose.includes(required)) failures.push(`Missing composition provenance: ${required}`);
    }
    if (!elements.some(node => inside(node, section) && node.attributes?.href === source.licenceUrl)) failures.push('Missing composition licence link');
    if (controlExpected && !prose.includes(CONTROL_CAVEAT)) failures.push('Missing control caveat');
    const allowedProse = prose.replace(CONTROL_CAVEAT, '');
    if (/coalition|administration|\bleader\b|majority|runs the council/i.test(allowedProse)) failures.push('Held composition claim');
  } else if (cells.length) failures.push('Composition cells without an admitted snapshot row');
  return failures;
}
