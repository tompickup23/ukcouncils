import { describe, expect, it } from 'vitest';
import { budget, budgetMoney, services } from '../src/lib/budget';
import { serviceBars, serviceRows } from '../src/lib/budget-bars';
import { councilBudget } from '../src/lib/council-budget';
import { councilPages } from '../src/lib/paths';

const views = councilPages().map(({ council }) => councilBudget(council)).filter(v => v !== null);
const drawn = [...views.map(v => ({ council: v.council, name: v.name })), ...new Map(views.filter(v => v.county).map(v => [v.county!.name, v.county!])).values()];
const label = (svg: string) => [...svg.matchAll(/data-ek-row="service\.([a-z]+)"/g)].map(m => m[1]);
// Values are the right aligned text on each row.
const values = (svg: string) => [...svg.matchAll(/<text [^>]*text-anchor="end"[^>]*>([^<]+)<\/text>/g)].map(m => m[1]);

describe('service expenditure as ranked bars', () => {
  it('draws every profile that has a budget, and each county once', () => {
    expect(views).toHaveLength(287);
    expect(drawn).toHaveLength(308);
  });

  it('draws exactly the rows of the service table, in RA line order, null and zero left out', () => {
    for (const { council, name } of drawn) {
      const out = serviceBars(council, name)!;
      const rows = services(council).filter(r => r.value !== null && r.value !== 0);
      expect(label(out.svg), name).toEqual(rows.map(r => r.id));
      const lines = rows.map(r => budget.fields[r.id].line);
      expect([...lines].sort((a, b) => a - b), name).toEqual(lines);
      expect(serviceRows(council).map(r => r.id)).toEqual(rows.map(r => r.id));
    }
  });

  it('prints each value as the table prints it, minus for net income, and never the total', () => {
    for (const { council, name } of drawn) {
      const out = serviceBars(council, name)!;
      const expected = serviceRows(council).map(r => r.value! < 0 ? `minus ${budgetMoney(-r.value!)}` : budgetMoney(r.value));
      expect(values(out.svg), name).toEqual(expected);
      expect(out.svg).not.toContain('servicetot');
      expect(out.svg).not.toMatch(/[\u2013\u2014]| - /);
    }
  });

  it('draws nothing when no service line is present', () => {
    const empty = { ...drawn[0].council, values: Object.fromEntries(Object.keys(drawn[0].council.values).map(k => [k, null])) };
    expect(serviceBars(empty, 'Empty')).toBeNull();
  });
});
