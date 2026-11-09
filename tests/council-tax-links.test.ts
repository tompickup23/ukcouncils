import { describe, expect, it } from "vitest";
import { councilTaxLink, councilTaxLinks } from "../src/lib/council-tax-links";
import { loadRegistry } from "../src/lib/registry";

describe("verified UK Council Tax links", () => {
  it("holds exactly 296 council URLs from the live sitemap", () => {
    expect(councilTaxLinks.source).toBe("https://ukcounciltax.co.uk/sitemap.xml");
    expect(councilTaxLinks.urls.filter(url => new URL(url).pathname !== "/councils/")).toHaveLength(296);
    expect(new Set(councilTaxLinks.urls).size).toBe(councilTaxLinks.urls.length);
  });

  it("covers every English billing council in the registry", () => {
    const councils = Object.values(loadRegistry().councils).filter(c => c.country === "England" && !/county/i.test(c.type));
    expect(councils).toHaveLength(296);
    for (const council of councils) expect(councilTaxLink(council.slug), council.slug).toBe(`https://ukcounciltax.co.uk/councils/${council.slug}/`);
  });

  it("suppresses a council that is absent from the saved sitemap", () => {
    expect(councilTaxLink("unlisted-council")).toBeNull();
  });
});
