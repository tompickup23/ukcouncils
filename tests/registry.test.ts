import { describe, expect, it } from "vitest";
import { loadYear } from "../src/lib/council-tax";
import { SISTER_SITES, councilBySlug, loadRegistry, sisterLinks } from "../src/lib/registry";

describe("the council registry", () => {
  const registry = loadRegistry();
  const councils = Object.values(registry.councils);

  it("holds every UK local authority in the UK Places spine", () => {
    expect(councils.length).toBe(361);
    const byCountry = councils.reduce<Record<string, number>>((acc, c) => {
      acc[c.country] = (acc[c.country] ?? 0) + 1;
      return acc;
    }, {});
    expect(byCountry).toEqual({ England: 296, Scotland: 32, Wales: 22, "Northern Ireland": 11 });
  });

  it("gives every council a unique URL slug", () => {
    const slugs = councils.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("covers exactly the billing authorities in the MHCLG band table", () => {
    const english = new Set(councils.filter((c) => c.country === "England").map((c) => c.gss));
    const table = new Set(Object.keys(loadYear("2026-27").authorities));
    expect([...table].filter((gss) => !english.has(gss))).toEqual([]);
    expect([...english].filter((gss) => !table.has(gss))).toEqual([]);
  });

  it("links a sister site only on that site's own host and council route", () => {
    const routes: Record<string, RegExp> = {
      ukelections: /^https:\/\/ukelections\.co\.uk\/seats\/[a-z0-9-]+\/$/,
      ukdemographics: /^https:\/\/ukdemographics\.co\.uk\/places\/[a-z0-9-]+\/$/,
      aidoge: /^https:\/\/aidoge\.co\.uk\/councils\/[a-z0-9_-]+\/$/,
      asylumstats: /^https:\/\/asylumstats\.co\.uk\/places\/[a-z0-9-]+\/$/,
      ukfoodhygiene: /^https:\/\/ukfoodhygiene\.co\.uk\/councils\/[a-z0-9-]+\/$/,
    };
    for (const council of councils) {
      for (const site of Object.keys(SISTER_SITES)) {
        const url = council.sisters[site as keyof typeof SISTER_SITES];
        if (url !== null) expect(url, `${council.gss} ${site}`).toMatch(routes[site]);
      }
    }
  });

  it("never links UK Elections at /councils/, which 404s", () => {
    for (const council of councils) {
      expect(council.sisters.ukelections ?? "").not.toMatch(/ukelections\.co\.uk\/councils\//);
    }
  });

  it("records how many links passed the live sitemap test", () => {
    for (const site of Object.keys(SISTER_SITES) as (keyof typeof SISTER_SITES)[]) {
      const counted = councils.filter((c) => c.sisters[site]).length;
      expect(registry.counts[site]).toBe(counted);
      expect(registry.source.sitemaps[site].urls).toBeGreaterThan(100);
    }
  });

  it("finds a council by slug and lists its links in a fixed order", () => {
    const burnley = councilBySlug("burnley");
    expect(burnley?.gss).toBe("E07000117");
    expect(sisterLinks(burnley!).map((l) => l.site)).toEqual([
      "ukelections",
      "ukdemographics",
      "aidoge",
      "asylumstats",
      "ukfoodhygiene",
    ]);
  });
});
