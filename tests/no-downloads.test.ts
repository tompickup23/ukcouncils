import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

/**
 * Tom, 8 November 2026: no data downloads on UK Councils to start with, and no
 * Asylum Stats link for now. The built pages carry neither.
 */
const DIST = join(resolve(import.meta.dirname, ".."), "dist");
const built = existsSync(join(DIST, "councils"));

describe.skipIf(!built)("built pages", () => {
  const files = built ? (readdirSync(DIST, { recursive: true }) as string[]).filter((f) => f.endsWith(".html")) : [];

  it("offer no CSV or data download control", () => {
    expect(files.length).toBeGreaterThan(300);
    const offending = files.filter((f) => /Download (shown rows as )?CSV|data-(table-)?export|text\/csv/i.test(readFileSync(join(DIST, f), "utf-8")));
    expect(offending).toEqual([]);
  });

  it("link no Asylum Stats page", () => {
    const offending = files.filter((f) => readFileSync(join(DIST, f), "utf-8").includes("asylumstats.co.uk"));
    expect(offending).toEqual([]);
  });
});
