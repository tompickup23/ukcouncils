import {describe, it, expect} from 'vitest';
import {readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadComposition, validateComposition, controlCheck, reconciles, compositionAbsence, COMPOSITION_PATHS, COLUMN_LABELS, CONTROL_CAVEAT, controlLabel} from '../scripts/lib/composition-data.mjs';
import {compositionChecks, compositionFieldLeaks} from '../scripts/lib/composition-checks.mjs';
import {compositionSource, snapshotDate} from '../src/lib/composition';
const data = loadComposition();
const snapshot = JSON.parse(readFileSync(COMPOSITION_PATHS[1], 'utf8'));
const review = JSON.parse(readFileSync(COMPOSITION_PATHS[2], 'utf8'));
const chorley = data.profiles.get('E07000118')!;
const burnley = data.profiles.get('E07000117')!;
const fixture = (profile = chorley) => `<main><section id="composition" data-composition-source="${profile.sourceId}">
${profile.controlAdmitted ? `<p data-composition-control>Control as recorded by Open Council Data on ${snapshotDate}: ${controlLabel(profile)}</p><p>${CONTROL_CAVEAT}</p>` : ''}
<table data-composition-table>${Object.entries(COLUMN_LABELS).map(([key, label]) => `<tr data-composition-column="${key}"><th>${label}</th><td>${profile.columns[key]}</td></tr>`).join('')}</table>
<p>Open Council Data English Council Compositions 2026 ${snapshotDate}; compiled by a third party, not an official council return</p>
<p>Other is the publisher's aggregate category. The date is not an effective date certified for each council.</p>
<a href="${data.source.licenceUrl}">CC BY-SA 4.0</a></section></main>`;

describe('pinned composition admission', () => {
  it('keeps the exact expected source coverage and distinct controls', () => {
    expect(snapshot.source.originalSha256).toBe('0b17adb555571dd84424722367f1604e1ce820670d131cac22a03b95f9163c98');
    expect(review.totals).toEqual({profiles: 296, joined: 295, reconciled: 295, seatsAdmitted: 294, controlAdmitted: 129, corroborated: 16, singleSource: 113, controlHeld: 167, controlDisagrees: 22});
    expect(review.unmatched.map((p: {slug: string}) => p.slug)).toEqual(['isles-of-scilly']);
    expect(review.outOfScope).toHaveLength(23);
    expect(data.profiles.get('E09000001')!.seatsAdmitted).toBe(false);
    expect(snapshot.rows.every(reconciles)).toBe(true);
    expect(compositionSource().date).toBeUndefined();
  });
  it('requires a strict majority and never turns unsupported or empty control into a claim', () => {
    const row = {columns: {Lab: 4, Con: 4, LD: 0, Grn: 0, Ref: 0, Oth: 0, Vac: 0, Total: 8}, control: 'LAB'};
    expect(controlCheck(row)).toBe('fails majority check');
    expect(controlCheck({...row, control: 'NOC'})).toBe('passes');
    expect(controlCheck({...row, control: ''})).toBe('empty publisher field');
    for (const control of ['LAB min', 'CON Mayor', 'IND/LD/GRN', 'IND']) expect(controlCheck({...row, control})).toBe('unsupported publisher value');
    expect(reconciles({...row, columns: {...row.columns, Total: 9}})).toBe(false);
    expect(controlCheck({...row, columns: {...row.columns, Lab: 5}, control: 'NOC'})).toBe('fails no overall control check');
  });
  it('rejects imported names and extra fields instead of silently passing them to rendering', () => {
    for (const key of ['councillorName', 'coalition', 'administration', 'leader', 'ward']) {
      const changed = structuredClone(snapshot); changed.rows[0][key] = 'Forbidden field';
      expect(() => validateComposition(changed, review)).toThrow();
    }
    const changed = structuredClone(review);
    changed.profiles.find((p: {slug: string}) => p.slug === 'burnley').controlAdmitted = true;
    expect(() => validateComposition(snapshot, changed)).toThrow();
  });
  it('holds a supported compiler value when the council statement disagrees', () => {
    const changed = structuredClone(review);
    const row = changed.profiles.find((p: {slug: string}) => p.slug === 'chorley');
    row.controlCheck2.outcome = 'disagrees';
    expect(() => validateComposition(snapshot, changed)).toThrow();
    row.controlAdmitted = false;
    expect(validateComposition(snapshot, changed).get(row.gss)!.controlAdmitted).toBe(false);
  });
  it('gives each held control profile the reason that is true for it', () => {
    const held = review.profiles.filter((p: {controlAdmitted: boolean}) => !p.controlAdmitted);
    const reasons = held.map((p: {slug: string}) => compositionAbsence(p, 'control'));
    expect(held).toHaveLength(167);
    expect(reasons.filter((reason: string) => reason.startsWith("The compiler's control label for this council is not one of the single party labels"))).toHaveLength(165);
    // No profile in this snapshot has a printable label contradicted by a council statement.
    expect(reasons.filter((reason: string) => reason.includes('sources disagree'))).toHaveLength(0);
    const chorleyRow = structuredClone(chorley);
    chorleyRow.controlCheck2.outcome = 'disagrees';
    expect(compositionAbsence(chorleyRow, 'control')).toBe('sources disagree; held for review');
    expect(compositionAbsence({...chorleyRow, controlCheck1: 'empty publisher field'}, 'control')).toBe('The compiler records no control label for this council.');
    expect(compositionAbsence({...chorleyRow, controlCheck1: 'fails majority check'}, 'control')).toContain('does not pass');
    expect(compositionAbsence(burnley, 'seats')).toBeNull();
  });
  it('rejects a value changed without its manifest pin', () => {
    const root = mkdtempSync(join(tmpdir(), 'ukc-composition-'));
    try {
      mkdirSync(join(root, 'data/elections'), {recursive: true});
      for (const path of COMPOSITION_PATHS) writeFileSync(join(root, path), readFileSync(path));
      const changed = structuredClone(snapshot); changed.rows[0].columns.Lab++;
      writeFileSync(join(root, COMPOSITION_PATHS[1]), JSON.stringify(changed));
      expect(() => loadComposition(root)).toThrow('Unpinned composition file');
    } finally {rmSync(root, {recursive: true, force: true});}
  });
});
describe('composition distribution guard', () => {
  it('accepts an admitted table and control with the complete caveats', () => {
    expect(compositionChecks(fixture(), chorley.gss)).toEqual([]);
    expect(compositionChecks(fixture(burnley), burnley.gss)).toEqual([]);
  });
  it('fails on unpinned table values, unsupported control and control on absent profiles', () => {
    expect(compositionChecks(fixture().replace('<td>29</td>', '<td>30</td>'), chorley.gss)).toContain('Unpinned composition value or column');
    const control = '<p data-composition-control>Control as recorded by Open Council Data on 16 November 2026: Labour</p>';
    expect(compositionChecks(fixture(burnley).replace('</section>', control + '</section>'), burnley.gss)).toContain('Control line without admitted snapshot row or missing admitted control');
    expect(compositionChecks(control, 'E06000053')).toContain('Control line without admitted snapshot row or missing admitted control');
    expect(compositionChecks(fixture().replace('>Labour</', '>Conservative</'), chorley.gss).length).toBeGreaterThan(0);
  });
  it('fails on forbidden fields on any distribution surface', () => {
    for (const key of ['councillorName', 'seats', 'partyTotals', 'control', 'coalition', 'administration', 'leader', 'majoritySize']) {
      const payload = JSON.stringify({[key]: 'Forbidden field'});
      expect(compositionFieldLeaks(payload)).toBe(true);
      expect(compositionFieldLeaks(payload.replaceAll('"', '&quot;'))).toBe(true);
      expect(compositionChecks(`<script type="application/ld+json">${payload}</script>`)).toContain('Held composition field in distribution');
    }
  });
});
