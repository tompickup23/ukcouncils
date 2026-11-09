import { heldWording, RA_906_LABEL } from '../scripts/lib/held-wording.mjs';
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadRegistry } from "../src/lib/registry";

// The reorganisation field is held until the registry is rebuilt from a
// corrected UK Places source. See "Held data" in CLAUDE.md.
const HELD_PHRASES = ["government-decided", "four-unitary", "Structural Change Order"];
const DIST = resolve(process.cwd(), "dist");

function* htmlFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (path.endsWith(".html")) yield path;
  }
}

describe("the held reorganisation field", () => {
  it("leaves the registry loading with every council", () => {
    const councils = Object.values(loadRegistry().councils);
    expect(councils.length).toBe(361);
  });

  it("is not read by the council page", () => {
    const page = readFileSync(resolve(process.cwd(), "src/pages/councils/[slug].astro"), "utf-8");
    expect(page).not.toMatch(/\.reorganisation\b/);
  });

  it("is not read anywhere under src except its type", () => {
    const readers: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(ts|astro|mjs|js|tsx)$/.test(path) && /\.reorganisation\b/.test(readFileSync(path, "utf-8"))) readers.push(path);
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(readers).toEqual([]);
  });

  it.skipIf(!existsSync(DIST))("appears on no built page under dist", () => {
    const hits: string[] = [];
    for (const path of htmlFiles(DIST)) {
      const html = readFileSync(path, "utf-8");
      if (heldWording(html)) hits.push(`held wording in ${path.slice(DIST.length)}`);
      for (const phrase of HELD_PHRASES) if (html.includes(phrase)) hits.push(`${phrase} in ${path.slice(DIST.length)}`);
    }
    expect(hits).toEqual([]);
  });
});


describe("the narrow RA line 906 exception", () => {
  const row = `<tr data-record-type="observation"><th scope="row">${RA_906_LABEL}</th><td>906</td><td>£5,800,000</td></tr>`;
  const table = `<table data-ra-financing><tbody>${row}</tbody></table>`;
  it("accepts the verbatim label only in its original financing row", () => {
    expect(heldWording(table)).toBe(false);
    expect(heldWording('<blockquote cite="https://council.example/reorganisation">The next election is in 2027.</blockquote>')).toBe(false);
    for (const html of [row, `<table>${row}</table>`, table.replace('906', '907'), table.replace('observation', 'calculation'), table.replace('respect of', 'connection with')]) expect(heldWording(html)).toBe(true);
  });
  it("rejects the same label in prose, metadata, citations and other tables", () => {
    for (const html of [`<p>${RA_906_LABEL}</p>`, `<meta content="${RA_906_LABEL}">`, `<meta content="${RA_906_LABEL.replace('-', '&#45;')}">`, `<p class="source-line">${RA_906_LABEL}</p>`, `<ul data-profile-sources><li>${RA_906_LABEL}</li></ul>`, `<table><tr><td>${RA_906_LABEL}</td></tr></table>`, table + `<p>${RA_906_LABEL}</p>`, table.replace('</tbody>', `<tr><td>${RA_906_LABEL}</td></tr></tbody>`)]) expect(heldWording(html)).toBe(true);
  });
});


it.skipIf(!existsSync(DIST))("prints line 906 only on the three source returns and excludes its table from search snippets", () => {
  const found: string[] = [];
  for (const name of readdirSync(join(DIST, 'councils'))) {
    const path = join(DIST, 'councils', name, 'index.html');
    if (!existsSync(path)) continue;
    const html = readFileSync(path, 'utf8');
    if (!html.includes(RA_906_LABEL)) continue;
    found.push(name);
    const tables = html.match(/<table\b[^>]*data-ra-financing[^>]*>[\s\S]*?<\/table>/g) ?? [];
    expect(tables.some(table => table.includes(RA_906_LABEL) && table.includes('data-pagefind-ignore') && /<td[^>]*>906<\/td>/.test(table))).toBe(true);
    expect(heldWording(html)).toBe(false);
    expect(heldWording(html.replace(RA_906_LABEL, 'Inter-authority transfers in respect of REORGANISATION'))).toBe(true);
    expect(heldWording(html + `<p>${RA_906_LABEL}</p>`)).toBe(true);
  }
  expect(found.sort()).toEqual(['bromsgrove', 'buckinghamshire', 'redditch']);
});
