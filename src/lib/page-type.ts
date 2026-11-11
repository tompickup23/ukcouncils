/** The reader's label for each page type; pages of type "other" show no label. */
export const PAGE_TYPE_LABELS = {
  council: "Council",
  band: "Band",
  region: "Region",
  guide: "Guide",
  tool: "Tool",
  hub: "Overview",
  other: null,
} as const;
export type PageType = keyof typeof PAGE_TYPE_LABELS;

/** The label shown beside a search result, or null for none. */
export function pageTypeLabel(type: string | undefined): string | null {
  return type && Object.hasOwn(PAGE_TYPE_LABELS, type) ? PAGE_TYPE_LABELS[type as PageType] : null;
}

/** Classify the canonical path each page already passes to BaseLayout. */
export function pageTypeFor(path: string): PageType {
  if (/^\/councils\/[^/]+\/$/.test(path)) return "council";
  if (/^\/council-tax\/band-[a-h]\/$/.test(path)) return "band";
  if (path === "/council-tax/increases/") return "guide";
  if (/^\/council-tax\/[^/]+\/$/.test(path)) return "region";
  if (["/your-area/", "/compare/"].includes(path)) return "tool";
  if (path === "/methodology/" || /^\/council-tax-\d{4}-\d{2}\/$/.test(path)) return "guide";
  if (["/", "/councils/", "/council-tax/", "/findings/", "/sources/", "/exceptional-financial-support/"].includes(path)) return "hub";
  return "other";
}
