import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const catalogue = readFileSync(join(process.cwd(), "src/pages/sources.astro"), "utf8");
const citations: Record<string, string[]> = {
  "council-tax": ["loadYear", "source"],
  registry: ["loadRegistry", "registry.source"],
  spending: ["loadSpending", "spending.summaries.url"],
  "school-holidays": ["data/school-holidays/manifest.json", "holidays.snapshotDate"],
  geography: ["boundarySource.url", "boundarySource.publisher"],
  efs: ["efsPages", "page.title", "page.firstPublished"],
  links: ["councilTaxLinks.source", "councilTaxLinks.fetched", "localLinks.source", "budgetLinks.source", "budgetLinks.fetched"],
  budget: ["budget.sources", "source.fileUrl", "source.sha256"],
  population: ["population.source"],
  collection: ["collection.source"],
  elections: ["elections.source"],
};

describe("sources catalogue coverage", () => {
  it("accounts for every committed dataset directory and its citation", () => {
    const directories = readdirSync(join(process.cwd(), "data"), { withFileTypes: true })
      .filter(entry => entry.isDirectory() && !["fonts", "raw"].includes(entry.name))
      .map(entry => entry.name).sort();
    expect(directories).toEqual(Object.keys(citations).sort());
    for (const [directory, fields] of Object.entries(citations)) {
      for (const field of fields) expect(catalogue, `${directory}: ${field}`).toContain(field);
    }
  });
});
