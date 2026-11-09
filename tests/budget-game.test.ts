import {describe, expect, it} from 'vitest';
import {orderScore, readScores, reserveBand, reserveDirection, scoreLink, shares, splitScore} from '../src/lib/budget-game';
import {budget} from '../src/lib/budget';
const item = (value: number) => ({value, label: 'Test', detail: 'Synthetic game test input'});
describe('budget game calculations and sharing', () => {
  it('scores exact shares, reversed guesses, penny rounding and invalid allocations', () => {
    expect(splitScore([75, 25], [75, 25])).toBe(100);
    expect(splitScore([0, 100], [100, 0])).toBe(0);
    expect(splitScore([33, 67], [100 / 3, 200 / 3])).toBe(100);
    expect(splitScore([100], [100.001])).toBe(100);
    for (const guess of [[0, 0], [-1, 101], [0.5, 99.5], [NaN, 100], [100]]) expect(() => splitScore(guess, [50, 50])).toThrow();
    expect(shares([item(2), item(6)], 8)).toEqual([25, 75]);
    expect(() => shares([item(-2)], 2)).toThrow();
    expect(() => shares([item(2)], 0)).toThrow();
  });
  it('ranks funding magnitudes, accepts ties and preserves deductions', () => {
    const items = [item(-40), item(20), item(20), item(0)];
    expect(orderScore([0, 1, 2, 3], items)).toBe(100);
    expect(orderScore([0, 2, 1, 3], items)).toBe(100);
    expect(orderScore([3, 2, 1, 0], items)).toBe(0);
    expect(orderScore([0, 1], [item(0), item(0)])).toBe(100);
    expect(() => orderScore([0, 0, 2, 3], items)).toThrow();
  });
  it('handles exact reserve thresholds, additions, drawdowns and unchanged balances', () => {
    expect([0, 1, 999, 1000, 9999, 10000, 99999, 100000].map(reserveBand)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
    expect(reserveBand(-1000)).toBe(2);
    expect([-1, 0, 1].map(reserveDirection)).toEqual(['draw', 'neither', 'add']);
  });
  it('shares only the slug and strictly validated scores, including skips', () => {
    const url = new URL(scoreLink('https://example.test', 'burnley', [100, 80, null, 50, 0]));
    expect(url.pathname).toBe('/tools/budget/burnley/');
    expect(url.search).toBe('');
    expect(readScores(url.hash, 5)).toEqual([100, 80, null, 50, 0]);
    for (const hash of ['#scores=101,2', '#scores=-1,2', '#scores=1.5,2', '#scores=NaN,2', '#scores=1,2&postcode=x', '#scores=1,2,3', '#scores=<script>,2', '#scores=,2']) expect(readScores(hash, 2)).toBeNull();
  });
});

it('keeps every stored printed label and service heading equal to the pinned workbook with punctuation changes only', async () => {
  const {readOds} = await import('../scripts/lib/ods.mjs');
  const {readFileSync} = await import('node:fs');
  const manifest = JSON.parse(readFileSync('data/budget/sources.json', 'utf8'));
  const normalise = (text: string) => text.replace(new RegExp(`(\\d)\\s*[${String.fromCharCode(8211, 8212)}]\\s*(\\d)`, 'g'), '$1 to $2').replace(new RegExp(`\\s*[${String.fromCharCode(8211, 8212)}]\\s*`, 'g'), ': ').replaceAll([' ', '-', ' '].join(''), ': ').replace(/\s+/g, ' ').trim();
  for (const key of ['raPart1', 'raPart2', 'raGrants']) {
    const source = manifest[key];
    const sheet = readOds(`data/raw/${source.file}`).find((s: {name: string}) => s.name === source.tables[0]);
    if (!sheet) throw new Error(`Missing pinned sheet ${source.tables[0]}`);
    const header = sheet.rows.findIndex((r: string[]) => r[0] === 'E-code');
    for (const [id, field] of Object.entries(budget.fields).filter(([, f]) => f.source === key)) {
      const column = sheet.rows[header-3].indexOf(id);
      expect(column, id).toBeGreaterThanOrEqual(0);
      expect(field.label, id).toBe(normalise(sheet.rows[header][column]));
      expect(field.heading, id).toBe(normalise(sheet.rows[header-2].slice(6, column + 1).filter(Boolean).at(-1) ?? ''));
    }
  }
});
