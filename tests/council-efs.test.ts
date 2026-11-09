import { describe, expect, it } from "vitest";
import { authorities, figuresByAuthority } from "../src/lib/efs";
import { councilEfs } from "../src/lib/council-efs";
import { councilPages } from "../src/lib/paths";

describe("council EFS sections", () => {
  it("includes every authority with a slug on an existing council page", () => {
    const pages = councilPages();
    const linked = Object.entries(authorities).filter(([, authority]) => authority.slug);
    expect(pages.filter(({ council }) => councilEfs(council.slug))).toHaveLength(linked.length);
    for (const [key, authority] of linked) {
      expect(pages.some(({ council }) => council.slug === authority.slug), authority.slug!).toBe(true);
      expect(councilEfs(authority.slug!)).toEqual({ key, entries: figuresByAuthority().get(key) });
    }
  });

  it("includes Birmingham and omits Burnley, which has no statement", () => {
    expect(councilEfs("birmingham")?.entries.length).toBeGreaterThan(0);
    expect(Object.values(authorities).some(authority => authority.slug === "burnley")).toBe(false);
    expect(councilEfs("burnley")).toBeNull();
  });
});
