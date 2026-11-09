import {existsSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {budgetChecks} from '../scripts/lib/budget-checks.mjs';
describe.skipIf(!existsSync('dist/councils/burnley/index.html'))('built budget coverage', () => {
  it('keeps missing returns absent and counties separately labelled', () => {
    const result = budgetChecks(process.cwd(), 'dist');
    expect(result.failures).toEqual([]);
    expect(result.counts).toEqual({billing: 287, county: 160});
  });
});
