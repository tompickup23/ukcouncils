import {describe, it, expect} from 'vitest';
import {readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {loadNotices, validateNotices, NOTICE_PATHS, NOTICE_COVERAGE, NOTICE_ABSENCE, noticeLine, noticeSource} from '../scripts/lib/section-114-data.mjs';
import {section114Checks} from '../scripts/lib/section-114-checks.mjs';
import {loadDossier} from '../scripts/lib/dossier-state.mjs';

const {register, profiles} = loadNotices();
describe('original notice register admission', () => {
  it('keeps each original separate and preserves the printed subsection', () => {
    expect(register.records).toHaveLength(11);
    expect(profiles.size).toBe(8);
    expect(profiles.get('E08000025').map((row: any) => row.provision)).toEqual(['114 (3)', '114 (2)']);
    expect(profiles.get('E09000008').map((row: any) => row.notice_date)).toEqual(['2020-11-11', '2020-12-02', '2022-11-22']);
    expect(profiles.get('E09000003')[0].provision).toBe('114 (2)(a)');
    expect(profiles.get('E06000057')[0].provision).toBe('114(2)');
    // Every original downloads with a browser user agent, so every record carries its hash.
    expect(register.records.filter((row: any) => row.original_sha256 === null)).toEqual([]);
    expect(register.records.every((row: any) => row.inspection === 'original PDF read')).toBe(true);
    expect(profiles.has('E07000117')).toBe(false);
  });
  it('rejects unexpected personal, narrative and status fields at every level', () => {
    for (const key of ['signature', 'person', 'amount', 'cause', 'explanation', 'withdrawn']) {
      for (const target of ['root', 'record', 'identity', 'locator']) {
        const changed = structuredClone(register);
        const obj = target === 'root' ? changed : target === 'record' ? changed.records[0] : changed.records[0][target];
        obj[key] = 'Forbidden field';
        expect(() => validateNotices(changed)).toThrow('Unexpected notice fields');
      }
    }
  });
  it('rejects unreviewed identities, inferred provisions and invented retrieval hashes', () => {
    const changes: Array<(row: any) => void> = [
      row => {row.identity.status = 'native';}, row => {row.identity.profile_slug = 'burnley';},
      row => {row.gss = 'E07000117';}, row => {row.provision = '114';},
      row => {row.url = 'https://example.com/notice.pdf';}, row => {row.locator.pages = [];},
      row => {row.original_sha256 = null;}, row => {row.notice_date = '2022-02-30';},
      row => {row.locator.paragraphs = ['Unreviewed narrative'];}, row => {row.printed_date = '1 January 2000';},
    ];
    for (const mutate of changes) {
      const changed = structuredClone(register); mutate(changed.records[0]);
      expect(() => validateNotices(changed)).toThrow();
    }
    const duplicate = structuredClone(register); duplicate.records.push(duplicate.records[0]);
    expect(() => validateNotices(duplicate)).toThrow('Duplicate notice');
  });
  it('requires a pinned file and rejects unexpected manifest fields and paths', () => {
    const root = mkdtempSync(join(tmpdir(), 'ukc-notices-'));
    const put = (path: string, content: string) => {mkdirSync(dirname(join(root, path)), {recursive: true}); writeFileSync(join(root, path), content);};
    try {
      for (const path of [...NOTICE_PATHS, 'data/registry/councils.json', 'data/council-tax/england-2026-27.json']) put(path, readFileSync(path, 'utf8'));
      expect(loadNotices(root).profiles.size).toBe(8);
      put(NOTICE_PATHS[1], JSON.stringify({...register, reviewed: '2026-11-19'}));
      expect(() => loadNotices(root)).toThrow('Unpinned notice file');
      put(NOTICE_PATHS[1], readFileSync(NOTICE_PATHS[1], 'utf8'));
      const manifest = JSON.parse(readFileSync(NOTICE_PATHS[0], 'utf8'));
      put(NOTICE_PATHS[0], JSON.stringify({...manifest, extra: true}));
      expect(() => loadNotices(root)).toThrow('Unexpected notice fields');
      manifest.files[0].path = 'data/budget/unreviewed.json';
      put(NOTICE_PATHS[0], JSON.stringify(manifest));
      expect(() => loadNotices(root)).toThrow();
    } finally {rmSync(root, {recursive: true, force: true});}
  });
});

const fixture = (gss = 'E08000025') => {
  const rows = profiles.get(gss) ?? [];
  const citation = (row: any) => {const s = noticeSource(row); return `<a href="${s.url}">${s.publisher}, ${s.title}</a>, ${s.table}.`;};
  return `<main>${rows.length ? `<section id="financial-notices"><h2>Section 114 documents</h2><p>${NOTICE_COVERAGE}</p><ul>${rows.map((row: any) =>
    `<li data-notice-id="${row.id}"><p data-notice-line>${noticeLine(row)}</p><p data-citation-record='${JSON.stringify(noticeSource(row))}'>Source: ${citation(row)}</p><p>Historical document record.</p></li>`).join('')}</ul></section><ul data-profile-sources>${rows.map((row: any) => `<li data-citation-entry="${row.id}">${citation(row)}</li>`).join('')}</ul>`
    : `<li data-dossier-absence="notices"><strong>Statutory financial notices:</strong> ${NOTICE_ABSENCE}</li>`}</main>`;
};

describe('section 114 built page guard', () => {
  it('checks every admitted profile and the single true reason on all other profiles', () => {
    const dossier = loadDossier(process.cwd(), '2026-11-18');
    for (const profile of dossier.profiles) {
      const part = profile.parts.find(part => part.key === 'notices')!;
      expect(section114Checks(fixture(profile.gss), profile.gss), profile.slug).toEqual([]);
      expect(part.state).toBe(profiles.has(profile.gss) ? 'built' : 'absent');
      expect(part.reason).toBe(profiles.has(profile.gss) ? null : NOTICE_ABSENCE);
      expect(part.decision).toBeNull();
    }
  });
  it('fails on dates, provisions, locators, missing records, duplicate records and wrong council links', () => {
    for (const [before, after] of [
      ['5 September 2023', '6 September 2023'], ['section 114 (2)', 'section 114 (3)'],
      ['Page 1', 'Page 2'], ['Historical document record.', 'Current document record.'],
      ['www.birmingham.gov.uk', 'www.slough.gov.uk'], ['data-notice-id', 'data-unused'],
      ['<section id="financial-notices">', '<section hidden id="financial-notices">'],
      [NOTICE_COVERAGE, ''],
    ]) expect(section114Checks(fixture().replace(before, after), 'E08000025')).not.toEqual([]);
    expect(section114Checks(fixture().replace('</ul></section>', '<li data-notice-id="extra">Extra document</li></ul></section>'), 'E08000025')).toContain('Notice presence differs from pinned records');
    expect(section114Checks('<main></main>', 'E08000025')).toContain('Notice presence differs from pinned records');
  });
  it('rejects a notice on a profile without a pinned record, even with its marker removed', () => {
    expect(section114Checks(fixture(), 'E07000117')).toContain('Notice presence differs from pinned records');
    const text = '<p>5 September 2023: report under section 114 (3) of the Local Government Finance Act 1988.</p>';
    expect(section114Checks(fixture('E07000117') + text, 'E07000117')).toContain('Notice claim outside pinned record or exact absence wording');
  });
  it('rejects negative claims anywhere, including metadata and extra text inside permitted nodes', () => {
    for (const claim of ['No notice exists.', 'No section 114 notice was issued.', 'The council has never issued a notice.', 'Section 114: none issued.', 'No statutory financial report exists.']) {
      for (const gss of ['E07000117', 'E08000025']) {
        expect(section114Checks(fixture(gss) + `<p>${claim}</p>`, gss)).not.toEqual([]);
        expect(section114Checks(`<meta name="description" content="${claim}">` + fixture(gss), gss)).not.toEqual([]);
        expect(section114Checks(fixture(gss).replace('</li>', `${claim}</li>`), gss)).not.toEqual([]);
      }
    }
  });
  it('rejects claims that avoid the word section, and claims carried in any attribute', () => {
    for (const claim of ['No 114 report has been issued.', 'A report was made under 114(3).', 'This council has never made a report under the 1988 Act.', 'No report under the Local Government Finance Act 1988.']) {
      for (const gss of ['E07000117', 'E08000025']) expect(section114Checks(fixture(gss) + `<p>${claim}</p>`, gss), claim).not.toEqual([]);
    }
    for (const attribute of ['data-share-text', 'placeholder', 'value', 'data-description', 'aria-label']) {
      expect(section114Checks(fixture('E07000117') + `<div ${attribute}="No section 114 notice exists."></div>`, 'E07000117'), attribute).not.toEqual([]);
    }
  });
  it('does not read an amount, a count or an address as a section number', () => {
    for (const text of ['Band D is £2,114.50 in 2026/27.', 'The council made 114 payments in the report period.'.replace('114 payments', '1,114 payments'), 'A total of 3114 records were issued.']) {
      expect(section114Checks(fixture('E07000117') + `<p>${text}</p>`, 'E07000117'), text).toEqual([]);
    }
    expect(section114Checks(fixture('E07000117') + '<a href="/reports/114/issued">Budget</a>', 'E07000117')).toEqual([]);
  });
  it('rejects a missing, false, hidden or duplicate absence explanation', () => {
    const html = fixture('E07000117');
    for (const altered of [html.replace(NOTICE_ABSENCE, 'Original download blocked.'), html.replace('<li ', '<li hidden '), html.replace('<li ', '<li aria-hidden="true" '), html.replace(NOTICE_ABSENCE, ''), html + html]) {
      expect(section114Checks(altered, 'E07000117')).not.toEqual([]);
    }
  });
  it('allows an exact existing election citation without exempting its surrounding prose', () => {
    const elections = JSON.parse(readFileSync('data/elections/next-elections.json', 'utf8')).councils;
    // The exception applies to any election record, so pin the profiles that need it.
    // A new source title with notice wording must be reviewed here before it is exempt.
    expect(Object.entries(elections).filter(([, row]: any) => /notices?|114|1988/i.test(row.sourceLabel)).map(([gss]) => gss).sort())
      .toEqual(['E06000062', 'E07000098', 'E07000121', 'E07000170']);
    for (const [gss, row] of Object.entries(elections) as [string, {sourceLabel: string; sourceUrl: string}][]) {
      if (!/notices/i.test(row.sourceLabel)) continue;
      const link = `<p><a href="${row.sourceUrl}">${row.sourceLabel}</a></p>`;
      expect(section114Checks(fixture(gss) + link, gss)).toEqual([]);
      expect(section114Checks(fixture(gss) + link.replace('</p>', 'No notice exists.</p>'), gss)).not.toEqual([]);
      // The citation attribute may repeat the pinned title and address, and nothing else.
      const record = (extra = {}) => `<p data-citation-record='${JSON.stringify({publisher: 'Council', title: row.sourceLabel, url: row.sourceUrl, table: 'checked', ...extra})}'></p>`;
      expect(section114Checks(fixture(gss) + record(), gss)).toEqual([]);
      // As built: the label is the publisher and the title joined with a comma.
      const [publisher, ...rest] = row.sourceLabel.split(', ');
      expect(section114Checks(fixture(gss) + record({publisher, title: rest.join(', ')}), gss)).toEqual([]);
      expect(section114Checks(fixture(gss) + record({publisher, title: rest.join(', '), url: 'https://example.com/'}), gss)).not.toEqual([]);
      expect(section114Checks(fixture(gss) + record({table: 'No section 114 notice exists'}), gss)).not.toEqual([]);
      expect(section114Checks(fixture(gss) + record({title: row.sourceLabel + ' and no notice was issued'}), gss)).not.toEqual([]);
    }
  });
});
