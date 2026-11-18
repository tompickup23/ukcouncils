import {describe, it, expect} from 'vitest';
import {readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, dirname} from 'node:path';
import {loadNotices, validateNotices, NOTICE_PATHS} from '../scripts/lib/section-114-data.mjs';

const {register, profiles} = loadNotices();
describe('original notice register admission', () => {
  it('keeps each original separate and preserves the printed subsection', () => {
    expect(register.records).toHaveLength(11);
    expect(profiles.size).toBe(8);
    expect(profiles.get('E08000025').map((row: any) => row.provision)).toEqual(['114 (3)', '114 (2)']);
    expect(profiles.get('E09000008').map((row: any) => row.notice_date)).toEqual(['2020-11-11', '2020-12-02', '2022-11-22']);
    expect(profiles.get('E09000003')[0].provision).toBe('114 (2)(a)');
    expect(profiles.get('E06000057')[0].provision).toBe('114(2)');
    expect(register.records.filter((row: any) => row.original_sha256 === null).map((row: any) => row.id)).toEqual(['E06000039-2021-07-02', 'E08000025-2023-09-05', 'E08000025-2023-09-21']);
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
