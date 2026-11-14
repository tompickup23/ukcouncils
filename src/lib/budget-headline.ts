import {budget, budgetMoney, budgetSource, budgetYear} from './budget';

/** The published RA total, never a sum of the service lines or a missing return. */
export function budgetHeadline(gss: string) {
  const row = budget.councils[gss];
  const total = row?.values.servicetot;
  if (row?.status !== 'available' || total == null || total === 0) return null;
  return {
    label: `Net service expenditure, ${budgetYear}`,
    value: total < 0 ? `minus ${budgetMoney(Math.abs(total))}` : budgetMoney(total),
    source: {...budgetSource(), table: 'RA_LA_Data_2026-27, line 799'},
    caveat: 'Budget, excluding NHS-funded expenditure. Published in whole thousands of pounds.',
  };
}
