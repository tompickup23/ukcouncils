import { describe, expect, it } from "vitest";
import {
  INDIVIDUAL_DETAIL_LABEL,
  INDIVIDUAL_LABEL,
  displayProtectedText,
  displaySupplier,
  displaySupplierCanonical,
  facetSuppliers,
  isIndividualRow,
  isPersonShapedSupplier,
  isRedactedSupplier,
  isWithheldOrPersonShaped,
  normaliseSupplier,
} from "../src/lib/redaction";

/** The cases aidoge-site tests the same module with (tests/spending.test.ts, tests/body-suppliers.test.ts). */
describe("redaction, as ported from aidoge-site", () => {
  it("names nobody a council withheld, by either route", () => {
    expect(displaySupplier({ supplier: "REDACTED" })).toBe(INDIVIDUAL_LABEL);
    expect(displaySupplier({ supplier: "Name Withheld" })).toBe(INDIVIDUAL_LABEL);
    expect(displaySupplier({ supplier: "  various  " })).toBe(INDIVIDUAL_LABEL);
    expect(displaySupplier({ supplier: "SUNDRY CREDITORS" })).toBe(INDIVIDUAL_LABEL);
    expect(displaySupplier({ supplier: "UNKNOWN" })).toBe(INDIVIDUAL_LABEL);
    expect(displaySupplier({ supplier: "REDACTED T/A JLH PLASTERING" })).toBe(INDIVIDUAL_LABEL);
    expect(displaySupplier({ supplier: "A Person", record_class: "direct_payment_individual" })).toBe(INDIVIDUAL_LABEL);
  });

  it("does not mistake a company whose name starts like a marker", () => {
    expect(isRedactedSupplier("REDACTIVE PUBLISHING LTD")).toBe(false);
    expect(displaySupplier({ supplier: "REDACTIVE PUBLISHING LTD" })).toBe("REDACTIVE PUBLISHING LTD");
    expect(isRedactedSupplier("VARIOUS ARTISTS RECORDS LTD")).toBe(true);
  });

  it("reads through the punctuation councils decorate a marker with", () => {
    expect(normaliseSupplier("[REDACTED]")).toBe("REDACTED");
    expect(isRedactedSupplier("*REDACTED*")).toBe(true);
    expect(isRedactedSupplier("(name withheld)")).toBe(true);
  });

  it("treats an empty supplier as unnamed, not as an individual", () => {
    expect(isRedactedSupplier("")).toBe(false);
    expect(isIndividualRow({ supplier: "" })).toBe(false);
    expect(displaySupplier({ supplier: "" })).toBe("Not stated");
  });

  it("hides the raw value behind the canonical column too", () => {
    expect(displaySupplierCanonical({ supplier: "REDACTED", supplier_canonical: "REDACTED T/A SOMEBODY" }))
      .toBe(INDIVIDUAL_LABEL);
    expect(displaySupplierCanonical({ supplier: "ACME", supplier_canonical: "ACME LTD" })).toBe("ACME LTD");
  });

  it("keeps withheld rows out of a supplier list", () => {
    const facet = facetSuppliers([
      { name: "FCC ENVIRONMENT" }, { name: "REDACTED" }, { name: "WATER PLUS LTD" }, { name: "NAME WITHHELD" },
    ]);
    expect(facet.map((row) => row.name)).toEqual(["FCC ENVIRONMENT", "WATER PLUS LTD"]);
  });

  it("withholds free text that could repeat an individual name", () => {
    const row = { supplier: "A Synthetic Person", record_class: "direct_payment_individual" };
    expect(displayProtectedText(row, "description", "synthetic identifying value")).toBe(INDIVIDUAL_DETAIL_LABEL);
    expect(displayProtectedText(row, "financial_year", "2025/26")).toBe("2025/26");
  });

  it("holds a name printed on its own to the stricter test", () => {
    for (const value of [
      "REDACT PERSONAL INFORMATION", "PAYMENT TO INDIVIDUAL", "PERSONAL PAYMENTS", "PERSONAL REDACTION",
      "SUNDRY SUPPLIERS", "UNKNOWN", "*******", "MR J SMITH", "J A SMITH",
    ]) {
      expect(isWithheldOrPersonShaped(value), value).toBe(true);
    }
    for (const value of ["A FACILITIES SUPPLIER LTD", "REDACTIVE PUBLISHING LTD"]) {
      expect(isWithheldOrPersonShaped(value), value).toBe(false);
    }
    expect(isPersonShapedSupplier("SMITH J")).toBe(true);
  });
});
