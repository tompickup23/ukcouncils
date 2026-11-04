import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  BANDS,
  CURRENT_YEAR,
  YEARS,
  bandChange,
  changePhrase,
  councilTaxPath,
  loadYear,
  bandExtremes,
  bandMeaning,
  percentChangeOn,
  pounds,
  tenInstalments,
  twelveInstalments,
  yearLabel,
  yearWords,
} from "../src/lib/council-tax";
import { tableName } from "../src/lib/sources";

/**
 * The committed council tax files, held to the contract the pages rely on.
 * These read the files in the repo by path, so a refresh that changes their
 * shape fails here in the pull request the refresh workflow opens.
 */

describe.each(YEARS)("england-%s.json", (year) => {
  const data = loadYear(year);
  const authorities = Object.entries(data.authorities);

  it("holds every English billing authority in the band table", () => {
    // 296 in each of the three years: 164 shire districts, 63 unitaries,
    // 36 metropolitan districts and 33 London boroughs including the City.
    expect(authorities.length).toBe(296);
    const classes = authorities.reduce<Record<string, number>>((acc, [, a]) => {
      acc[a.classCode] = (acc[a.classCode] ?? 0) + 1;
      return acc;
    }, {});
    expect(classes.SD).toBe(164);
    expect(classes.UA).toBe(63);
    expect(classes.MD).toBe(36);
    expect((classes.ILB ?? 0) + (classes.OLB ?? 0) + (classes.LB ?? 0)).toBe(33);
  });

  it("holds all eight bands as published for every authority", () => {
    for (const [ons, a] of authorities) {
      expect(ons).toMatch(/^E0[6-9]\d{6}$/);
      for (const band of BANDS) {
        expect(typeof a.bands[band], `${ons} ${a.name} Band ${band}`).toBe("number");
        expect(a.bands[band]).toBeGreaterThan(0);
      }
    }
  });

  it("reads the band columns in the right order", () => {
    // Not a derivation: the site prints the published figure for every band.
    // This checks the parse. MHCLG states the ratios to Band D (6/9 for A up to
    // 18/9 for H), so a column read out of order is off by far more than a
    // rounding penny and fails here.
    const ratios: Record<string, number> = { A: 6, B: 7, C: 8, D: 9, E: 11, F: 13, G: 15, H: 18 };
    for (const [ons, a] of authorities) {
      for (const band of BANDS) {
        const expected = (a.bands.D * ratios[band]) / 9;
        expect(Math.abs(a.bands[band] - expected), `${ons} Band ${band}`).toBeLessThanOrEqual(0.02);
      }
    }
  });

  it("carries the authority's own Band D from the published own tables", () => {
    for (const [ons, a] of authorities) {
      expect(a.own, `${ons} has no own figures`).not.toBeNull();
      expect(typeof a.own?.bandD).toBe("number");
      // The area charge includes the county, police, fire and parish shares, so
      // it can never be below the authority's own share.
      expect(a.bands.D).toBeGreaterThanOrEqual(a.own?.bandD ?? Infinity);
    }
  });

  it("names its source, licence and files", () => {
    expect(data.source.publisher).toBe("Ministry of Housing, Communities and Local Government");
    expect(data.source.url).toMatch(/^https:\/\/www\.gov\.uk\/government\/statistics\//);
    expect(data.source.licence).toBe("Open Government Licence v3.0");
    expect(data.source.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    for (const file of data.source.files) {
      expect(file.url).toMatch(/^https:\/\/assets\.publishing\.service\.gov\.uk\/.+\.ods$/);
      expect(file.sha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it("publishes no ranking field at any depth", () => {
    // Ranking is done on a page, labelled, within a class. A rank baked into
    // the data would travel to surfaces that do not label it.
    const text = readFileSync(councilTaxPath(year), "utf-8");
    expect(text).not.toMatch(/"[^"]*(rank|position|percentile|league|vs_peer)[^"]*":/i);
  });
});

describe("the current year", () => {
  const data = loadYear(CURRENT_YEAR);

  it("carries the England area average and the Band D history", () => {
    expect(data.england.areaBandD?.england).toEqual({ pounds: 2392, changePct: 4.9 });
    const history = data.england.history?.rows ?? [];
    expect(history[0]?.year).toBe("2012-13");
    expect(history.at(-1)).toEqual({ year: CURRENT_YEAR, pounds: 2392, changePct: 4.9 });
  });

  it("matches rows read from the published workbook by hand", () => {
    // Table 9 and Table 8c, 2026 to 2027, read from the ODS on 27 September 2026.
    const burnley = data.authorities.E07000117;
    expect(burnley.name).toBe("Burnley");
    expect(burnley.bands.D).toBe(2549.42);
    expect(burnley.area).toBe("Lancashire");
    expect(burnley.own?.bandD).toBe(351.44);
    expect(burnley.own?.changePct).toBe(1.99);
    const camden = data.authorities.E09000007;
    expect(camden.bands.A).toBe(1471.7);
    expect(camden.bands.H).toBe(4415.1);
    expect(camden.own?.ascBandD).toBe(32.32);
    // A unitary has no county area; the table's [z] is null, not text.
    expect(data.authorities.E06000040.area).toBeNull();
  });

  it("keeps a note with the row it qualifies", () => {
    // Lewes's 2026 to 2027 figures were pending a full council decision when
    // MHCLG published; the note travels with the figures.
    const lewes = data.authorities.E07000063;
    expect(lewes.notes.map((n) => n.id)).toContain("ad");
    expect(lewes.notes.find((n) => n.id === "ad")?.text).toMatch(/pending approval/);
  });
});

describe("the change between years", () => {
  it("is the difference of two published figures", () => {
    const change = bandChange("E07000117", "D");
    expect(change).not.toBeNull();
    const before = loadYear("2025-26").authorities.E07000117.bands.D;
    expect(change?.from).toBe(before);
    expect(change?.to).toBe(2549.42);
    expect(change?.pounds).toBeCloseTo(2549.42 - before, 2);
  });

  it("is absent, never joined, across a reissued ONS code", () => {
    // Barnsley and Sheffield were given new codes in 2024 with their boundary
    // change; 2024-25 files them under the old ones.
    expect(loadYear("2024-25").authorities.E08000038).toBeUndefined();
    expect(bandChange("E08000038", "D", "2024-25", "2025-26")).toBeNull();
    expect(bandChange("E08000038", "D")).not.toBeNull();
  });

  it("reads as a phrase with direction and no sign", () => {
    expect(changePhrase({ pounds: 12.3, pct: 4.94 })).toBe("up £12.30 (4.9%)");
    expect(changePhrase({ pounds: -1, pct: -0.3 })).toBe("down £1.00 (0.3%)");
    expect(changePhrase({ pounds: 0, pct: 0 })).toBe("unchanged");
  });

  it("reads a percent change line with direction and no sign", () => {
    expect(percentChangeOn(4.9, "2025/26")).toBe("up 4.9% on 2025/26");
    expect(percentChangeOn(-0.3, "2025/26")).toBe("down 0.3% on 2025/26");
    expect(percentChangeOn(0, "2025/26")).toBe("up 0.0% on 2025/26");
    expect(percentChangeOn(null, "2025/26")).toBeNull();
  });
});

describe("formatting", () => {
  it("prints the annual charge over ten instalments", () => {
    expect(tenInstalments(2549.42)).toBe(254.94);
  });

  it("prints the annual charge over twelve instalments", () => {
    expect(twelveInstalments(2549.42)).toBe(212.45);
    expect(twelveInstalments(2392)).toBe(199.33);
  });

  it("prints n/a for an absent figure and never a zero", () => {
    expect(pounds(null)).toBe("n/a");
    expect(pounds(undefined)).toBe("n/a");
    expect(pounds(0)).toBe("£0.00");
  });

  it("writes years the two ways the site uses", () => {
    expect(yearLabel("2026-27")).toBe("2026/27");
    expect(yearWords("2026-27")).toBe("2026 to 2027");
  });
});

describe("band headline helpers", () => {
  it("states what each band is from the Table 9 ratio note", () => {
    expect(bandMeaning("D")).toContain("reference council tax band");
    expect(bandMeaning("E")).toContain("eleven ninths of Band D");
    expect(bandMeaning("A")).toContain("six ninths of Band D");
  });

  it("reads the lowest and highest Table 9 charges for a band", () => {
    const { lowest, highest } = bandExtremes("D");
    expect(lowest.pounds).toBeLessThan(highest.pounds);
    expect(lowest.name.length).toBeGreaterThan(0);
    expect(highest.name.length).toBeGreaterThan(0);
    expect(tenInstalments(lowest.pounds)).toBe(Number((lowest.pounds / 10).toFixed(2)));
    expect(twelveInstalments(highest.pounds)).toBe(Number((highest.pounds / 12).toFixed(2)));
  });

  it("divides the held England Band D average by ten and twelve the same way as elsewhere", () => {
    const annual = loadYear(CURRENT_YEAR).england.areaBandD?.england.pounds;
    expect(typeof annual).toBe("number");
    if (typeof annual !== "number") return;
    expect(tenInstalments(annual)).toBe(Number((annual / 10).toFixed(2)));
    expect(twelveInstalments(annual)).toBe(Number((annual / 12).toFixed(2)));
  });

  it("names the England average table from the source record, never a literal", () => {
    const area = loadYear(CURRENT_YEAR).england.areaBandD;
    expect(area?.table).toBeTruthy();
    expect(tableName(area!.table)).toBe(area!.table.replace(/_/g, " "));
    const headline = readFileSync("src/components/BandHeadline.astro", "utf-8");
    expect(headline).not.toMatch(/"Table 7"/);
    expect(headline).toMatch(/tableName\(area\.table\)/);
  });
});
