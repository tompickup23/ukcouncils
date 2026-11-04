import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { dataUpdates } from "../src/lib/dataset-dates";
import { allUpdates, changeDistribution, findingUpdates, parishComponent } from "../src/lib/findings";
import { feedXml } from "../src/pages/rss.xml";
import { sitemapPaths } from "../src/pages/sitemap.xml";

/**
 * The findings notes and the feed. Every count is recomputed here from the
 * JSON files with nothing shared with src/lib/findings.ts but the files, so
 * a page figure that drifts from the data fails.
 */

const json = (path: string) => JSON.parse(readFileSync(join(process.cwd(), path), "utf-8"));

interface RawOwn { bandD: number | null; changePct: number | null; bandDWithParish: number | null; table: string }
interface RawAuthority { classCode: string; own: RawOwn | null }
const current = json("data/council-tax/england-2026-27.json") as {
  generated: string;
  source: { published: string };
  authorities: Record<string, RawAuthority>;
};
const authorities = Object.values(current.authorities);

describe("the change distribution note", () => {
  const note = changeDistribution();

  it("counts each council in each class in its whole point bin, as a recount of the file gives", () => {
    const expected: Record<string, Record<number, number>> = {};
    for (const a of authorities) {
      const pct = a.own?.changePct;
      if (typeof pct !== "number") continue;
      const bin = Math.floor(pct);
      expected[a.classCode] ??= {};
      expected[a.classCode]![bin] = (expected[a.classCode]![bin] ?? 0) + 1;
    }
    const actual: Record<string, Record<number, number>> = {};
    for (const group of note.classes) {
      actual[group.classCode] = Object.fromEntries(group.rows.map((r) => [r.floor, r.count]));
    }
    expect(actual).toEqual(expected);
  });

  it("accounts for every council once", () => {
    const binned = note.classes.flatMap((g) => g.rows).reduce((n, r) => n + r.count, 0);
    expect(binned).toBe(note.total);
    expect(note.total + note.notPublished).toBe(authorities.length);
    for (const group of note.classes) {
      expect(group.councils).toBe(authorities.filter((a) => a.classCode === group.classCode).length);
    }
  });

  it("orders bins by percentage within a class, never councils, and dates the read", () => {
    for (const group of note.classes) {
      const floors = group.rows.map((r) => r.floor);
      expect(floors).toEqual([...floors].sort((a, b) => a - b));
    }
    expect(note.source.date).toBe(current.source.published);
    expect(note.accessed).toBe(current.generated);
    expect(note.source.table).toMatch(/^Table 8a and Table 8c$/);
  });
});

describe("the parish precept note", () => {
  const note = parishComponent();

  it("counts the councils whose average including parish precepts is higher, as a recount gives", () => {
    const expected: Record<string, { withParish: number; without: number; lower: number; notPublished: number }> = {};
    for (const a of authorities) {
      const row = (expected[a.classCode] ??= { withParish: 0, without: 0, lower: 0, notPublished: 0 });
      const excl = a.own?.bandD;
      const incl = a.own?.bandDWithParish;
      if (typeof excl !== "number" || typeof incl !== "number") row.notPublished += 1;
      else if (incl > excl) row.withParish += 1;
      else if (incl === excl) row.without += 1;
      else row.lower += 1;
    }
    expect(Object.fromEntries(note.classes.map((g) => [g.classCode, g.rows]))).toEqual(expected);
    const sum = (k: keyof typeof note.totals) => Object.values(expected).reduce((n, r) => n + r[k], 0);
    expect(note.totals).toEqual({
      withParish: sum("withParish"),
      without: sum("without"),
      lower: sum("lower"),
      notPublished: sum("notPublished"),
    });
  });
});

describe("the dataset dates", () => {
  it("dates each update from the dataset's own file", () => {
    const updates = dataUpdates();
    const holidays = json("data/school-holidays/manifest.json") as { snapshotDate: string };
    const registry = json("data/registry/councils.json") as { generated: string };
    const spending = json("data/spending/aidoge-summaries.json") as { source: { summaries: { generated: string } } };
    const byDataset = (d: string) => updates.filter((u) => u.dataset === d).map((u) => u.date);
    expect(byDataset("school-holidays")).toEqual([holidays.snapshotDate]);
    expect(byDataset("registry")).toEqual([registry.generated]);
    expect(byDataset("spending")).toEqual([spending.source.summaries.generated]);
    for (const year of ["2024-25", "2025-26", "2026-27"]) {
      const published = (json(`data/council-tax/england-${year}.json`) as { source: { published: string } }).source.published;
      expect(updates.find((u) => u.id === `council-tax-${year}`)?.date).toBe(published);
    }
  });
});

// sax ships with Astro's dependency tree (through svgo); it is a strict XML
// parser, so a malformed feed throws.
const require = createRequire(import.meta.url);
const sax = require("sax") as {
  parser: (strict: boolean) => {
    onerror: (e: Error) => void;
    onopentag: (node: { name: string }) => void;
    onclosetag: (name: string) => void;
    ontext: (text: string) => void;
    write: (xml: string) => { close: () => void };
  };
};

interface FeedItem { title: string; link: string; guid: string; pubDate: string; description: string }

function parseFeed(xml: string): FeedItem[] {
  const parser = sax.parser(true);
  const items: FeedItem[] = [];
  const stack: string[] = [];
  let item: Partial<FeedItem> | null = null;
  parser.onerror = (e) => {
    throw e;
  };
  parser.onopentag = (node) => {
    stack.push(node.name);
    if (node.name === "item") item = {};
  };
  parser.onclosetag = (name) => {
    stack.pop();
    if (name === "item" && item) {
      items.push(item as FeedItem);
      item = null;
    }
  };
  parser.ontext = (text) => {
    const tag = stack[stack.length - 1] as keyof FeedItem;
    if (item && stack[stack.length - 2] === "item") item[tag] = (item[tag] ?? "") + text;
  };
  parser.write(xml).close();
  return items;
}

describe("the feed", () => {
  const xml = feedXml();
  const items = parseFeed(xml);

  it("parses as XML and is RSS 2.0", () => {
    expect(xml).toMatch(/<rss version="2.0">/);
    expect(items.length).toBe(allUpdates().length);
  });

  it("gives every item a title, a link on the site, a valid date, a description with its source and a unique guid", () => {
    for (const item of items) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.link).toMatch(/^https:\/\/ukcouncils\.co\.uk\//);
      expect(Number.isNaN(new Date(item.pubDate).getTime())).toBe(false);
      expect(item.description).toMatch(/Source: /);
    }
    expect(new Set(items.map((i) => i.guid)).size).toBe(items.length);
  });

  it("carries at least one item per dataset the site holds, and both findings", () => {
    const guids = items.map((i) => i.guid);
    for (const dataset of ["council-tax-2026-27", "registry-", "school-holidays-", "spending-"]) {
      expect(guids.some((g) => g.startsWith(`ukcouncils-${dataset}`)), dataset).toBe(true);
    }
    for (const finding of findingUpdates()) expect(guids).toContain(`ukcouncils-${finding.id}`);
  });

  it("prints no dash and no motive word", () => {
    expect(xml).not.toMatch(new RegExp(`[\\u2013\\u2014]|&${"m"}dash;|&${"n"}dash;|\\s-\\s`));
    expect(xml).not.toMatch(/\b(hiding|hides|failing|waste|wasted|wasteful|scandal|secretive|unlawful)\b/i);
  });
});

describe("the sitemap", () => {
  it("lists /findings/", () => {
    expect(sitemapPaths()).toContain("/findings/");
  });
});
