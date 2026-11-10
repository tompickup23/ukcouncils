import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pounds } from "../src/lib/council-tax";
import { councilPages } from "../src/lib/paths";
import { populationFor } from "../src/lib/population";
import { collectionFor, collectionRate } from "../src/lib/collection";
import { electionFor } from "../src/lib/elections";
import { councilEfs } from "../src/lib/council-efs";

/**
 * The summary row on every council page (D1): a tile only for a fact the data holds,
 * Band D first, each value equal to the data, and each short source line pointing at an
 * address the page's own sources list carries.
 */
const DIST = join(resolve(import.meta.dirname, ".."), "dist");
const built = existsSync(join(DIST, "councils"));
const pages = councilPages();
const page = (slug: string) => readFileSync(join(DIST, "councils", slug, "index.html"), "utf-8");
const text = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#39;|&#x27;/g, "'").replace(/\s+/g, " ").trim();

function tiles(html: string) {
  const row = /<section[^>]*data-profile-summary[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
  return [...row.matchAll(/<li[^>]*data-summary-tile="([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)].map((m) => ({
    id: m[1],
    html: m[2],
    value: text(/class="summary-value[^"]*"[^>]*>([\s\S]*?)<\/span>/.exec(m[2])?.[1] ?? ""),
    sourceHref: /class="source-line source-short"[^>]*>[\s\S]*?<a href="([^"]+)"/.exec(m[2])?.[1] ?? null,
    moreHref: /class="summary-more"[^>]*><a href="([^"]+)"/.exec(m[2])?.[1] ?? null,
  }));
}

describe.skipIf(!built)("the summary row on every built council page", () => {
  it("shows a tile only for a fact the data holds, Band D first, with the published values", () => {
    const counts = { "council-tax": 0, about: 0, collection: 0, elections: 0, "exceptional-financial-support": 0 } as Record<string, number>;
    for (const { council, tax } of pages) {
      const found = tiles(page(council.slug));
      const expected = [
        "council-tax",
        ...(populationFor(council.gss) !== null ? ["about"] : []),
        ...(collectionFor(council.gss)?.rate != null ? ["collection"] : []),
        ...(electionFor(council.gss) ? ["elections"] : []),
        ...(councilEfs(council.slug) ? ["exceptional-financial-support"] : []),
      ];
      expect(found.map((t) => t.id), council.slug).toEqual(expected);
      for (const id of expected) counts[id] += 1;
      const by = Object.fromEntries(found.map((t) => [t.id, t]));
      expect(by["council-tax"].value, council.slug).toBe(pounds(tax.bands.D));
      const residents = populationFor(council.gss);
      if (residents !== null) expect(by.about.value, council.slug).toBe(new Intl.NumberFormat("en-GB").format(residents));
      const rate = collectionFor(council.gss)?.rate;
      if (rate != null) expect(by.collection.value, council.slug).toBe(collectionRate(rate));
      const election = electionFor(council.gss);
      if (election) expect(by.elections.value, council.slug).toBe(String(election.dateLabel ?? election.nextYear));
    }
    // The coverage the B2 dist check reports for the sections these tiles point at.
    expect(counts).toEqual({ "council-tax": 296, about: 294, collection: 296, elections: 174, "exceptional-financial-support": 51 });
  });

  it("links every tile to a section on the page and every short source to a listed address", () => {
    for (const { council } of pages) {
      const html = page(council.slug);
      const list = /<ul[^>]*data-profile-sources[\s\S]*?<\/ul>/.exec(html)?.[0] ?? "";
      const listed = new Set([...list.matchAll(/href="([^"]+)"/g)].map((m) => m[1]));
      for (const tile of tiles(html)) {
        expect(tile.moreHref, `${council.slug} ${tile.id}`).toBe(`#${tile.id}`);
        expect(html.includes(`id="${tile.id}"`), `${council.slug} #${tile.id}`).toBe(true);
        if (tile.sourceHref) expect(listed.has(tile.sourceHref), `${council.slug} ${tile.id} ${tile.sourceHref}`).toBe(true);
        // A figure tile always carries its short source; the one text tile carries none.
        expect(tile.sourceHref === null, `${council.slug} ${tile.id}`).toBe(tile.id === "exceptional-financial-support");
      }
    }
  });

  it("puts the parish caveat under the Band D tile and keeps one Band D answer below it", () => {
    for (const slug of ["burnley", "birmingham", "camden"]) {
      const html = page(slug);
      const bandD = tiles(html).find((t) => t.id === "council-tax")!;
      expect(text(bandD.html), slug).toMatch(/Area average including parish precepts/);
      // The repeated figure cards left the position section; the strip stays.
      const section = /<section[^>]*id="tax-summary"[\s\S]*?<\/section>/.exec(html)?.[0] ?? "";
      expect(section, slug).not.toMatch(/class="fact-grid"/);
      expect(section, slug).toMatch(/band-d-position/);
    }
  });
});
