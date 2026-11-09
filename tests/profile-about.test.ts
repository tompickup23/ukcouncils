import { describe, expect, it } from "vitest";
import { councilPages } from "../src/lib/paths";
import { profileAbout } from "../src/lib/council-profile";
import { populationFor } from "../src/lib/population";
import { ownPagesFor } from "../src/lib/local-links";
const pages = councilPages();
describe("extended council introduction", () => {
  it("omits population and service rows exactly where their sources lack a council", () => {
    for (const {council} of pages) {
      const about = profileAbout(council);
      expect(about.population?.council ?? null).toBe(populationFor(council.gss));
      expect(about.ownPages).toEqual(ownPagesFor(council.gss));
    }
    expect(pages.filter(p => profileAbout(p.council).population === null).map(p => p.council.slug).sort()).toEqual(["barnsley", "sheffield"]);
  });
  it("names and counts the county only for shire districts with its own source row", () => {
    const burnley = pages.find(p => p.council.slug === "burnley")!;
    expect(profileAbout(burnley.council).population).toEqual({council: 100946, county: {name: "Lancashire", count: 1308567}});
    expect(pages.filter(p => profileAbout(p.council).population?.county)).toHaveLength(164);
    for (const {council, tax} of pages.filter(p => p.tax.classCode !== "SD")) expect(profileAbout(council).population?.county ?? null, tax.name).toBeNull();
  });
});
