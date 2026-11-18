import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {INPUT_PATHS} from './audit-crosswalk.mjs';
import {loadAuditStatus, auditAbsence, auditLine, auditAnswers, auditSource, auditFootnote, AUDIT_HEADING, AUDIT_COVERAGE} from './audit-status.mjs';

const decode = value => value.replace(/&quot;|&#34;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const clean = value => decode(value).replace(/\s+/g, ' ').replace(/\s+([.,;:?])/g, '$1').trim();
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

// Any statement about a council's audits, accounts or the backstop lists. Outside the
// checked section and the exact absence reason, such prose needs a reviewed path.
const AUDIT_PATTERNS = [
  /\baudit(?:s|ed|or|ors|ing)?\b/i,
  /\bPSAA\b|Public Sector Audit Appointments/i,
  /\bbackstop\b|non[\s-]?compliance/i,
  /\b(?:draft|statement of|unaudited)\s+accounts?\b/i,
];
export const mentionsAudit = value => AUDIT_PATTERNS.some(pattern => pattern.test(value));
const UNREAD_ATTRIBUTES = new Set(['href', 'src', 'srcset', 'cite', 'action', 'class', 'id', 'style', 'integrity', 'for', 'aria-labelledby', 'aria-describedby', 'aria-controls']);

let firms;
/** Firm names from the research table's firm column, read only to keep them out of pages. */
export function auditFirmNames(root = process.cwd()) {
  if (firms) return firms;
  const research = JSON.parse(readFileSync(resolve(root, INPUT_PATHS[0]), 'utf8'));
  const printed = research.tables.slice(1).flatMap(table => table.rows.slice(1).map(row => row[2]))
    .filter(cell => !/^No appointed auditor/.test(cell));
  // Also the trading names without a legal suffix, so a shortened name is caught too.
  const short = printed.map(name => name.replace(/\s+(?:UK|Uk)?\s*(?:LLP|Limited)$/, '').replace(/^Forvis\s+/, '').replace(/\s+Audit Services?$/, ''));
  firms = [...new Set([...printed, ...short])].filter(name => name.length > 2).sort();
  return firms;
}
export function firmNameIn(text, root = process.cwd()) {
  const plain = decode(text).replace(/\s+/g, ' ').toLowerCase();
  return auditFirmNames(root).find(name => new RegExp(`\\b${name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(plain)) ?? null;
}

/** Firm names in any prose or readable attribute of a page, any page. Addresses,
 * hashes and styling are skipped: an integrity hash can contain short letter runs. */
export function firmChecks(html, root = process.cwd()) {
  const parts = [];
  walkSync(parse(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')), node => {
    if (node.type === TEXT_NODE) parts.push(node.value);
    if (node.type === ELEMENT_NODE) for (const [key, value] of Object.entries(node.attributes ?? {})) if (!UNREAD_ATTRIBUTES.has(key)) parts.push(String(value));
  });
  const name = firmNameIn(parts.join(' . '), root);
  return name ? ['Audit firm name on page'] : [];
}

/** The pinned lines in full, or the exact reason, and no audit claim anywhere else on the profile. */
export function auditChecks(html, gss, root = process.cwd()) {
  const expected = loadAuditStatus(root).profiles.get(gss) ?? [];
  const failures = [];
  const elements = [];
  const textNodes = [];
  walkSync(parse(html), node => {
    if (node.type === ELEMENT_NODE) elements.push(node);
    if (node.type === TEXT_NODE) textNodes.push(node);
  });
  const main = elements.find(node => node.name === 'main');
  const sections = elements.filter(node => node.attributes?.id === 'audit-status');
  const items = elements.filter(node => has(node, 'data-audit-entry'));
  const absences = elements.filter(node => node.attributes?.['data-dossier-absence'] === 'audit');
  const contents = elements.filter(node => node.name === 'a' && node.attributes.href === '#audit-status');
  const approved = [];
  if (sections.length !== Number(expected.length > 0) || items.length !== expected.length) failures.push('Audit lines differ from pinned values');
  if (absences.length !== Number(expected.length === 0)) failures.push('Audit absence differs from pinned values');
  for (const absence of absences) {
    if (clean(textOf(absence)) !== clean(`External audit status: ${auditAbsence(gss).reason}`) || hidden(absence) || !main || !inside(absence, main)) failures.push('Incorrect or hidden audit absence explanation');
    approved.push(absence);
  }
  for (const link of contents) {
    if (!expected.length || clean(textOf(link)) !== AUDIT_HEADING) failures.push('Unpinned audit contents link');
    approved.push(link);
  }
  const wanted = [AUDIT_HEADING, AUDIT_COVERAGE];
  const bibliography = [];
  expected.forEach((entry, index) => {
    const item = items[index];
    const source = auditSource(entry, root);
    const citation = `${source.publisher}, ${source.title}, ${source.table}.`;
    const answers = auditAnswers(entry, root).map(row => `${row.question} ${row.answer}`).join(' ');
    const itemText = `${auditLine(entry, root)} ${answers}${entry.asterisk ? ` ${auditFootnote(root)}` : ''} Source: ${citation}`;
    wanted.push(itemText);
    if (!item || item.attributes['data-audit-entry'] !== entry.backstop || clean(textOf(item)) !== clean(itemText) || hidden(item)
      || sections.length !== 1 || !inside(item, sections[0])) failures.push('Rendered audit line differs from pinned value');
    if (item) {
      const footnotes = elements.filter(node => has(node, 'data-audit-footnote') && inside(node, item));
      if (footnotes.length !== Number(entry.asterisk)) failures.push('Audit footnote differs from pinned label');
      const links = elements.filter(node => node.name === 'a' && inside(node, item));
      if (links.length !== 1 || decode(links[0].attributes.href ?? '') !== source.url) failures.push('Audit link differs from the publication');
      const citations = elements.filter(node => has(node, 'data-citation-record') && inside(node, item));
      if (citations.length !== 1 || decode(citations[0].attributes['data-citation-record']) !== JSON.stringify(source)) failures.push('Audit citation differs from pinned value');
    }
    const entries = elements.filter(node => has(node, 'data-citation-entry') && elements.some(list => has(list, 'data-profile-sources') && inside(node, list))
      && clean(textOf(node)) === clean(citation));
    if (entries.length !== 1) failures.push('Audit bibliography differs from pinned value');
    bibliography.push(...entries);
  });
  for (const section of sections) {
    if (clean(textOf(section)) !== clean(wanted.join(' ')) || hidden(section) || !main || !inside(section, main)) failures.push('Audit section contains unpinned or hidden text');
    approved.push(section);
  }
  approved.push(...bibliography);
  const permitted = node => approved.some(parent => node === parent || inside(node, parent));
  const remaining = textNodes.filter(node => !permitted(node)).map(node => node.value).join(' ');
  const attributes = elements.filter(node => !permitted(node)).flatMap(node => Object.entries(node.attributes ?? {})
    .filter(([key]) => !UNREAD_ATTRIBUTES.has(key)).map(([, value]) => String(value))).join(' . ');
  if (mentionsAudit(clean(remaining)) || mentionsAudit(clean(attributes))) failures.push('Audit claim outside pinned values or exact absence wording');
  failures.push(...firmChecks(html, root));
  return [...new Set(failures)];
}
