import { JSDOM } from 'jsdom';
import { linkedSource, shortSourceText, sourceEntryHtml } from '../../src/vendor/estate-kit/dist/src/figures/sources.js';
const longDate = new Intl.DateTimeFormat('en-GB', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'});

/** Bibliographic metadata is emitted by SourceLine; process final document order,
 * not component execution order, so parallel rendering cannot shorten a first use. */
export function shortenCitations(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const list = doc.querySelector('[data-profile-sources]');
  if (!list) { dom.window.close(); return html; }
  const seen = new Set();
  const panelSeen = new Map();
  const entries = new Map([...list.children].map(node => [node.dataset.citationEntry, node]));
  const renderedEntries = new Set();
  for (const line of doc.querySelectorAll('[data-citation-record]')) {
    const source = JSON.parse(line.dataset.citationRecord);
    const id = line.dataset.citationKey;
    // Incomplete bibliography stays full; do not invent a publication date or locator.
    if (!source.table || !/^\d{4}-\d{2}-\d{2}$/.test(source.date ?? '')) continue;
    const linked = linkedSource({...source, id, publicationDate: source.date, edition: source.date});
    let entry = entries.get(id);
    if (!entry) { entry = doc.createElement('li'); entry.dataset.citationEntry = id; list.append(entry); entries.set(id, entry); }
    if (!renderedEntries.has(id)) { entry.innerHTML = sourceEntryHtml(linked); renderedEntries.add(id); }
    // Alternative band panels are separate reading paths. A hidden panel's full
    // citation cannot stand in for the first citation in the selected panel.
    const panel = line.closest('[data-band-panel]');
    if (panel && !panelSeen.has(panel)) panelSeen.set(panel, new Set());
    const short = seen.has(id) && (!panel || panelSeen.get(panel).has(id));
    line.dataset.citationFormat = short ? 'short' : 'full';
    line.replaceChildren();
    if (source.method) line.append(`${source.method}. `);
    line.append('Source: ');
    const link = doc.createElement('a');
    link.href = short ? `#${id}` : source.url;
    link.textContent = short ? shortSourceText(linked) : `${source.publisher}, ${source.title}`;
    line.append(link);
    if (!short) line.append(`, ${source.table}, published ${longDate.format(new Date(source.date))}`);
    line.append('.');
    seen.add(id);
    if (panel) panelSeen.get(panel).add(id);
  }
  // Avoid stale counts when a detailed table has a distinct locator from the profile summary.
  const section = list.closest('section');
  const summary = section?.querySelector('summary');
  if (summary) summary.textContent = 'Read the full source citations';
  const introduction = section?.querySelector('p');
  if (introduction) introduction.textContent = 'Every table and file cited on this page. Repeated source lines link to the full citation here.';
  const out = dom.serialize(); dom.window.close();
  const errors = citationErrors(out);
  if (errors.length) throw new Error(errors.join('\n'));
  return out;
}

/** Every short line needs a full first use and a complete unique entry on this page. */
export function citationErrors(html) {
  const dom = new JSDOM(html); const doc = dom.window.document;
  const errors = []; const seen = new Set(); const panelSeen = new Map();
  const ids = new Map();
  for (const node of doc.querySelectorAll('[id]')) {
    if (!ids.has(node.id)) ids.set(node.id, []);
    ids.get(node.id).push(node);
  }
  for (const line of doc.querySelectorAll('[data-citation-format]')) {
    const id = line.dataset.citationKey;
    const entries = ids.get(id) ?? [];
    if (entries.length !== 1 || !entries[0].closest('[data-profile-sources]')) errors.push(`${id}: missing or duplicate full entry`);
    else for (const key of ['publisher', 'title', 'locator', 'date', 'url']) {
      if (!entries[0].querySelector(`[data-ek-source-field="${key}"]`)?.textContent.trim()) errors.push(`${id}: missing ${key}`);
    }
    const source = JSON.parse(line.dataset.citationRecord);
    const expected = {publisher: source.publisher, title: source.title, locator: source.table, date: source.date, url: source.url};
    if (entries.length === 1) for (const [key, value] of Object.entries(expected)) {
      if (entries[0].querySelector(`[data-ek-source-field="${key}"]`)?.textContent !== value) errors.push(`${id}: mismatched ${key}`);
    }
    if (!seen.has(id) && line.dataset.citationFormat !== 'full') errors.push(`${id}: first use is short`);
    const panel = line.closest('[data-band-panel]');
    if (panel && !panelSeen.has(panel)) panelSeen.set(panel, new Set());
    if (panel && !panelSeen.get(panel).has(id) && line.dataset.citationFormat !== 'full') errors.push(`${id}: first panel use is short`);
    if (line.dataset.citationFormat === 'full' && !line.textContent.includes(source.title)) errors.push(`${id}: full line lacks document title`);
    if (line.dataset.citationFormat === 'short' && line.querySelector('a')?.getAttribute('href') !== `#${id}`) errors.push(`${id}: broken short link`);
    seen.add(id);
    if (panel) panelSeen.get(panel).add(id);
  }
  dom.window.close(); return errors;
}
