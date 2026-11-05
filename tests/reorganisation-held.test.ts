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
      for (const phrase of HELD_PHRASES) if (html.includes(phrase)) hits.push(`${phrase} in ${path.slice(DIST.length)}`);
    }
    expect(hits).toEqual([]);
  });
});
