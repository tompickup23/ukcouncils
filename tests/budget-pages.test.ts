import {describe, expect, it} from 'vitest';
import {budget, budgetFor, budgetMoney, funding, nonRingfencedReserves, observation, services} from '../src/lib/budget';
import {councilPages} from '../src/lib/paths';
import {CURRENT_YEAR, loadYear} from '../src/lib/council-tax';
import receipt from '../docs/C3-DATA-DRY-RUN.json';

describe('budget page source views', () => {
  it('covers every billing page and preserves no returns', () => {
    const pages = councilPages();
    expect(pages).toHaveLength(296);
    expect(pages.filter(({council}) => budgetFor(council.gss).council.status === 'available')).toHaveLength(287);
    for (const {council} of pages) {
      const view = budgetFor(council.gss);
      if (view.council.class === 'SD') expect(view.county?.class).toBe('SC');
      if (view.council.status === 'no return') {
        expect(services(view.council).every(row => row.value === null)).toBe(true);
        expect(funding(view.council).every(row => row.value === null)).toBe(true);
        expect(nonRingfencedReserves(view.council).every(row => row.value === null)).toBe(true);
      }
    }
  });
  it('preserves negative service observations, printed labels and units', () => {
    const burnley = budgetFor('E07000117').council;
    const transport = services(burnley).find(row => row.id === 'transtot')!;
    expect(transport).toMatchObject({value: -343, label: 'Highways and Transport', line: 290, recordType: 'observation', unit: 'GBP thousand'});
    expect(budgetMoney(transport.value)).toBe('-£343,000');
    expect(observation(burnley, 'eduspc').label).toBe('Special schools and alternative provision');
    expect(budgetMoney(null)).toBe('n/a');
  });
  it('reconciles every grouped funding view including deductions and reserve additions', () => {
    let withDeduction = 0;
    for (const council of Object.values(budget.councils).filter(c => c.status === 'available')) {
      const rows = funding(council);
      expect(rows.every(row => row.recordType === 'calculation')).toBe(true);
      expect(rows.reduce((total, row) => total + row.value!, 0), council.name).toBe(council.values.revenuetot);
      if (rows.some(row => row.value! < 0)) withDeduction++;
    }
    expect(withDeduction).toBeGreaterThan(0);
    const runnymede = funding(budgetFor('E07000212').council).find(row => row.label === 'Retained business rates');
    expect(runnymede?.value).toBe(-880);
  });
  it('excludes ring-fenced balances from non-ringfenced reserves', () => {
    const lancashire = budgetFor('E07000117').county!;
    const rows = nonRingfencedReserves(lancashire);
    expect(rows.map(row => row.value)).toEqual([245022 + 66250, 229961 + 66250]);
    expect(rows[0].inputIds).toEqual(['resoth_strt', 'resunall_strt']);
    expect(rows.every(row => row.recordType === 'calculation')).toBe(true);
    expect(lancashire.values.resdsgadj_strt).toBe(-97366);
  });
});


describe('C3 edition and exact county joins', () => {
  it('matches every receipt anchor and counts the source sets', () => {
    const pages = councilPages();
    const available = Object.values(budget.councils).filter(row => row.status === 'available');
    expect(Object.keys(budget.councils)).toHaveLength(receipt.retained);
    expect(available).toHaveLength(receipt.available);
    expect(pages.filter(({council}) => budget.councils[council.gss].status === 'available')).toHaveLength(receipt.billingAvailable);
    expect(available.filter(row => services(row).some(service => service.value !== null && service.value < 0))).toHaveLength(receipt.negativeServiceBodies);
    expect(pages.filter(({council, tax}) => budget.councils[council.gss].name !== tax.name)).toHaveLength(receipt.displayNameDifferences);
    for (const [gss, expected] of Object.entries(receipt.anchors)) {
      for (const [field, value] of Object.entries(expected)) expect(budget.councils[gss].values[field], `${gss} ${field}`).toBe(value);
    }
    expect(Object.fromEntries(pages.filter(({council}) => budget.councils[council.gss].status === 'no return').map(({council, tax}) => [council.gss, tax.name]))).toEqual(receipt.missing);
    for (const [note, expected] of [['[note 4]', receipt.note4], ['[note 8]', receipt.note8]] as const) {
      expect(Object.entries(budget.councils).filter(([, row]) => row.notes.raPart1.includes(note)).map(([gss]) => gss).sort()).toEqual([...expected].sort());
    }
  });
  it('joins all districts by registry parentGss to the complete county return and tax name', () => {
    const districts = councilPages().filter(({tax}) => tax.classCode === 'SD');
    expect(districts).toHaveLength(164);
    const countyCodes = new Set<string>();
    let sections = 0;
    for (const {council} of districts) {
      const row = budget.councils[council.gss];
      expect(row.countyCode).toBe(council.parentGss);
      expect(row.countyCode).toBeTruthy();
      expect(budget.councils[row.countyCode!]).toMatchObject({class: 'SC', status: 'available'});
      expect(loadYear(CURRENT_YEAR).counties[row.countyCode!].name).toBeTruthy();
      if (row.status === 'available') {sections++; countyCodes.add(row.countyCode!);}
    }
    expect(sections).toBe(receipt.countySections);
    expect(countyCodes.size).toBe(receipt.countyBodies);
    expect([...countyCodes].sort()).toEqual(Object.entries(budget.councils).filter(([, row]) => row.class === 'SC').map(([gss]) => gss).sort());
  });
});
