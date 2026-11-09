import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { collection, collectionFor, collectionRate } from "../src/lib/collection";
import { councilPages } from "../src/lib/paths";

describe("MHCLG QRC4 collection data", () => {
  it("reproduces the pinned UK Council Tax output byte for byte", () => {
    expect(createHash("sha256").update(readFileSync("data/collection/collection-rates-2025-26.json")).digest("hex")).toBe("cecd26a16eb2123693596f4e34c7d10f1174d16f566771915043264b09def3a3");
  });
  it("joins every council page by its exact GSS code", () => {
    expect(Object.keys(collection.councils)).toHaveLength(296);
    for (const {council} of councilPages()) {
      expect(collectionFor(council.gss), council.slug).not.toBeNull();
      expect(collectionFor(council.gss)!.rate, council.slug).not.toBeNull();
    }
    expect(collectionFor("missing")).toBeNull();
  });
  it("retains the printed anchors and two decimal places", () => {
    for (const [gss, expected] of Object.entries({E07000117: [94.09, 60689, 57102, 15841], E08000025: [90.04, 629022, 566351, 272682]})) {
      const r = collectionFor(gss)!;
      expect([r.rate, r.collectable, r.collected, r.totalArrears]).toEqual(expected);
    }
    expect(collection.england.rate).toBe(95.6);
    expect(collectionRate(90)).toBe("90.00%");
    expect(collectionRate(null)).toBe("n/a");
  });
});
