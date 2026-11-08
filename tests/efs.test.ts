import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { efs, pages, authorities, statements, multipleFigures, figuresByAuthority, figuresByPage } from "../src/lib/efs";
import type { EfsMultipleFigures, EfsRole } from "../src/lib/efs";
import { sha256, extractRows, compareRows, unlistedYearPages } from "../scripts/lib/efs-source.mjs";

const bodies = Object.fromEntries(Object.entries(pages).map(([year, page]) => [year, readFileSync(join(process.cwd(), page.rawFile), "utf8")]));
const rows = Object.entries(bodies).flatMap(([page, body]) => extractRows(body).map((row: ReturnType<typeof extractRows>[number]) => ({ ...row, page })));
const expectedCounts = {
  "2020-21": { main: 9 }, "2021-22": { main: 8 }, "2022-23": { main: 5 },
  "2023-24": { main: 8 }, "2024-25": { main: 19, later: 1 },
  "2025-26": { main: 29, hra: 1, police: 1 },
  "2026-27": { main: 36, hra: 1, police: 2, birmingham_revised: 6 },
};

describe("EFS source integrity", () => {
  it("matches every saved body hash", () => {
    for (const [year, page] of Object.entries(pages)) expect(sha256(bodies[year]), year).toBe(page.bodySha256);
  });

  it("re-extracts all 126 statement cells in their recorded order", () => {
    expect(rows).toHaveLength(126);
    expect(statements).toHaveLength(126);
    for (const [index, statement] of statements.entries()) {
      const row = rows[index];
      const label = `${index + 1}: ${statement.page} ${statement.authorityAsPrinted} ${statement.table}`;
      expect({ page: row.page, table: row.table, authorityAsPrinted: row.authorityAsPrinted, cellSha256: row.cellSha256 }, label)
        .toEqual({ page: statement.page, table: statement.table, authorityAsPrinted: statement.authorityAsPrinted, cellSha256: statement.cellSha256 });
      if (row.supportYear) expect(statement.figures.every((figure) => figure.supportYear === row.supportYear), label).toBe(true);
    }
  });

  it("finds each amount exactly as printed in its source cell", () => {
    for (const [index, statement] of statements.entries()) {
      for (const [figureIndex, figure] of statement.figures.entries()) {
        if (figure.amountGbpM !== null) {
          expect(rows[index].text, `statement ${index + 1}, figure ${figureIndex + 1}: ${statement.page} ${statement.authorityAsPrinted}`)
            .toContain(`£${figure.amountGbpM}m`);
        }
      }
    }
  });

  it("retains the main and additional table row counts", () => {
    const counts: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      counts[row.page] ??= {};
      counts[row.page][row.table] = (counts[row.page][row.table] ?? 0) + 1;
    }
    expect(counts).toEqual(expectedCounts);
    for (const [year, page] of Object.entries(pages)) {
      if (page.proseCount) expect(bodies[year]).toContain(page.proseCount);
    }
  });

  it("resolves the 57 authorities and every linked council slug", () => {
    const registry = JSON.parse(readFileSync(join(process.cwd(), "data/registry/councils.json"), "utf8"));
    const slugs = new Set(Object.values(registry.councils as Record<string, { slug: string }>).map((council) => council.slug));
    expect(Object.keys(authorities)).toHaveLength(57);
    expect(new Set(statements.map((statement) => statement.authority))).toEqual(new Set(Object.keys(authorities)));
    for (const authority of Object.values(authorities)) if (authority.slug !== null) expect(slugs.has(authority.slug), authority.name).toBe(true);
  });

  it("recomputes exactly the 11 multiple-figure cases with HRA kept separate", () => {
    const included: EfsRole[] = ["stated", "prior_year", "revision_note", "later_year"];
    const groups = new Map<string, Omit<EfsMultipleFigures, "relation">>();
    for (const statement of statements) {
      for (const figure of statement.figures) {
        if (!included.includes(figure.role) || figure.amountGbpM === null || !/^\d{4}-\d{2}$/.test(figure.supportYear)) continue;
        const account = statement.table === "hra" ? "hra" : "general";
        const key = `${statement.authority}|${account}|${figure.supportYear}`;
        const group = groups.get(key) ?? { authority: statement.authority, account, supportYear: figure.supportYear, byPage: {} };
        const amounts = group.byPage[statement.page] ?? [];
        if (!amounts.some((amount) => Number(amount) === Number(figure.amountGbpM))) amounts.push(figure.amountGbpM);
        group.byPage[statement.page] = amounts;
        groups.set(key, group);
      }
    }
    const key = (entry: Omit<EfsMultipleFigures, "relation">) => `${entry.authority}|${entry.account}|${entry.supportYear}`;
    const actual = [...groups.values()].filter((entry) => new Set(Object.values(entry.byPage).flat().map(Number)).size > 1).sort((a, b) => key(a).localeCompare(key(b)));
    const expected = multipleFigures.map(({ relation: _relation, ...entry }) => entry).sort((a, b) => key(a).localeCompare(key(b)));
    expect(actual).toHaveLength(11);
    expect(actual).toEqual(expected);
  });

  it("uses only documented roles and gives withdrawn requests no amount", () => {
    const roles = new Set(["stated", "prior_year", "later_year", "revision_note", "superseded", "covering_total", "withdrawn"]);
    const figures = statements.flatMap((statement) => statement.figures);
    expect(figures).toHaveLength(216);
    for (const figure of figures) {
      expect(roles.has(figure.role)).toBe(true);
      if (figure.role === "withdrawn") expect(figure.amountGbpM).toBeNull();
      else expect(figure.amountGbpM).toMatch(/^\d+(\.\d+)?$/);
    }
  });

  it("groups all figures without losing their statement, page or precision", () => {
    const entries = statements.flatMap((statement) => statement.figures.map((figure) => ({ statement, figure })));
    expect([...figuresByPage().values()].flat()).toEqual(entries);
    const byAuthority = figuresByAuthority();
    expect(byAuthority.size).toBe(57);
    for (const [authority, group] of byAuthority) expect(group).toEqual(entries.filter((entry) => entry.statement.authority === authority));
    expect(efs.units).toBe("GBP million as printed");
  });
});

describe("manual EFS change check", () => {
  it("reports changed, added and removed rows and revised year labels", () => {
    const year = "2026-27";
    const sourceRows = extractRows(bodies[year]);
    const expected = statements.filter((statement) => statement.page === year);
    expect(compareRows(year, sourceRows, expected)).toEqual([]);
    const changed = extractRows(bodies[year].replace("£79.6m", "£79.7m"));
    expect(compareRows(year, changed, expected).join("\n")).toContain("row 1, main, Barnet: cell changed");
    expect(compareRows(year, sourceRows.slice(1), expected).join("\n")).toContain("row count changed");
    expect(compareRows(year, [...sourceRows, sourceRows[0]], expected).join("\n")).toContain("added");
    const revised = sourceRows.map((row: ReturnType<typeof extractRows>[number]) => row.supportYear ? { ...row, supportYear: "2019-20" } : row);
    expect(compareRows(year, revised, expected).join("\n")).toContain("revised profile year changed");
  });

  it("reports new year pages in collection links and body HTML", () => {
    const known = Object.values(pages).map((page) => page.url);
    expect(unlistedYearPages({ links: known }, pages)).toEqual([]);
    const path = "/guidance/exceptional-financial-support-for-local-authorities-for-2027-28";
    expect(unlistedYearPages({ details: { body: `<a href="${path}">New year</a>` }, links: [...known, path] }, pages)).toEqual([path]);
  });
});
