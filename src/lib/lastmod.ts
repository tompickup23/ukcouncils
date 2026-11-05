import { BANDS, CURRENT_YEAR, loadYear, type Authority } from "./council-tax";
import { INCREASES_PATH, STATIC_PATHS } from "./site";
import { REGIONS, bandPath, councilPages, councilPath, regionPath } from "./paths";
import { calendarFor } from "./school-holidays";
import { spendingFor, spendingRecord } from "./spending";
import type { Council } from "./registry";

/**
 * The sitemap lastmod of each page, from the dates in the data the page draws
 * on and never from the build clock. A page that draws on no dated source has
 * no lastmod: an invented date would be worse than none.
 */

const ISO_DAY = /^\d{4}-\d{2}-\d{2}/;

/** The YYYY-MM-DD part of a dated string, or null. */
function day(value: string | null | undefined): string | null {
  const match = value ? ISO_DAY.exec(value) : null;
  return match ? match[0] : null;
}

/** The newest of the dates given, ignoring missing ones. */
export function newest(dates: Array<string | null | undefined>): string | null {
  const days = dates.map(day).filter((d): d is string => d !== null).sort();
  return days.length > 0 ? days[days.length - 1] : null;
}

/** The MHCLG release date of the current year's council tax tables. */
export function councilTaxRelease(): string | null {
  return day(loadYear(CURRENT_YEAR).source.published);
}

/**
 * The newest source date a council page draws on: the MHCLG release behind
 * every band, and where the page shows them, the AI DOGE spending summary,
 * the reorganisation source and the school calendar capture.
 */
export function councilLastmod(council: Council, tax: Authority): string | null {
  const spending = spendingFor(council.gss);
  const calendar = calendarFor(council);
  return newest([
    councilTaxRelease(),
    spending && spendingRecord(tax.name, spending) ? spending.generated : null,
    council.reorganisation?.sourceDate,
    calendar?.year?.retrievedAt,
  ]);
}

/** Hubs built from the current year's council tax tables. */
const COUNCIL_TAX_HUBS: readonly string[] = ["/councils/", "/council-tax/", INCREASES_PATH, "/compare/"];

/** Every sitemap path with its lastmod, or null where no source date applies. */
export function sitemapEntries(): Array<{ path: string; lastmod: string | null }> {
  const release = councilTaxRelease();
  return [
    ...STATIC_PATHS.map((path) => ({ path, lastmod: COUNCIL_TAX_HUBS.includes(path) ? release : null })),
    ...BANDS.map((band) => ({ path: bandPath(band), lastmod: release })),
    ...REGIONS.map((region) => ({ path: regionPath(region), lastmod: release })),
    ...councilPages().map(({ council, tax }) => ({ path: councilPath(council), lastmod: councilLastmod(council, tax) })),
  ];
}
