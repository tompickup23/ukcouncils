import { describe, expect, it } from "vitest";
import { localLinks, ownPagesFor } from "../src/lib/local-links";
import { councilPages } from "../src/lib/paths";
import { LINKS_HASH } from "../scripts/import-local-links.mjs";
import { verifyPinnedHash } from "../scripts/lib/pinned-json.mjs";
describe("pinned Local Links", () => {
  it("rejects a changed input", () => {
    expect(() => verifyPinnedHash(Buffer.from("changed"), LINKS_HASH, "Local Links")).toThrow("pinned hash differs");
  });
  it("includes only sourced links for council pages", () => {
    const rows = Object.values(localLinks.councils);
    expect(rows).toHaveLength(258);
    expect(rows.filter(r => r.councilTax)).toHaveLength(254);
    expect(rows.filter(r => r.bins)).toHaveLength(207);
    const codes = new Set(councilPages().map(p => p.council.gss));
    for (const [gss, row] of Object.entries(localLinks.councils)) {
      expect(codes.has(gss)).toBe(true);
      expect(Object.keys(row).length).toBeGreaterThan(0);
      for (const url of Object.values(row)) expect(url).toMatch(/^https?:\/\//);
    }
    expect(ownPagesFor("missing")).toBeNull();
  });
  it("preserves the anchor URLs including the published HTTP link", () => {
    expect(ownPagesFor("E07000117")?.councilTax).toBe("https://burnley.gov.uk/counciltax/paying-your-council-tax/");
    expect(ownPagesFor("E08000025")?.councilTax).toBe("https://www.birmingham.gov.uk/info/20005/council_tax/223/pay_your_council_tax");
    expect(ownPagesFor("E06000053")?.bins).toBe("http://www.scilly.gov.uk/waste");
  });
});
