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
export const AUDIT_COVERAGE = 'MHCLG lists the bodies that did not publish all audited accounts by a backstop date. In its words, publication is "a joint endeavour between bodies and audit firms". The lines below are as printed by the publisher; this site does not correct or reconcile them. Each answer responds to the dated question beside it and is not an audit opinion.';
const HOLDINGS = "This site holds only MHCLG's lists of bodies that did not publish audited accounts by a backstop date.";
const PSAA = 'Per body audit delivery data from Public Sector Audit Appointments (PSAA) is not shown because its reuse terms have not been cleared.';

// One reason for each cause. Each is literally true for every profile it prints on;
// the tests check the cause against the pinned crosswalk for every profile.
export const AUDIT_ABSENCE = {
  'no-row': `${HOLDINGS} This council has no row on those lists. Absence from them is not a statement about its audits. ${PSAA}`,
  'former-name': label => `${HOLDINGS} The list for the 13 December 2024 backstop has a row printed as ${label}, the council's name before 1 April 2023. That row is not shown here. No lines are shown, and that is not a statement about this council's audits. ${PSAA}`,
  'pension-fund': `${HOLDINGS} The council's main accounts have no row on those lists. The list for the 27 February 2026 backstop has a row for the council's pension fund only, which is not shown here. Absence from the lists is not a statement about its audits. ${PSAA}`,
};
// Reviewed causes other than no row. The crosswalk keeps these labels unassigned;
// this map only chooses the reason and never attaches their values to a profile.
export const AUDIT_ABSENCE_CAUSES = {
  // The same council under its name before 1 April 2023 (SI 2022/328, articles 2 and 3(1)).
  // Whether to attach this row as lines is Tom's decision; until then it stays unattached.
  E06000065: {cause: 'former-name', label: 'North Yorkshire County Council', backstop: '2024-12-13'},
  E09000024: {cause: 'pension-fund', label: 'London Borough of Merton (Pension fund only  to  the opinion for the main accounts was published by the backstop)', backstop: '2026-02-27'},
};

export function auditAbsence(gss) {
  const special = AUDIT_ABSENCE_CAUSES[gss];
  if (!special) return {cause: 'no-row', reason: AUDIT_ABSENCE['no-row']};
  const reason = special.cause === 'former-name' ? AUDIT_ABSENCE['former-name'](special.label) : AUDIT_ABSENCE[special.cause];
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

/** The catalogue paragraph on the sources page, pinned by a test and the distribution check. */
export const AUDIT_SOURCES_NOTE = 'These are lists of bodies that did not publish audited accounts by a backstop date, not a census of every body. Each answer is shown as printed by the publisher and responds to the dated question in its column heading; it is not an audit opinion. The appointed audit firm column is not shown. A body name is matched to a council profile only by its official name after three fixed normalisations or by a reviewed official source. Rows printed for a predecessor body, under a council\'s former name, for a pension fund or for another body are not attached to a present council. A council with no lines has a stated reason on its profile, and no statement is made about its audits.';
