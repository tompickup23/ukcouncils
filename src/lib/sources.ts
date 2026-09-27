import { loadYear, yearWords, type Year } from "./council-tax";

/**
 * The words of a source line, built from the source block the fetch script
 * wrote, so the publisher, title, table and date printed under a figure are
 * the ones in the data and never typed into a page.
 */
export interface SourceRef {
  publisher: string;
  title: string;
  url: string;
  table?: string;
  date?: string | null;
  /** Said before the citation, for a figure the site calculated from published ones. */
  method?: string;
}

const LONG_DATE = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function longDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : LONG_DATE.format(date);
}

/** "Table_9" to "Table 9". */
export function tableName(sheet: string): string {
  return sheet.replace(/_/g, " ");
}

export function councilTaxSource(year: Year, table: string, method?: string): SourceRef {
  const { source } = loadYear(year);
  return {
    publisher: "MHCLG",
    title: source.title,
    url: source.url,
    table: tableName(table),
    date: source.published,
    method,
  };
}

/** The source of a year on year change: two band tables, one calculation. */
export function changeSource(from: Year, to: Year): SourceRef {
  const before = loadYear(from).source;
  const after = loadYear(to).source;
  return {
    publisher: "MHCLG",
    title: after.title,
    url: after.url,
    table: `${tableName(after.bandTable)}, and ${tableName(before.bandTable)} for ${yearWords(from)}`,
    date: after.published,
    method: "Calculated from two published tables",
  };
}
