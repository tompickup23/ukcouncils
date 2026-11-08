import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { YEARS, loadYear, yearLabel, type Year } from "./council-tax";
import { loadRegistry } from "./registry";
import { longDate, tableName } from "./sources";
import { loadSpending } from "./spending";

/**
 * The edition date of every dataset the site holds, read from the dataset's
 * own file: the MHCLG publication date of each council tax year (and its
 * revision date where MHCLG revised it), the registry edition, the school
 * holidays snapshot date and the AI DOGE export date. Nothing here is typed;
 * a dataset whose file carries no date has no update. Every read resolves
 * from process.cwd().
 */

export type DatasetId = "council-tax" | "registry" | "school-holidays" | "spending";

export interface DataUpdate {
  /** Stable identifier, used as the feed guid. */
  id: string;
  dataset: DatasetId;
  title: string;
  /** ISO date, yyyy-mm-dd. */
  date: string;
  /** One line, ending with the source. */
  description: string;
  /** The page on this site that holds the figures. */
  path: string;
}

interface SchoolHolidaysManifest {
  snapshotDate?: string;
  authorityCount?: number;
  /** The calendar file the manifest points to, in data/school-holidays. */
  file?: string;
}

export function schoolHolidaysManifest(root = process.cwd()): SchoolHolidaysManifest {
  const path = join(root, "data", "school-holidays", "manifest.json");
  if (!existsSync(path)) throw new Error(`${path} is missing.`);
  return JSON.parse(readFileSync(path, "utf-8")) as SchoolHolidaysManifest;
}

const iso = (value: string | null | undefined): string | null =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;

const NUM = new Intl.NumberFormat("en-GB");

function councilTaxUpdates(year: Year): DataUpdate[] {
  const data = loadYear(year);
  const { source } = data;
  const count = Object.keys(data.authorities).length;
  const out: DataUpdate[] = [];
  const published = iso(source.published);
  const cite = `Source: ${source.publisher}, ${source.title}, ${tableName(source.bandTable)}`;
  // The date this site read the MHCLG file, from the data file's own field.
  const accessed = iso(data.generated);
  const read = accessed ? `, accessed ${longDate(accessed)}` : "";
  if (published) {
    out.push({
      id: `council-tax-${year}`,
      dataset: "council-tax",
      title: `Council tax ${yearLabel(year)} for every council in England`,
      date: published,
      description: `Band A to H for ${NUM.format(count)} billing authorities. ${cite}, published ${longDate(published)}${read}.`,
      path: "/council-tax/",
    });
  }
  const updated = iso(source.updated);
  if (updated && updated !== published) {
    out.push({
      id: `council-tax-${year}-revised-${updated}`,
      dataset: "council-tax",
      title: `Council tax ${yearLabel(year)} tables revised by MHCLG`,
      date: updated,
      description: `MHCLG revised the ${yearLabel(year)} tables. ${cite}, updated ${longDate(updated)}${read}.`,
      path: "/council-tax/",
    });
  }
  return out;
}

function registryUpdate(): DataUpdate[] {
  const registry = loadRegistry();
  const date = iso(registry.generated);
  if (!date) return [];
  const count = Object.keys(registry.councils).length;
  return [
    {
      id: `registry-${date}`,
      dataset: "registry",
      title: "List of councils and sister site links refreshed",
      date,
      description: `${NUM.format(count)} local authorities, each sister link checked against that site's live sitemap. Source: UK Places registry, file data/registry/councils.json, edition of ${longDate(date)}, accessed ${longDate(date)}.`,
      path: "/councils/",
    },
  ];
}

function schoolHolidaysUpdate(): DataUpdate[] {
  const manifest = schoolHolidaysManifest();
  const date = iso(manifest.snapshotDate);
  if (!date) return [];
  const count = typeof manifest.authorityCount === "number" ? `${NUM.format(manifest.authorityCount)} education authorities. ` : "";
  const file = typeof manifest.file === "string" ? `data/school-holidays/${manifest.file}` : "data/school-holidays/manifest.json";
  return [
    {
      id: `school-holidays-${date}`,
      dataset: "school-holidays",
      title: "School term and holiday dates refreshed",
      date,
      description: `${count}Source: UK School Holiday Dates, file ${file}, snapshot of ${longDate(date)}, accessed ${longDate(date)}.`,
      path: "/councils/",
    },
  ];
}

function spendingUpdate(): DataUpdate[] {
  const spending = loadSpending();
  const date = iso(spending.source.summaries.generated) ?? iso(spending.generated);
  if (!date) return [];
  const count = Object.keys(spending.bodies).length;
  // The date this site wrote its copy of the export, from the file's own field.
  const accessed = iso(spending.generated) ?? date;
  return [
    {
      id: `spending-${date}`,
      dataset: "spending",
      title: "Published spending records refreshed",
      date,
      description: `What AI DOGE holds of the spending ${NUM.format(count)} councils publish. Source: ${spending.source.publisher}, spending summaries export of ${longDate(date)}, file data/spending/aidoge-summaries.json, accessed ${longDate(accessed)}.`,
      path: "/councils/",
    },
  ];
}

/** Every data update the site holds, newest first. */
export function dataUpdates(): DataUpdate[] {
  return [
    ...YEARS.flatMap(councilTaxUpdates),
    ...registryUpdate(),
    ...schoolHolidaysUpdate(),
    ...spendingUpdate(),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
