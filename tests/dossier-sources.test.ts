import {describe, expect, it} from 'vitest';
import {councilPages} from '../src/lib/paths';
import {functionsFor} from '../src/lib/council-functions';
import {budgetHeadline} from '../src/lib/budget-headline';
import {budget} from '../src/lib/budget';

const pages = councilPages();
const functions = (slug: string) => {
  const {council, tax} = pages.find(page => page.council.slug === slug)!;
  return functionsFor(council, tax);
};
describe('dossier source boundaries', () => {
  it('assigns selected district functions and county functions separately', () => {
    expect(functions('burnley')).toEqual([
      {label: 'Schools and education', authority: 'Lancashire County Council'},
      {label: 'Social care', authority: 'Lancashire County Council'},
      {label: 'Libraries', authority: 'Lancashire County Council'},
      {label: 'Rubbish and recycling collection', authority: 'Burnley'},
      {label: 'Housing', authority: 'Burnley'},
      {label: 'Environmental health', authority: 'Burnley'},
    ]);
    expect(new Set(functions('birmingham')!.map(row => row.authority))).toEqual(new Set(['Birmingham']));
    expect(functions('city-of-london')).toBeNull();
    expect(functions('isles-of-scilly')).toBeNull();
    expect(pages.filter(({council, tax}) => functionsFor(council, tax))).toHaveLength(294);
  });
  it('uses the published total with unit conversion and drops missing returns', () => {
    expect(budgetHeadline('E08000026')).toBeNull();
    expect(budgetHeadline('missing')).toBeNull();
    expect(pages.filter(({council}) => budgetHeadline(council.gss))).toHaveLength(287);
    for (const {council} of pages) {
      const headline = budgetHeadline(council.gss);
      if (!headline) continue;
      const value = budget.councils[council.gss].values.servicetot!;
      expect(Number(headline.value.replace(/[^\d]/g, ''))).toBe(Math.abs(value) * 1000);
      expect(headline.source.table).toContain('line 799');
    }
  });
});
