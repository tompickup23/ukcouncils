import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {loadAuditCrosswalk} from '../scripts/lib/audit-crosswalk.mjs';
import {loadAuditStatus, auditAbsence, auditLine, auditAnswers, auditSource, auditFootnote, AUDIT_ABSENCE, AUDIT_ABSENCE_CAUSES, AUDIT_HEADING, AUDIT_COVERAGE} from '../scripts/lib/audit-status.mjs';
import {auditChecks, firmChecks, mentionsAudit, auditFirmNames} from '../scripts/lib/audit-checks.mjs';
import {loadDossier} from '../scripts/lib/dossier-state.mjs';

type Json = Record<string, any>;
const status = loadAuditStatus();
const {crosswalk} = loadAuditCrosswalk();
const dossier = loadDossier(process.cwd(), '2026-11-18');
const research = JSON.parse(readFileSync('docs/dossier-sources-2026-11/audit-mhclg-tables.json', 'utf8'));
const GLOUCESTER = 'E07000081', BASILDON = 'E07000066', BURNLEY = 'E07000117', NORTH_YORKSHIRE = 'E06000065', MERTON = 'E09000024';

const citation = (entry: Json) => {const s = auditSource(entry); return `<a href="${s.url}">${s.publisher}, ${s.title}</a>, ${s.table}.`;};
const fixture = (gss: string) => {
  const entries = status.profiles.get(gss) ?? [];
  if (!entries.length) return `<main><li data-dossier-absence="audit"><strong>External audit status:</strong> ${auditAbsence(gss).reason}</li></main>`;
  return `<main><a href="#audit-status">${AUDIT_HEADING}</a><section id="audit-status"><h2>${AUDIT_HEADING}</h2><p>${AUDIT_COVERAGE}</p><ul>${entries.map((entry: Json) =>
    `<li data-audit-entry="${entry.backstop}"><p data-audit-line>${auditLine(entry)}</p><dl>${auditAnswers(entry).map((row: Json) => `<div><dt>${row.question}</dt><dd>${row.answer}</dd></div>`).join('')}</dl>`
    + `${entry.asterisk ? `<p data-audit-footnote>${auditFootnote()}</p>` : ''}<p data-citation-record='${JSON.stringify(auditSource(entry))}'>Source: ${citation(entry)}</p></li>`).join('')}</ul></section>`
    + `<ul data-profile-sources>${entries.map((entry: Json) => `<li data-citation-entry="x">${citation(entry)}</li>`).join('')}</ul></main>`;
};

describe('audit status dossier state', () => {
  it('builds exactly the 79 profiles with pinned values and gives every other profile one true reason', () => {
    const counts: Record<string, number> = {};
    for (const profile of dossier.profiles) {
      const part = profile.parts.find((row: Json) => row.key === 'audit')!;
      const entries = status.profiles.get(profile.gss) ?? [];
      expect(part.state, profile.slug).toBe(entries.length ? 'built' : 'absent');
      const key = entries.length ? 'built' : auditAbsence(profile.gss).cause;
      counts[key] = (counts[key] ?? 0) + 1;
      expect(part.reason).toBe(entries.length ? null : auditAbsence(profile.gss).reason);
      expect(auditChecks(fixture(profile.gss), profile.gss), profile.slug).toEqual([]);
    }
    expect(counts).toEqual({built: 79, 'no-row': 215, predecessor: 1, 'pension-fund': 1});
  }, 30000);
  it('uses the no-row reason only where no crosswalk label of any kind names the profile', () => {
    const labelled = new Set(crosswalk.profiles.map((row: Json) => row.gss));
    for (const profile of dossier.profiles) {
      if (labelled.has(profile.gss)) continue;
      expect(auditAbsence(profile.gss).reason === AUDIT_ABSENCE['no-row'], profile.slug).toBe(!(profile.gss in AUDIT_ABSENCE_CAUSES));
    }
  });
  it('names the North Yorkshire predecessor as printed, on the 13 December 2024 list, without its values', () => {
    const {cause, reason} = auditAbsence(NORTH_YORKSHIRE);
    expect(cause).toBe('predecessor');
    const row = crosswalk.unassigned.find((item: Json) => item.label === 'North Yorkshire County Council')!;
    expect(row.occurrences).toEqual([{backstop: '2024-12-13', row: 44}]);
    expect(reason).toContain('No row for the present council is held.');
    expect(reason).toContain('A predecessor body, North Yorkshire County Council, has a row on the list for the 13 December 2024 backstop');
    expect(status.profiles.has(NORTH_YORKSHIRE)).toBe(false);
    for (const answer of research.tables[1].rows[44].slice(1)) if (/\d/.test(answer)) expect(reason).not.toContain(answer);
  });
  it('limits the Merton reason to its pension fund row and repeats nothing from that row', () => {
    const {cause, reason} = auditAbsence(MERTON);
    expect(cause).toBe('pension-fund');
    const row = crosswalk.unassigned.find((item: Json) => item.label === AUDIT_ABSENCE_CAUSES[MERTON].label)!;
    expect(row.bodyClass).toBe('pension-fund');
    expect(row.occurrences).toEqual([{backstop: '2026-02-27', row: 14}]);
    expect(reason).toContain("The council's main accounts have no row on those lists.");
    expect(reason).not.toMatch(/was published|main accounts was/);
  });
  it('builds Cumberland from its own rows only; its predecessor row is never attached', () => {
    expect(status.profiles.get('E06000063').map((entry: Json) => entry.label)).toEqual(['Cumberland Council', 'Cumberland Council']);
    expect(status.profiles.get('E06000063').some((entry: Json) => entry.backstop === '2024-12-13')).toBe(false);
  });
  it('keeps every absence reason free of a positive or negative statement about audits', () => {
    const verdicts = /\b(?:failed|late|behind|overdue|clean|qualified|unqualified|delayed|on time|up to date|compliant|disclaim\w*|modified)\b/i;
    for (const reason of [AUDIT_ABSENCE['no-row'], AUDIT_ABSENCE.predecessor('North Yorkshire County Council'), AUDIT_ABSENCE['pension-fund']]) {
      expect(reason).not.toMatch(verdicts);
      expect(reason).toContain('PSAA');
      expect(reason).toMatch(/not a statement about (?:its|this council's) audits/);
    }
    for (const text of [AUDIT_COVERAGE, auditFootnote()]) expect(text).not.toMatch(/\b(?:failed|late|behind|overdue)\b/i);
  });
});

describe('audit status built page guard', () => {
  it('checks lines on a profile on all three tables and the footnote on a starred label', () => {
    expect(status.profiles.get(GLOUCESTER)).toHaveLength(3);
    expect(auditChecks(fixture(GLOUCESTER), GLOUCESTER)).toEqual([]);
    expect(fixture(BASILDON)).toContain('*These bodies and their appointed audit firms');
    expect(auditChecks(fixture(BASILDON).replace(/<p data-audit-footnote>.*?<\/p>/, ''), BASILDON)).not.toEqual([]);
  });
  it('fails on an altered answer, question, date, backstop, link, extra line or hidden section', () => {
    const html = fixture(GLOUCESTER);
    for (const [before, after] of [
      ['<dd>yes</dd>', '<dd>no</dd>'], ['Backstop 13 December 2024', 'Backstop 14 December 2024'],
      ['Audit opinion delivered by 28 February 2025?', 'Audit opinion delivered?'],
      ['data-audit-entry="2025-02-28"', 'data-audit-entry="2025-03-01"'],
      ['www.gov.uk', 'example.com'], ['<section id="audit-status">', '<section hidden id="audit-status">'],
      [AUDIT_COVERAGE, ''],
    ]) expect(auditChecks(html.replace(before, after), GLOUCESTER), before).not.toEqual([]);
    expect(auditChecks(html.replace('</ul></section>', '<li data-audit-entry="2027-01-01">Extra</li></ul></section>'), GLOUCESTER)).toContain('Audit lines differ from pinned values');
    expect(auditChecks('<main></main>', GLOUCESTER)).toContain('Audit lines differ from pinned values');
  });
  it('fails an audit line on a profile without a pinned value, with or without its marker', () => {
    expect(auditChecks(fixture(GLOUCESTER), BURNLEY)).toContain('Audit lines differ from pinned values');
    const stray = `<p>${auditLine(status.profiles.get(GLOUCESTER)[0])} All audit opinions delivered by 13 December 2024? yes</p>`;
    expect(auditChecks(fixture(BURNLEY) + stray, BURNLEY)).toContain('Audit claim outside pinned values or exact absence wording');
    expect(auditChecks(fixture(NORTH_YORKSHIRE) + '<p>Draft accounts published by 16 January 2025? no</p>', NORTH_YORKSHIRE)).not.toEqual([]);
  });
  it('rejects any positive or negative audit statement on a profile without a row, including metadata', () => {
    for (const claim of ['Its audit is up to date.', 'The accounts were audited on time.', 'This council missed the backstop.', 'Audited accounts: none outstanding.', 'No PSAA concerns.', 'Its statement of accounts was signed off.', 'Draft accounts published.']) {
      for (const gss of [BURNLEY, NORTH_YORKSHIRE, MERTON]) {
        expect(auditChecks(fixture(gss) + `<p>${claim}</p>`, gss), claim).not.toEqual([]);
        expect(auditChecks(`<meta name="description" content="${claim}">` + fixture(gss), gss), claim).not.toEqual([]);
        expect(auditChecks(fixture(gss).replace('</li>', ` ${claim}</li>`), gss), claim).not.toEqual([]);
      }
    }
  });
  it('rejects a missing, wrong, hidden or duplicated absence reason, and another cause\'s reason', () => {
    const html = fixture(BURNLEY);
    for (const altered of [html.replace(AUDIT_ABSENCE['no-row'], 'Audit status is held.'), html.replace('<li ', '<li hidden '), html.replace(AUDIT_ABSENCE['no-row'], ''), html + html]) {
      expect(auditChecks(altered, BURNLEY)).not.toEqual([]);
    }
    expect(auditChecks(fixture(NORTH_YORKSHIRE), BURNLEY)).not.toEqual([]);
    expect(auditChecks(fixture(BURNLEY), NORTH_YORKSHIRE)).not.toEqual([]);
    expect(auditChecks(fixture(BURNLEY), MERTON)).not.toEqual([]);
  });
  it('fails if any audit firm name from the firm column reaches a page, on any page', () => {
    const firms = [...new Set(research.tables.slice(1).flatMap((table: Json) => table.rows.slice(1).map((row: string[]) => row[2])))]
      .filter((name: any) => !name.startsWith('No appointed auditor')) as string[];
    expect(firms.length).toBeGreaterThan(5);
    // Names come from the firm column at run time, so this file holds none of them.
    const names = auditFirmNames();
    expect(names.length).toBeGreaterThan(firms.length);
    const encoded = firms.filter(name => name.includes('&')).map(name => name.replace('&', '&amp;'));
    expect(encoded.length).toBeGreaterThan(0);
    for (const firm of [...names, ...encoded]) {
      expect(firmChecks(`<main><p>Audited by ${firm}.</p></main>`), firm).toEqual(['Audit firm name on page']);
      expect(firmChecks(`<main><div data-share-text="${firm}"></div></main>`), firm).toEqual(['Audit firm name on page']);
      expect(auditChecks(fixture(GLOUCESTER).replace('</section>', `<p>${firm}</p></section>`), GLOUCESTER)).toContain('Audit firm name on page');
    }
    const short = names.reduce((a, b) => a.length <= b.length ? a : b);
    expect(firmChecks(`<main><a href="https://example.com/x+${short}/y" integrity="sha384-ab+${short}/cd">Budget</a></main>`)).toEqual([]);
  });
  it('admits an exact existing election citation titled as accounts, and nothing beside it', () => {
    const elections = JSON.parse(readFileSync('data/elections/next-elections.json', 'utf8')).councils;
    // A new election source title with audit wording must be reviewed here before it is admitted.
    const matching = Object.entries(elections).filter(([, row]: any) => mentionsAudit(row.sourceLabel)).map(([gss]) => gss).sort();
    expect(matching).toEqual(['E07000124']);
    const row = elections.E07000124;
    const link = `<p><a href="${row.sourceUrl}">${row.sourceLabel}</a></p>`;
    expect(auditChecks(fixture('E07000124') + link, 'E07000124')).toEqual([]);
    expect(auditChecks(fixture('E07000124') + link.replace('</p>', ' Its audit is complete.</p>'), 'E07000124')).not.toEqual([]);
    const [publisher, ...rest] = row.sourceLabel.split(', ');
    const record = (extra = {}) => `<p data-citation-record='${JSON.stringify({publisher, title: rest.join(', '), url: row.sourceUrl, table: 'checked', ...extra})}'></p>`;
    expect(auditChecks(fixture('E07000124') + record(), 'E07000124')).toEqual([]);
    expect(auditChecks(fixture('E07000124') + record({table: 'audited on time'}), 'E07000124')).not.toEqual([]);
    expect(auditChecks(fixture(BURNLEY) + link, BURNLEY)).not.toEqual([]);
  });
  it('detects audit wording but not ordinary budget prose', () => {
    expect(mentionsAudit('The council budget for 2026/27.')).toBe(false);
    for (const text of ['audit', 'audited accounts', 'the backstop date', 'PSAA', 'statement of accounts']) expect(mentionsAudit(text), text).toBe(true);
  });
});
