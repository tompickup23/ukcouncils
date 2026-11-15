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
      {label: 'Rubbish and recycling collection', authority: 'Burnley Borough Council'},
      {label: 'Housing', authority: 'Burnley Borough Council'},
      {label: 'Environmental health', authority: 'Burnley Borough Council'},
    ]);
    expect(functions('city-of-london')).toBeNull();
    expect(functions('isles-of-scilly')).toBeNull();
    expect(pages.filter(({council, tax}) => functionsFor(council, tax))).toHaveLength(294);
  });
  it.each([
    ['blackpool', 'Blackpool Borough Council'],
    ['birmingham', 'Birmingham City Council'],
    ['camden', 'London Borough of Camden'],
    ['bromley', 'London Borough of Bromley'],
  ])('uses the official name for every function in %s', (slug, officialName) => {
    expect(functions(slug)).toHaveLength(6);
    expect(new Set(functions(slug)!.map(row => row.authority))).toEqual(new Set([officialName]));
  });
  it.each(['burnley', 'blackpool', 'birmingham', 'camden', 'bromley'])(
    'rejects missing or blank official names for %s during static generation', slug => {
      const {council, tax} = pages.find(page => page.council.slug === slug)!;
      for (const officialName of [undefined, null, '', '   ']) {
        const invalid = {...council, officialName} as typeof council;
        expect(() => functionsFor(invalid, tax)).toThrow(`Missing officialName for council responsibilities: ${council.gss}`);
      }
    },
  );
  it.each(['city-of-london', 'isles-of-scilly'])(
    'excludes %s before requiring an official name', slug => {
      const {council, tax} = pages.find(page => page.council.slug === slug)!;
      expect(functionsFor({...council, officialName: ''}, tax)).toBeNull();
    },
  );
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
