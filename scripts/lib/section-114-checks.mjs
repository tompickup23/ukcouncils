import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {loadNotices, noticeLine, noticeSource, NOTICE_COVERAGE, NOTICE_ABSENCE} from './section-114-data.mjs';

const decode = value => value.replace(/&quot;|&#34;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const clean = value => decode(value).replace(/\s+/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();
const textOf = node => node.type === TEXT_NODE ? node.value : (node.children ?? []).map(textOf).join(' ');
const has = (node, key) => Object.hasOwn(node.attributes ?? {}, key);
const inside = (node, parent) => {for (let n = node.parent; n; n = n.parent) if (n === parent) return true; return false;};
const hidden = node => {
  for (let n = node; n; n = n.parent) {
    const a = n.attributes ?? {};
    if ('hidden' in a || a['aria-hidden'] === 'true' || /display\s*:\s*none|visibility\s*:\s*hidden/i.test(a.style ?? '')) return true;
  }
  return false;
};
const mentionsNotice = value => /\b(?:notices?|section\s*114|s\.?\s*114|statutory\s+financial\s+(?:reports?|documents?))\b/i.test(value);

/** Exact pinned prose plus a closed vocabulary elsewhere on the profile. A marker
 * alone cannot admit a notice, a different date, a status claim or a negative claim. */
export function section114Checks(html, gss, root = process.cwd()) {
  const expected = loadNotices(root).profiles.get(gss) ?? [];
  const failures = [];
  const elements = [];
  const textNodes = [];
  walkSync(parse(html), node => {
    if (node.type === ELEMENT_NODE) elements.push(node);
    if (node.type === TEXT_NODE) textNodes.push(node);
  });
  const sections = elements.filter(node => node.attributes?.id === 'financial-notices');
  const items = elements.filter(node => has(node, 'data-notice-id'));
  const lines = elements.filter(node => has(node, 'data-notice-line'));
  const absences = elements.filter(node => node.attributes?.['data-dossier-absence'] === 'notices');
  const contents = elements.filter(node => node.name === 'a' && node.attributes.href === '#financial-notices');
  const approved = [];
  const main = elements.find(node => node.name === 'main');
  if (sections.length !== Number(expected.length > 0) || items.length !== expected.length || lines.length !== expected.length) failures.push('Notice presence differs from pinned records');
  if (absences.length !== Number(expected.length === 0)) failures.push('Notice absence differs from pinned records');
  for (const absence of absences) {
    if (clean(textOf(absence)) !== `Statutory financial notices: ${NOTICE_ABSENCE}` || hidden(absence) || !main || !inside(absence, main)) failures.push('Incorrect or hidden notice absence explanation');
    approved.push(absence);
  }
  for (const link of contents) {
    if (!expected.length || clean(textOf(link)) !== 'Section 114 documents') failures.push('Unpinned notice contents link');
    approved.push(link);
  }
  const wantedText = ['Section 114 documents', NOTICE_COVERAGE];
  const bibliography = [];
  expected.forEach((record, index) => {
    const item = items[index];
    const source = noticeSource(record);
    const citation = `${source.publisher}, ${source.title}, ${source.table}.`;
    const itemText = `${noticeLine(record)} Source: ${citation} Historical document record.`;
    wantedText.push(itemText);
    if (!item || item.attributes['data-notice-id'] !== record.id || clean(textOf(item)) !== itemText || hidden(item)
      || sections.length !== 1 || !inside(item, sections[0])) failures.push('Rendered notice differs from pinned record');
    if (item) {
      const links = elements.filter(node => node.name === 'a' && inside(node, item));
      if (links.length !== 1 || decode(links[0].attributes.href ?? '') !== record.url) failures.push('Notice link differs from original document');
      const citations = elements.filter(node => has(node, 'data-citation-record') && inside(node, item));
      if (citations.length !== 1 || decode(citations[0].attributes['data-citation-record']) !== JSON.stringify(source)) failures.push('Notice citation differs from pinned record');
    }
    const entries = elements.filter(node => has(node, 'data-citation-entry') && elements.some(list => has(list, 'data-profile-sources') && inside(node, list))
      && elements.some(link => link.name === 'a' && decode(link.attributes.href ?? '') === record.url && inside(link, node)));
    if (entries.length !== 1 || clean(textOf(entries[0])) !== citation) failures.push('Notice bibliography differs from pinned record');
    bibliography.push(...entries);
  });
  for (const section of sections) {
    if (clean(textOf(section)) !== wantedText.join(' ') || hidden(section) || !main || !inside(section, main)) failures.push('Notice section contains unpinned or hidden text');
    approved.push(section);
  }
  approved.push(...bibliography);
  // Four existing election source titles use the word notices. Admit only the
  // exact source link for this profile, not other prose inside its source line.
  const election = JSON.parse(readFileSync(resolve(root, 'data/elections/next-elections.json'), 'utf8')).councils[gss];
  if (election) approved.push(...elements.filter(node => node.name === 'a'
    && decode(node.attributes.href ?? '') === election.sourceUrl && clean(textOf(node)) === election.sourceLabel));
  // A permitted node is checked above in full. Everywhere else, even metadata,
  // notice prose needs an explicit reviewed rendering path instead of a claim.
  const permitted = node => approved.some(parent => node === parent || inside(node, parent));
  const remaining = textNodes.filter(node => !permitted(node)).map(node => node.value).join(' ');
  const attributes = elements.flatMap(node => ['content', 'alt', 'title', 'aria-label'].map(key => node.attributes?.[key] ?? '')).join(' ');
  if (mentionsNotice(clean(remaining)) || mentionsNotice(clean(attributes))) failures.push('Notice claim outside pinned record or exact absence wording');
  return [...new Set(failures)];
}
