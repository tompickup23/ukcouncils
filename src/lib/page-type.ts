export const PAGE_TYPE_LABELS = {
  council: "Council",
  band: "Band",
  region: "Region",
  guide: "Guide",
  hub: "Hub",
  other: "Other",
} as const;
export type PageType = keyof typeof PAGE_TYPE_LABELS;

/** Classify the canonical path each page already passes to BaseLayout. */
export function pageTypeFor(path: string): PageType {
  if (/^\/councils\/[^/]+\/$/.test(path)) return "council";
  if (/^\/council-tax\/band-[a-h]\/$/.test(path)) return "band";
  if (path === "/council-tax/increases/") return "guide";
  if (/^\/council-tax\/[^/]+\/$/.test(path)) return "region";
  if (["/methodology/", "/your-area/", "/compare/"].includes(path)
    || /^\/council-tax-\d{4}-\d{2}\/$/.test(path)) return "guide";
  if (["/", "/councils/", "/council-tax/", "/findings/", "/sources/", "/exceptional-financial-support/"].includes(path)) return "hub";
  return "other";
}
