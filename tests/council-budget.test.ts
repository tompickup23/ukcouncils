import {describe, expect, it} from 'vitest';
import {councilBudget} from '../src/lib/council-budget';
import {councilPages} from '../src/lib/paths';
import {loadRegistry} from '../src/lib/registry';
import {budget} from '../src/lib/budget';

describe('the council budget profile adapter', () => {
  it('uses current tax display names and complete separately named county records', () => {
    let billing = 0, counties = 0;
    for (const {council, tax} of councilPages()) {
      const view = councilBudget(council);
      if (budget.councils[council.gss].status === 'no return') {expect(view).toBeNull(); continue;}
      billing++;
      expect(view!.name).toBe(tax.name);
      expect(view!.council).toBe(budget.councils[council.gss]);
      expect(view!.sources.every(source => source.date && source.url.startsWith('https://'))).toBe(true);
      if (tax.classCode === 'SD') {
        counties++;
        expect(view!.county!.council).toBe(budget.councils[council.parentGss!]);
      } else expect(view!.county).toBeNull();
    }
    expect([billing, counties]).toEqual([287, 160]);
    const dorset = councilBudget(loadRegistry().councils.E06000059)!;
    expect(dorset.name).toBe('Dorset');
    expect(dorset.council.name).toBe('Dorset UA');
    const burnley = councilBudget(loadRegistry().councils.E07000117)!;
    expect(burnley.county!.name).toBe('Lancashire');
  });
  it('retains the four printed zero reserve balances for Bradford', () => {
    const row = budget.councils.E08000032;
    expect(row.status).toBe('available');
    expect(['resoth_strt', 'resoth_end', 'resunall_strt', 'resunall_end'].map(key => row.values[key])).toEqual([0, 0, 0, 0]);
  });
  it('has no section outside England or without a current billing record', () => {
    for (const council of Object.values(loadRegistry().councils).filter(row => row.country !== 'England')) expect(councilBudget(council)).toBeNull();
    const council = loadRegistry().councils.E07000117;
    expect(councilBudget({...council, gss: 'E10000017'})).toBeNull();
    expect(() => councilBudget({...council, parentGss: null})).toThrow('County join differs');
  });
});
