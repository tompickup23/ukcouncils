import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {heldWording} from '../scripts/lib/held-wording.mjs';
import {dossierCoverage} from '../scripts/lib/dossier-coverage.mjs';
import {loadDossier, decisionState, ITEMS} from '../scripts/lib/dossier-state.mjs';

const report = loadDossier(process.cwd(), '2026-11-15');
const profile = report.profiles.find(row => row.slug === 'burnley')!;
const fixture = (row = profile) => `<main>${row.parts.map(part => part.state === 'built'
  ? part.markers.map(marker => { const [key, value] = marker.split('='); return `<section ${key}="${value ?? ''}">Sourced content</section>`; }).join('')
  : `<li data-dossier-absence="${part.key}"><strong>${part.label}:</strong> ${part.reason}</li>`).join('')}</main>`;

describe('dossier completion states', () => {
  it('covers the exact billing denominator, every item and pinned inputs', () => {
    expect(report.profiles).toHaveLength(296);
    expect(new Set(report.profiles.map(row => row.gss)).size).toBe(296);
    for (const row of report.profiles) {
      expect(Object.keys(row.items)).toEqual(ITEMS);
      expect(dossierCoverage(fixture(row), row)).toEqual([]);
    }
    expect(Object.values(report.pins).every(hash => /^[a-f0-9]{64}$/.test(hash))).toBe(true);
  });
  it('keeps absence prose within the existing held-wording rule', () => {
    for (const row of report.profiles) {
      const prose = row.parts.filter(part => part.state !== 'built').map(part => `<p>${part.label}: ${part.reason}</p>`).join('');
      expect(heldWording(prose)).toBe(false);
    }
  });
  it('rejects a section silently dropped from the built page', () => {
    expect(dossierCoverage(fixture().replace('id="budget"', 'id="removed"'), profile)).toContain('Missing built dossier part budget');
  });
  it('rejects absent, blank, hidden, duplicated or misplaced explanations', () => {
    const start = '<li data-dossier-absence="control">';
    const row = `${start}<strong>Control:</strong> sources disagree; held for review</li>`;
    for (const replacement of ['', `${start}</li>`, row.replace('<li ', '<li hidden '), row + row]) {
      expect(dossierCoverage(fixture().replace(row, replacement), profile)).toContain('Missing visible dossier reason control');
    }
    expect(dossierCoverage(fixture().replace(row, '') + row, profile)).toContain('Missing visible dossier reason control');
  });
  it('rejects both built and absent states and unpinned built content', () => {
    expect(dossierCoverage(fixture().replace('</main>', '<p data-composition-control></p></main>'), profile)).toContain('Absent dossier part has built content control');
    const changed = structuredClone(profile);
    changed.parts.find(part => part.key === 'budget')!.sources = [];
    expect(dossierCoverage(fixture(), changed)).toContain('Unpinned dossier source budget');
  });
  it('does not treat an open decision as a decision already taken', () => {
    expect(decisionState('audit', '2026-12-15')).toBe('absent');
    expect(decisionState('audit', '2026-12-16')).toBe('out-of-scope');
    const january = loadDossier(process.cwd(), '2027-01-15');
    expect(january.profiles.every(row => row.parts.filter(part => part.state === 'out-of-scope').length === 4)).toBe(true);
    const changed = structuredClone(january.profiles[0]);
    changed.parts.find(part => part.key === 'audit')!.decision = null;
    expect(dossierCoverage(fixture(changed), changed)).toContain('Missing Tom decision audit');
  });
  it('keeps an absent input distinct from an absent official publication', () => {
    const missing = report.profiles.filter(row => row.parts.find(part => part.key === 'holidays')!.state === 'absent');
    expect(missing.map(row => row.slug).sort()).toEqual(['barnsley', 'blackpool', 'city-of-london', 'enfield', 'halton', 'isles-of-scilly', 'newham', 'sheffield', 'south-tyneside']);
    expect(missing.every(row => row.parts.find(part => part.key === 'holidays')!.absenceKind === 'no-source')).toBe(true);
  });
  it('runs the coverage gate during the build and the dist check', () => {
    expect(JSON.parse(readFileSync('package.json', 'utf8')).scripts.build).toContain('node scripts/check-dossier.mjs');
    expect(readFileSync('scripts/check-dist.mjs', 'utf8')).toContain('coverage: coverageBySlug.get(councilSlug)');
  });
});
