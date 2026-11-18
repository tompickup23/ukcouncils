import {loadAuditCrosswalk, AUDIT_PATHS, INPUT_PATHS, ANSWER_KEYS} from './audit-crosswalk.mjs';

// The build reads the pinned values through the full loader once for each root.
// The loader itself keeps no cache, so mutation tests still fail their pins.
const cache = new Map();
export function loadAuditStatus(root = process.cwd()) {
  if (cache.has(root)) return cache.get(root);
  const {source, values} = loadAuditCrosswalk(root);
  const profiles = new Map(values.profiles.map(profile => [profile.gss, profile.entries]));
  const tables = new Map(values.tables.map(table => [table.backstop, table]));
  const result = {source, values, profiles, tables, footnote: values.footnote};
  cache.set(root, result);
  return result;
}

/** Every committed file the audit lines depend on: the manifest, its pinned files and the research table. */
export const AUDIT_STATUS_PATHS = [...AUDIT_PATHS, INPUT_PATHS[0]];

export const AUDIT_HEADING = 'External audit';
export const AUDIT_COVERAGE = 'MHCLG lists the bodies that did not publish all audited accounts by each backstop date. Each answer below is shown as printed and responds to the dated question beside it; it is not an audit opinion.';
const HOLDINGS = "This site holds only MHCLG's lists of bodies that did not publish audited accounts by a backstop date.";
const PSAA = 'Per body audit delivery data from Public Sector Audit Appointments (PSAA) is not shown because its reuse terms have not been cleared.';

// One reason for each cause. Each is literally true for every profile it prints on;
// the tests check the cause against the pinned crosswalk for every profile.
export const AUDIT_ABSENCE = {
  'no-row': `${HOLDINGS} This council has no row on those lists. Absence from them is not a statement about its audits. ${PSAA}`,
  predecessor: label => `${HOLDINGS} No row for the present council is held. A predecessor body, ${label}, has a row on the list for the 13 December 2024 backstop; that row is not shown as this council's. Absence from the lists is not a statement about this council's audits. ${PSAA}`,
  'pension-fund': `${HOLDINGS} The council's main accounts have no row on those lists. The list for the 27 February 2026 backstop has a row for the council's pension fund only, which is not shown here. Absence from the lists is not a statement about its audits. ${PSAA}`,
};
// Reviewed causes other than no row. The crosswalk keeps these labels unassigned;
// this map only chooses the reason and never attaches their values to a profile.
export const AUDIT_ABSENCE_CAUSES = {
  E06000065: {cause: 'predecessor', label: 'North Yorkshire County Council', backstop: '2024-12-13'},
  E09000024: {cause: 'pension-fund', label: 'London Borough of Merton (Pension fund only  to  the opinion for the main accounts was published by the backstop)', backstop: '2026-02-27'},
};

export function auditAbsence(gss) {
  const special = AUDIT_ABSENCE_CAUSES[gss];
  if (!special) return {cause: 'no-row', reason: AUDIT_ABSENCE['no-row']};
  const reason = special.cause === 'predecessor' ? AUDIT_ABSENCE.predecessor(special.label) : AUDIT_ABSENCE[special.cause];
  return {cause: special.cause, reason};
}

const LONG = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'});
export const auditDate = iso => LONG.format(new Date(`${iso}T00:00:00Z`));
const years = value => value.startsWith('Up to') ? `financial years ${value[0].toLowerCase()}${value.slice(1)}` : `financial year ${value}`;
// Printed headings keep their own spacing in the pinned file; a page shows single spaces.
export const printedText = value => value.replace(/\s+/g, ' ').trim();

export function auditLine(entry, root = process.cwd()) {
  const table = loadAuditStatus(root).tables.get(entry.backstop);
  return `Backstop ${auditDate(entry.backstop)}, ${years(table.financialYears)}. Name as printed: ${printedText(entry.label)}`;
}
export function auditAnswers(entry, root = process.cwd()) {
  const table = loadAuditStatus(root).tables.get(entry.backstop);
  return ANSWER_KEYS.map(key => ({key, question: printedText(table.questions[key]), answer: printedText(entry.answers[key])}));
}
export function auditSource(entry, root = process.cwd()) {
  const {source} = loadAuditStatus(root);
  return {publisher: source.publisher, title: source.title, url: source.url,
    table: `table for the ${auditDate(entry.backstop)} backstop; updated ${auditDate(source.published_or_updated)}; information as at ${auditDate(source.data_cut_off)}; ${source.licence}`};
}
export const auditFootnote = (root = process.cwd()) => `Footnote printed by MHCLG for the asterisk: ${loadAuditStatus(root).footnote.printed}`;
