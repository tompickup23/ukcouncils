import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { dataUpdates } from "../src/lib/dataset-dates";
import { allUpdates, binLabel, changeDistribution, findingUpdates, parishComponent } from "../src/lib/findings";
import { feedXml } from "../src/pages/rss.xml";
import { sitemapPaths } from "../src/pages/sitemap.xml";

/**
 * The findings notes and the feed. Every count is recomputed here from the
 * JSON files with nothing shared with src/lib/findings.ts but the files, so
 * a page figure that drifts from the data fails.
 */

const json = (path: string) => JSON.parse(readFileSync(join(process.cwd(), path), "utf-8"));

interface RawNote { id: string; text: string }
interface RawOwn { bandD: number | null; changePct: number | null; bandDWithParish: number | null; table: string; notes: RawNote[] }
interface RawAuthority { classCode: string; own: RawOwn | null }
const current = json("data/council-tax/england-2026-27.json") as {
  generated: string;
  source: { published: string; notes: Record<string, string> };
  authorities: Record<string, RawAuthority>;
};
const authorities = Object.values(current.authorities);

// MHCLG notes s and w: the published change is rounded and the actual change
// is below the referendum threshold. Read from each council's own row.
const ROUNDED_IDS = ["s", "w"];
const roundedNote = (a: RawAuthority) => a.own?.notes.find((n) => ROUNDED_IDS.includes(n.id)) ?? null;
// The bin a recount puts a change in: whole points of a rise, or of the size of a fall.
const recountBin = (pct: number) => (pct >= 0 ? Math.floor(pct) : -(Math.floor(-pct) + 1));

describe("the change distribution note", () => {
  const note = changeDistribution();

  it("counts each council in each class in its whole point bin, as a recount of the file gives", () => {
    const expected: Record<string, Record<number, number>> = {};
    for (const a of authorities) {
      const pct = a.own?.changePct;
      if (typeof pct !== "number" || roundedNote(a)) continue;
      const bin = recountBin(pct);
      expected[a.classCode] ??= {};
      expected[a.classCode]![bin] = (expected[a.classCode]![bin] ?? 0) + 1;
    }
    const actual: Record<string, Record<number, number>> = {};
    for (const group of note.classes) {
      actual[group.classCode] = Object.fromEntries(group.rows.filter((r) => !r.note).map((r) => [r.floor, r.count]));
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

  it("shows every council carrying MHCLG note s or w in a row with its note, never in a whole point row", () => {
    const expected: Record<string, Record<string, number>> = {};
    for (const a of authorities) {
      const n = roundedNote(a);
      const pct = a.own?.changePct;
      if (!n || typeof pct !== "number") continue;
      expected[a.classCode] ??= {};
      const key = `${n.id} ${pct}`;
      expected[a.classCode]![key] = (expected[a.classCode]![key] ?? 0) + 1;
    }
    expect(Object.keys(expected).length).toBeGreaterThan(0);
    const actual: Record<string, Record<string, number>> = {};
    for (const group of note.classes) {
      for (const row of group.rows.filter((r) => r.note)) {
        actual[group.classCode] ??= {};
        actual[group.classCode]![`${row.note!.id} ${row.published}`] = row.count;
        expect(row.label).toBe(`published as ${row.published!.toFixed(2)}%, below the threshold per MHCLG note ${row.note!.id}`);
      }
    }
    expect(actual).toEqual(expected);
    const used = [...new Set(authorities.flatMap((a) => (roundedNote(a) ? [roundedNote(a)!.id] : [])))].sort();
    expect(note.roundingNotes.map((n) => n.id).sort()).toEqual(used);
    for (const n of note.roundingNotes) expect(n.text).toBe(current.source.notes[n.id]);
  });

  it("prints every MHCLG rounding note under the table on the built page", () => {
    const page = join(process.cwd(), "dist", "findings", "index.html");
    if (!existsSync(page)) return;
    const html = readFileSync(page, "utf-8");
    for (const n of note.roundingNotes) {
      expect(html).toContain(`data-mhclg-note="${n.id}"`);
      expect(html).toContain(`below the threshold per MHCLG note ${n.id}`);
    }
  });

  it("labels falls by their size, with no zero lower bound", () => {
    expect(binLabel(-1)).toBe("a fall of under 1%");
    expect(binLabel(-6)).toBe("a fall of 5% to under 6%");
    expect(binLabel(0)).toBe("0% to under 1%");
    for (const row of note.classes.flatMap((g) => g.rows)) expect(row.label).not.toMatch(/more than 0%/);
  });

  it("orders bins by percentage within a class, never councils, and dates the read", () => {
    for (const group of note.classes) {
      const keys = group.rows.map((r) => (r.note ? r.floor - 0.5 : r.floor));
      expect(keys).toEqual([...keys].sort((a, b) => a - b));
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

  it("carries MHCLG note x, read from the data, under the parish note", () => {
    const held = authorities.flatMap((a) => a.own?.notes ?? []).filter((n) => n.id === "x");
    expect(held.length).toBeGreaterThan(0);
    expect(note.pendingNotes.map((n) => n.id)).toEqual(["x"]);
    expect(note.pendingNotes[0]!.text).toBe(current.source.notes.x);
    const page = join(process.cwd(), "dist", "findings", "index.html");
    if (existsSync(page)) expect(readFileSync(page, "utf-8")).toContain('data-mhclg-note="x"');
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

// sax is a declared devDependency; it is a strict XML parser, so a malformed
// feed throws.
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
      expect(item.description, item.guid).toMatch(/, accessed \d{1,2} [A-Z][a-z]+ \d{4}\.$/);
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

  it("names the file behind every item that is not an MHCLG table", () => {
    const byPrefix = (prefix: string) => items.filter((i) => i.guid.startsWith(`ukcouncils-${prefix}`));
    for (const i of byPrefix("registry-")) expect(i.description).toContain("data/registry/councils.json");
    for (const i of byPrefix("school-holidays-")) expect(i.description).toMatch(/data\/school-holidays\/\S+\.json/);
    for (const i of byPrefix("spending-")) expect(i.description).toContain("data/spending/aidoge-summaries.json");
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
