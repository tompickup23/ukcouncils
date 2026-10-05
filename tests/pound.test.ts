import { describe, expect, it } from "vitest";
import {
  CLASS_LABEL,
  OWNERSHIP_LABEL,
  POUND_BODIES,
  REASON_LABEL,
  UNITARIES,
  loadPound,
  poundPages,
} from "../src/lib/pound";

/** The draft Public Pound pages: the data can carry no name, and every label is known. */
describe("Public Pound draft data", () => {
  const data = loadPound();

  it("holds the fourteen bodies, both years", () => {
    expect(Object.keys(data.bodies).sort()).toEqual(Object.keys(POUND_BODIES).sort());
    for (const body of Object.values(data.bodies)) expect(Object.keys(body.years).sort()).toEqual(data.$meta.years);
  });

  it("carries only known classes, reasons and ownership lines, so no supplier string can reach a page", () => {
    for (const body of Object.values(data.bodies)) {
      for (const year of Object.values(body.years)) {
        for (const key of Object.keys(year.byClassPence)) expect(CLASS_LABEL, key).toHaveProperty([key]);
        for (const key of Object.keys(year.byReasonPence)) expect(REASON_LABEL, key).toHaveProperty([key]);
        for (const line of year.ownershipPence) expect(OWNERSHIP_LABEL, line.class).toHaveProperty([line.class]);
        for (const line of year.ownershipIfSharesCountedPence.lines) expect(OWNERSHIP_LABEL, line.class).toHaveProperty([line.class]);
      }
    }
  });

  it("adds up: classes and reasons to the supplier total, the three lines to the total, ownership lines to the supplier class", () => {
    for (const [id, body] of Object.entries(data.bodies)) {
      for (const [fy, y] of Object.entries(body.years)) {
        const parts = [...Object.values(y.byClassPence), ...Object.values(y.byReasonPence)].reduce((a, b) => a + b, 0);
        expect(parts, `${id} ${fy}`).toBe(y.supplierTotalPence);
        const lines = Object.values(y.linesPence).reduce((a, b) => a + b, 0);
        expect(lines, `${id} ${fy} lines`).toBe(y.supplierTotalPence);
        const reasons = Object.values(y.byReasonPence).reduce((a, b) => a + b, 0);
        expect(y.supplierSpendResolvedPence + reasons, `${id} ${fy} supplier spend`).toBe(y.linesPence.supplierSpend);
        expect(y.supplierSpendCorroboratedPence).toBeLessThanOrEqual(y.supplierSpendResolvedPence);
        expect(y.supplierSpendAgentReviewedPence).toBeLessThanOrEqual(y.supplierSpendResolvedPence);
        const own = y.ownershipPence.reduce((a, o) => a + o.pence, 0);
        expect(own, `${id} ${fy}`).toBe(y.byClassPence.supplier ?? 0);
        const sens = y.ownershipIfSharesCountedPence.lines.reduce((a, o) => a + o.pence, 0);
        expect(sens, `${id} ${fy} sensitivity`).toBe(own);
        expect(y.handVerifiedPence).toBe(0);
      }
    }
  });

  it("shows the individual class as a total only: no country, place or company field on any ownership line", () => {
    for (const body of Object.values(data.bodies)) {
      for (const year of Object.values(body.years)) {
        for (const line of [...year.ownershipPence, ...year.ownershipIfSharesCountedPence.lines]) {
          expect(Object.keys(line).sort()).toEqual(
            Object.keys(line).filter((k) => ["class", "pence", "payeeKeys", "companies"].includes(k)).sort());
        }
      }
    }
  });

  it("builds fourteen body pages and four group pages, each district or unitary in one group", () => {
    expect(poundPages()).toHaveLength(18);
    const members = UNITARIES.flatMap((u) => u.members);
    expect(new Set(members).size).toBe(members.length);
    expect(members).toHaveLength(14);
  });
});
