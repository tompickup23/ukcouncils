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
      }
    }
  });

  it("adds up: classes and reasons to the supplier total, ownership lines to the supplier class", () => {
    for (const [id, body] of Object.entries(data.bodies)) {
      for (const [fy, y] of Object.entries(body.years)) {
        const parts = [...Object.values(y.byClassPence), ...Object.values(y.byReasonPence)].reduce((a, b) => a + b, 0);
        expect(parts, `${id} ${fy}`).toBe(y.supplierTotalPence);
        const own = y.ownershipPence.reduce((a, o) => a + o.pence, 0);
        expect(own, `${id} ${fy}`).toBe(y.byClassPence.supplier ?? 0);
        expect(y.handVerifiedPence).toBe(0);
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
