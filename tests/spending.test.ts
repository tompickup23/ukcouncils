import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  SPENDING_HEADING,
  gbp,
  loadSpending,
  spendingPath,
  spendingRecord,
  yearsPhrase,
  type SpendingBody,
  type SpendingRecord,
} from "../src/lib/spending";
import { loadRegistry } from "../src/lib/registry";

const withHeadline: SpendingBody = {
  id: "burnley",
  url: "https://aidoge.co.uk/councils/burnley/",
  generated: "2026-09-09",
  thresholdGbp: 500,
  bank: true,
  years: {
    "2024/25": { monthsHeld: 12, records: 4096 },
    "2025/26": { monthsHeld: 12, records: 4489 },
    "2026/27": { monthsHeld: 3, records: 1251 },
  },
  headline: { year: "2025/26", records: 4489, totalNet: 38056787.31 },
};

const withoutHeadline: SpendingBody = {
  id: "chorley",
  url: "https://aidoge.co.uk/councils/chorley/",
  generated: "2026-09-09",
  thresholdGbp: 500,
  bank: false,
  years: {
    "2023/24": { monthsHeld: 12, records: 5000 },
    "2024/25": { monthsHeld: 12, records: 5100 },
    "2025/26": { monthsHeld: 12, records: 5200 },
  },
  headline: null,
};

/** Every string a record would put on a page. */
function strings(record: SpendingRecord): string[] {
  return [
    record.heading,
    ...record.sentences,
    record.caveat ?? "",
    record.link.text,
    record.source.publisher,
    record.source.title,
    record.source.table ?? "",
  ];
}

// Built from parts so this file carries no entity name it looks for.
const DASH = new RegExp(`[\\u2013\\u2014]|&${"m"}dash;|&${"n"}dash;|\\s-\\s`);
const MOTIVE = /\b(hiding|hides|failing|failed to publish|waste|wasted|wasteful|scandal|secretive|unlawful|not compliant|non-compliant)\b/i;

describe("the spending sentence builder", () => {
  it("states the payments, threshold, year and total with the as at date where there is a headline", () => {
    const record = spendingRecord("Burnley", withHeadline);
    expect(record).not.toBeNull();
    expect(record!.heading).toBe(SPENDING_HEADING);
    expect(record!.sentences).toEqual([
      "Burnley published 4,489 payments of £500 and over in 2025/26, totalling £38,056,787, as at 9 September 2026.",
    ]);
    expect(record!.caveat).toMatch(/not all of it/);
    expect(record!.link).toEqual({
      text: "Search every payment on AI DOGE",
      href: "https://aidoge.co.uk/councils/burnley/#transactions",
    });
    expect(record!.source.url).toBe("https://aidoge.co.uk/councils/burnley/");
    expect(record!.source.date).toBe("2026-09-09");
  });

  it("says nothing about the latest month, because no published field states it", () => {
    const record = spendingRecord("Burnley", withHeadline)!;
    expect(record.sentences.join(" ")).not.toMatch(/latest file|covers|June|March/);
  });

  it("leaves the threshold out rather than guessing one", () => {
    const record = spendingRecord("Blackburn with Darwen", { ...withHeadline, thresholdGbp: null })!;
    expect(record.sentences[0]).toBe(
      "Blackburn with Darwen published 4,489 payments in 2025/26, totalling £38,056,787, as at 9 September 2026.",
    );
  });

  it("states the years held and no total where there is no headline", () => {
    const record = spendingRecord("Chorley", withoutHeadline)!;
    expect(record.sentences[0]).toBe("Records held on AI DOGE for 2023/24 to 2025/26, as at 9 September 2026.");
    expect(record.sentences.join(" ")).not.toMatch(/£/);
    expect(record.caveat).toBeNull();
    // No bank, so the link does not promise a search of every payment.
    expect(record.link).toEqual({ text: "See what AI DOGE holds for Chorley", href: "https://aidoge.co.uk/councils/chorley/" });
  });

  it("uses the AI DOGE wording where no year is held", () => {
    const record = spendingRecord("Amber Valley", { ...withoutHeadline, years: {} })!;
    expect(record.sentences).toEqual(["No spending records are held for Amber Valley yet, as at 9 September 2026."]);
  });

  it("never runs a range across a year that is not held", () => {
    expect(yearsPhrase(["2025/26"])).toBe("2025/26");
    expect(yearsPhrase(["2023/24", "2024/25"])).toBe("2023/24 to 2024/25");
    expect(yearsPhrase(["2023/24", "2025/26"])).toBe("2023/24 and 2025/26");
    expect(yearsPhrase(["2021/22", "2023/24", "2025/26"])).toBe("2021/22, 2023/24 and 2025/26");
  });

  it("returns nothing for a council with no AI DOGE body", () => {
    expect(spendingRecord("Luton", null)).toBeNull();
  });

  it("formats money as AI DOGE does, to the whole pound", () => {
    expect(gbp(38056787.31)).toBe("£38,056,787");
    expect(gbp(500)).toBe("£500");
  });

  it("prints no dash and no motive word in any case", () => {
    const records = [
      spendingRecord("Burnley", withHeadline)!,
      spendingRecord("Newcastle-under-Lyme", withoutHeadline)!,
      spendingRecord("Amber Valley", { ...withoutHeadline, years: {} })!,
    ];
    for (const record of records) {
      for (const text of strings(record)) {
        expect(text).not.toMatch(DASH);
        expect(text).not.toMatch(MOTIVE);
      }
    }
  });
});

describe("data/spending/aidoge-summaries.json", () => {
  const data = loadSpending();
  const registry = loadRegistry();
  const bodies = Object.entries(data.bodies);
  const councilById = new Map(Object.values(registry.councils)
    .filter((council) => council.sisters.aidoge)
    .map((council) => [new URL(council.sisters.aidoge!).pathname.split("/").filter(Boolean).at(-1), council]));

  it("holds only councils the registry links to AI DOGE, at the URL the registry holds", () => {
    expect(bodies.length).toBeGreaterThan(0);
    for (const [key, body] of bodies) {
      const council = councilById.get(body.id)!;
      expect(council, key).toBeDefined();
      expect([body.id, council.gss]).toContain(key);
      expect(data.bodies[body.id]).toEqual(body);
      expect(data.bodies[council.gss]).toEqual(body);
      expect(body.url).toBe(council.sisters.aidoge);
      expect(body.url.endsWith(`/${body.id}/`)).toBe(true);
    }
  });

  it("carries no zero headline and a generated date on every body", () => {
    for (const [gss, body] of bodies) {
      expect(body.generated, gss).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      if (body.headline) {
        expect(body.headline.records, gss).toBeGreaterThan(0);
        expect(body.headline.totalNet, gss).not.toBe(0);
      }
    }
  });

  it("stores no supplier, category or ranking field", () => {
    const text = readFileSync(spendingPath(), "utf-8");
    expect(text).not.toMatch(/supplier|category|"rank|position|percentile|league|vs_peer/i);
  });

  it("builds a record for every body it holds", () => {
    for (const [gss, body] of bodies) {
      const record = spendingRecord(councilById.get(body.id)!.name, body);
      expect(record, gss).not.toBeNull();
      for (const text of strings(record!)) expect(text, gss).not.toMatch(DASH);
    }
  });
});
