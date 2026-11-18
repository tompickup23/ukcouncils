import {loadComposition, COMPOSITION_PATHS, compositionAbsence} from './composition-data.mjs';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {readFeed, selectCalendar} from '../calendar-contract.mjs';

export const ITEMS = ['D1', 'D3', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9'];
export const STATES = ['built', 'absent', 'out-of-scope'];
// Tom's instruction for this gate authorises these defaults, not the held data.
export const DECISIONS = {
  audit: 'Audit identity method, measure and PSAA reuse',
  notices: 'Non-exhaustive original statutory notice register',
  bodies: 'Additional body types in the January scope',
  contracts: 'Contracts in the January scope',
};
export const DECIDE_BY = '2026-12-15';
export const DEFAULT_AUTHORITY = 'Tom: dossier gate task, 15 November 2026; docs/DOSSIER-GATE.md';
export function decisionState(key, today) {
  if (!Object.hasOwn(DECISIONS, key)) throw new Error(`Unknown dossier decision ${key}`);
  return today > DECIDE_BY ? 'out-of-scope' : 'absent';
}

const cache = new Map();

/** Read committed inputs, never live services. Hashes identify the exact build inputs. */
export function loadDossier(root = process.cwd(), today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/London'}).format(new Date())) {
  const cacheKey = `${root}|${today}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);
  const pins = {};
  const read = path => {
    const bytes = readFileSync(join(root, path));
    pins[path] = createHash('sha256').update(bytes).digest('hex');
    return JSON.parse(bytes);
  };
  const registry = read('data/registry/councils.json');
  const tax = read('data/council-tax/england-2026-27.json');
  const budget = read('data/budget/ra-2026-27.json');
  const population = read('data/population/mye25-population.json');
  const collection = read('data/collection/collection-rates-2025-26.json');
  const elections = read('data/elections/next-elections.json');
  const composition = loadComposition(root);
  for (const path of COMPOSITION_PATHS) read(path);
  const efs = read('data/efs/statements.json');
  const programmes = read('data/reorganisation/areas.json');
  read('data/reorganisation/sources.json');
  const spending = read('data/spending/aidoge-summaries.json');
  const functions = read('data/services/functions.json');
  const links = read('data/links/local-links.json');
  const manifest = read('data/school-holidays/manifest.json');
  const calendarPath = `data/school-holidays/${manifest.file}`;
  read(calendarPath);
  const {feed} = readFeed(join(root, 'data/school-holidays'));
  const rows = Object.keys(tax.authorities).map(gss => {
    const council = registry.councils[gss];
    if (!council) throw new Error(`No registry identity for ${gss}`);
    const parts = [];
    const add = (item, key, label, present, markers, paths, reason, decision = null) => {
      const state = present ? 'built' : decision ? decisionState(decision, today) : 'absent';
      parts.push({item, key, label, state, markers, sources: paths.map(path => ({path, sha256: pins[path]})),
        reason: present ? null : reason, absenceKind: present ? null : decision ? 'held' : 'no-source', decision: state === 'out-of-scope' ? {key: decision, authority: DEFAULT_AUTHORITY, effective: '2026-12-16'} : null});
    };
    const row = budget.councils[gss];
    const hasBudget = row?.status === 'available';
    const hasEfs = Object.values(efs.authorities).some(authority => authority.slug === council.slug);
    add('D1', 'summary', 'Council summary', true, ['data-profile-summary', 'data-council-actions', 'id=council-tax'], ['data/council-tax/england-2026-27.json', 'data/registry/councils.json'], null);
    add('D1', 'population', 'Population', population.areas[gss]?.allAges > 0, ['data-profile-population'], ['data/population/mye25-population.json'], 'No matching population observation is held for this profile.');
    add('D1', 'budget-headline', 'Budget headline', hasBudget && row.values.servicetot != null && row.values.servicetot !== 0, ['data-summary-tile=budget'], ['data/budget/ra-2026-27.json'], 'No non-zero total service expenditure is held from the published budget return.');
    add('D3', 'citations', 'Sources and citations', true, ['id=sources', 'data-citation-record'], ['data/council-tax/england-2026-27.json'], null);
    add('C1', 'profile', 'Council profile', true, ['id=about', 'id=similar', 'data-council-type'], ['data/registry/councils.json', 'data/council-tax/england-2026-27.json'], null);
    add('C2', 'elections', 'Scheduled elections', Boolean(elections.councils[gss]), ['id=elections'], ['data/elections/next-elections.json'], 'No verified election schedule is held for this profile.');
    const seats = composition.profiles.get(gss);
    if (!seats || seats.slug !== council.slug) throw new Error(`Composition profile identity mismatch ${gss}`);
    add('C2', 'composition', 'Seats by party', seats.seatsAdmitted, ['id=composition', 'data-composition-table'], COMPOSITION_PATHS, compositionAbsence(seats, 'seats'));
    add('C2', 'control', 'Control', seats.controlAdmitted, ['data-composition-control'], COMPOSITION_PATHS, compositionAbsence(seats, 'control'));
    add('C3', 'budget', 'Budget and reserves', hasBudget, ['id=budget'], ['data/budget/ra-2026-27.json'], 'No budget return is held for this council in the pinned release.');
    add('C3', 'efs', 'Exceptional Financial Support', hasEfs, ['id=exceptional-financial-support'], ['data/efs/statements.json'], 'This council is not in the pinned support list. This is not evidence that it has received no support.');
    add('C3', 'spending', 'Published payments', Boolean(spending.bodies[gss]?.generated), ['id=spending'], ['data/spending/aidoge-summaries.json'], 'No dated published payments summary is held for this profile.');
    add('C3', 'audit', 'External audit status', false, ['id=audit-status'], [], 'Audit status is held pending an approved identity method and source reuse decision.', 'audit');
    add('C3', 'notices', 'Statutory financial notices', false, ['id=financial-notices'], [], 'Statutory financial notices are held pending a decision on an original-document register. No negative status is inferred.', 'notices');
    const programme = programmes.areas.some(area => area.councils.some(body => body.gss === gss && body.role !== 'county'));
    add('C4', 'programme', 'Local government programme documents', programme, ['id=reorganisation'], ['data/reorganisation/areas.json', 'data/reorganisation/sources.json'], 'No independently sourced programme panel is held for this profile.');
    // The withdrawn registry field is never evidence for an independent panel.
    add('C5', 'holidays', 'School holidays', Boolean(selectCalendar(feed, council)), ['id=school-holidays'], [calendarPath, 'data/school-holidays/manifest.json'], 'No publishable calendar is held in the pinned school holidays snapshot. Check the school for its dates.');
    add('C5', 'functions', 'Council responsibilities', !functions.excludedGss.includes(gss), ['data-council-functions'], ['data/services/functions.json'], 'The general responsibilities table has no reviewed mapping for this special authority.');
    add('C6', 'services', 'Official service links', Object.keys(links.councils[gss] ?? {}).length > 0, ['data-council-service'], ['data/links/local-links.json'], 'No checked official service link is held for this profile.');
    add('C7', 'bodies', 'Other authority profiles', false, ['id=other-authority-profiles'], [], 'Additional body types await a scope decision and a suitable sourced register.', 'bodies');
    const collected = collection.councils[gss];
    add('C8', 'collection', 'Council tax collection', Boolean(collected && [collected.rate, collected.olderArrears, collected.yearArrears, collected.totalArrears].some(value => value !== null)), ['id=collection'], ['data/collection/collection-rates-2025-26.json'], 'No collection observation is held in the pinned official table.');
    add('C8', 'comparison', 'Same-class Band D comparison', typeof tax.authorities[gss].bands.D === 'number', ['id=tax-summary'], ['data/council-tax/england-2026-27.json'], 'No comparable published Band D observation is held.');
    add('C9', 'contracts', 'Public contracts', false, ['id=contracts'], [], 'Contracts await a scope decision, a verified public destination and a pinned contract source. Payments are a separate record.', 'contracts');
    const items = Object.fromEntries(ITEMS.map(item => {
      const children = parts.filter(part => part.item === item);
      const state = children.some(part => part.state === 'absent') ? 'absent' : children.some(part => part.state === 'out-of-scope') ? 'out-of-scope' : 'built';
      return [item, {state, parts: children.map(part => part.key)}];
    }));
    return {gss, slug: council.slug, items, parts};
  });
  const result = {date: today, pins, profiles: rows};
  cache.set(cacheKey, result);
  return result;
}
