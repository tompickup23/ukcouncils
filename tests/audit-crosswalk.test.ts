import {describe, it, expect} from 'vitest';
import {readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {AUDIT_PATHS, INPUT_PATHS, loadAuditCrosswalk, normaliseAuditName, rebuildAuditCrosswalk} from '../scripts/lib/audit-crosswalk.mjs';

const data = loadAuditCrosswalk();
type Json = Record<string, any>;
function fixture(run: (root: string, change: (path: string, mutate: (value: Json) => void, repin?: boolean) => void) => void) {
  const root = mkdtempSync(join(tmpdir(), 'ukc-audit-'));
  try {
    for (const path of [...AUDIT_PATHS, ...INPUT_PATHS]) {
      mkdirSync(dirname(join(root, path)), {recursive: true});
      writeFileSync(join(root, path), readFileSync(path));
    }
    const change = (path: string, mutate: (value: Json) => void, repin = false) => {
      const value = JSON.parse(readFileSync(join(root, path), 'utf8'));
      mutate(value);
      const bytes = JSON.stringify(value);
      writeFileSync(join(root, path), bytes);
      if (repin) {
        const manifest = JSON.parse(readFileSync(join(root, AUDIT_PATHS[0]), 'utf8'));
        const file = [...manifest.files, ...manifest.inputs].find((file: Json) => file.path === path);
        file.sha256 = createHash('sha256').update(bytes).digest('hex');
        writeFileSync(join(root, AUDIT_PATHS[0]), JSON.stringify(manifest));
      }
    };
    run(root, change);
  } finally {rmSync(root, {recursive: true, force: true});}
}

describe('pinned MHCLG identity crosswalk', () => {
  it('reproduces the research and counts unique profiles across repeated cohorts', () => {
    const d = data.dryRun;
    expect(d.profileCount).toBe(296);
    expect([d.sourceLabels, d.sourceRows, d.tier1Labels, d.tier2Labels]).toEqual([120, 150, 69, 51]);
    expect([d.combined.tier1.count, d.combined.tier2.count, d.combined.tier2Additional, d.combined.reached.count]).toEqual([69, 11, 10, 79]);
    expect(d.combined.profilesOnNoList).toHaveLength(217);
    expect(d.unresolvedLabels).toEqual([]);
    expect(d.byTable.map((table: Json) => [table.sourceRows, table.tier1.count, table.tier2.count, table.reached.count, table.profilesOnNoList.length]))
      .toEqual([[67, 45, 5, 50, 246], [50, 30, 2, 32, 264], [33, 14, 5, 19, 277]]);
    expect(d.notBillingProfilesByClass.map((row: Json) => [row.bodyClass, row.labels.length]))
      .toEqual([['county', 5], ['police', 12], ['fire', 6], ['pension-fund', 1], ['combined-authority', 3], ['other', 13]]);
    const reached = new Set(d.combined.reached.profiles);
    expect(d.combined.profilesOnNoList.every((row: Json) => !reached.has(row.gss))).toBe(true);
  });
  it('performs only the three approved normalisations', () => {
    expect(normaliseAuditName('A & B Council')).toBe('a and b');
    expect(normaliseAuditName(' A  Council ')).toBe(' a  council ');
    expect(normaliseAuditName('A Council Council')).toBe('a council');
    expect(normaliseAuditName('Basildon Borough Council *')).toBe('basildon borough council *');
    expect(normaliseAuditName('Bexley London Borough Council')).not.toBe(normaliseAuditName('London Borough of Bexley'));
  });
  it('preserves qualifiers and never assigns historical or pension identities to main accounts', () => {
    const excluded = data.crosswalk.unassigned;
    expect(excluded.find((row: Json) => row.label.startsWith('London Borough of Merton')).bodyClass).toBe('pension-fund');
    expect(excluded.find((row: Json) => row.label === 'North Yorkshire County Council').bodyClass).toBe('county');
    expect(excluded.find((row: Json) => row.label === 'Copeland Borough Council').bodyClass).toBe('other');
    const warrington = data.crosswalk.profiles.find((row: Json) => row.gss === 'E06000007')!;
    expect(warrington.labels.map((row: Json) => row.tier).sort()).toEqual([1, 2]);
    expect(data.source.discrepancy).toContain('67 body rows');
    expect(data.source.discrepancy).toContain('68 bodies');
    expect(data.dryRun.rendered).toBe(false);
  });
  it('rejects extra fields even after the file is repinned', () => fixture((root, change) => {
    change(AUDIT_PATHS[2], value => {value.profiles[0].labels[0].auditFirm = 'Excluded field';}, true);
    expect(() => loadAuditCrosswalk(root)).toThrow('Unexpected audit fields');
  }));
  it('rejects values changed without the manifest pin, including after a successful load', () => fixture((root, change) => {
    loadAuditCrosswalk(root);
    change(AUDIT_PATHS[2], value => {value.profiles[0].officialName = 'Changed';});
    expect(() => loadAuditCrosswalk(root)).toThrow('Unpinned audit file');
  }));
  it('rejects duplicate profile codes even after repinning', () => fixture((root, change) => {
    change(AUDIT_PATHS[2], value => {value.profiles.push(value.profiles[0]);}, true);
    expect(() => loadAuditCrosswalk(root)).toThrow('Duplicate profile code');
  }));
  it('rejects duplicate tier 2 assignments before grouping labels into profiles', () => fixture((root, change) => {
    change(AUDIT_PATHS[1], value => {
      const assigned = value.rows.filter((row: Json) => row.decision === 'assigned');
      assigned[1].gss = assigned[0].gss;
    }, true);
    expect(() => rebuildAuditCrosswalk(root)).toThrow('Duplicate profile code');
  }));
  it('rejects a reassigned label that disagrees with the pinned review', () => fixture((root, change) => {
    change(AUDIT_PATHS[2], value => {
      const profiles = value.profiles.filter((profile: Json) => profile.labels.some((row: Json) => row.tier === 2));
      const first = profiles[0].labels.findIndex((row: Json) => row.tier === 2);
      const second = profiles[1].labels.findIndex((row: Json) => row.tier === 2);
      [profiles[0].labels[first], profiles[1].labels[second]] = [profiles[1].labels[second], profiles[0].labels[first]];
    }, true);
    expect(() => loadAuditCrosswalk(root)).toThrow('Audit crosswalk does not reproduce');
  }));
  it('rejects a tier 2 assignment without evidence even after repinning', () => fixture((root, change) => {
    change(AUDIT_PATHS[1], value => {value.rows.find((row: Json) => row.decision === 'assigned').evidence = [];}, true);
    expect(() => loadAuditCrosswalk(root)).toThrow('Missing audit evidence');
    expect(() => rebuildAuditCrosswalk(root)).toThrow('Missing audit evidence');
  }));
  it('rejects missing URL, retrieval date or explanatory evidence', () => {
    for (const key of ['url', 'retrieved', 'quote', 'note']) fixture((root, change) => {
      change(AUDIT_PATHS[1], value => {value.rows[0].evidence[0][key] = '';}, true);
      expect(() => loadAuditCrosswalk(root)).toThrow('Missing audit evidence');
    });
  });
  it('rejects an unpinned file inventory and a changed dry run', () => {
    fixture((root, change) => {
      change(AUDIT_PATHS[0], value => {value.files.pop();});
      expect(() => loadAuditCrosswalk(root)).toThrow('Unexpected audit file inventory');
    });
    fixture((root, change) => {
      change(AUDIT_PATHS[3], value => {value.combined.reached.count++;}, true);
      expect(() => loadAuditCrosswalk(root)).toThrow('Audit dry run does not reproduce');
    });
  });
  it('stops if a registry identity changes the tier 1 count', () => fixture((root, change) => {
    const gss = data.dryRun.combined.tier1.profiles[0];
    change(INPUT_PATHS[2], value => {value.councils[gss].officialName = 'Unmatched identity';}, true);
    expect(() => rebuildAuditCrosswalk(root)).toThrow('Tier 1 count changed; stop and report');
  }));
  it('stops instead of choosing an ambiguous tier 1 identity', () => fixture((root, change) => {
    const gss = data.dryRun.combined.tier1.profiles[0];
    const other = data.dryRun.combined.profilesOnNoList[0].gss;
    change(INPUT_PATHS[2], value => {value.councils[other].officialName = value.councils[gss].officialName;}, true);
    expect(() => rebuildAuditCrosswalk(root)).toThrow('Ambiguous tier 1 identity; stop and report');
  }));
  it('rebuilds derived files byte for byte from the pinned inputs and review', () => fixture(root => {
    rebuildAuditCrosswalk(root);
    for (const path of AUDIT_PATHS) expect(readFileSync(join(root, path), 'utf8')).toBe(readFileSync(path, 'utf8'));
  }));
});
