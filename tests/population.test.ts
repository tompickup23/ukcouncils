import { describe, expect, it } from "vitest";
import { population, populationFor, populationSource } from "../src/lib/population";
import { councilPages } from "../src/lib/paths";
import { verifyPopulationHash } from "../scripts/import-population.mjs";

describe("pinned ONS mid-2025 population", () => {
  it("refuses changed workbook bytes before parsing", () => {
    expect(() => verifyPopulationHash(Buffer.from("changed workbook"))).toThrow("pinned hash differs");
  });
  it("keeps the 333 English rows and published anchors", () => {
    expect(Object.keys(population.areas)).toHaveLength(333);
    for (const [code, count] of Object.entries({E07000117: 100946, E08000025: 1176960, E10000017: 1308567, E09000001: 15631, E06000053: 2299})) {
      expect(populationFor(code), code).toBe(count);
    }
    expect(populationSource().date).toBe("2026-10-01");
  });
  it("joins 294 pages exactly and holds the two changed boundaries", () => {
    const pages = councilPages();
    expect(pages.filter(({council}) => populationFor(council.gss) !== null)).toHaveLength(294);
    expect(pages.filter(({council}) => populationFor(council.gss) === null).map(({council}) => council.slug).sort()).toEqual(["barnsley", "sheffield"]);
    expect(populationFor("missing")).toBeNull();
  });
  it("holds a county row for each of the 164 shire districts", () => {
    const districts = councilPages().filter(({tax}) => tax.classCode === "SD");
    expect(districts).toHaveLength(164);
    for (const {council} of districts) expect(populationFor(council.parentGss!)).not.toBeNull();
  });
});
