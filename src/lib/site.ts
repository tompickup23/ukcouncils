export const SITE_NAME = "UK Councils";

/**
 * The canonical origin. Every canonical tag, every Open Graph URL, every entry
 * in the sitemap and the sitemap line in robots.txt is built from this one
 * value through `absoluteUrl`, so a domain move is one edit here.
 */
export const SITE_URL = "https://ukcouncils.co.uk";

export const SITE_TAGLINE = "Your council, from the official record";

export const DEFAULT_DESCRIPTION =
  "Council tax by band and how much it changed for every council in England, from the official "
  + "MHCLG tables, each figure with its source and date.";

/**
 * Cloudflare Web Analytics. The site token is public: it is printed in every
 * page. The beacon script loads from BEACON_SCRIPT and posts page loads to
 * BEACON_ENDPOINT, which is why the CSP allows the one in script-src and the
 * other in connect-src. scripts/check-dist.mjs fails a page that does not
 * carry exactly one beacon with this token.
 */
export const CF_BEACON_TOKEN = "78d78550d291419997e07dfb8c36dbdc";
export const BEACON_SCRIPT = "https://static.cloudflareinsights.com/beacon.min.js";
export const BEACON_ENDPOINT = "https://cloudflareinsights.com";

/** The key the manual theme choice is stored under. public/theme-init.js reads the same key. */
export const THEME_STORAGE_KEY = "ukcouncils-theme";

/**
 * Static routes that are indexable. Adding a hub page under src/pages means
 * adding it here in the same change, or it never reaches the sitemap or the
 * search index. tests/site.test.ts fails on a hub that is missing.
 * Programmatic pages (one per council, band or region) are listed by
 * src/lib/paths.ts from the data that builds them.
 */
export const STATIC_PATHS = [
  "/",
  "/your-area/",
  "/councils/",
  "/council-tax/",
  "/council-tax/rises-2026-27/",
  "/about/",
  "/methodology/",
  "/sources/",
  "/privacy/",
] as const;

export type NavItem = { href: string; label: string; desc: string };
export type NavGroup = { label: string; items: NavItem[] };

/** The mega menu. A page not listed here is reachable only by link. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Councils",
    items: [
      { href: "/your-area/", label: "Your area", desc: "Find your council by postcode" },
      { href: "/councils/", label: "Every council", desc: "All 296 councils in England, by region" },
    ],
  },
  {
    label: "Council tax",
    items: [
      { href: "/council-tax/", label: "Council tax in England", desc: "The England average and every council" },
      { href: "/council-tax/band-d/", label: "Band D", desc: "Band D for every council, by region" },
      { href: "/council-tax/rises-2026-27/", label: "Rises 2026/27", desc: "How much each council raised its own share" },
    ],
  },
  {
    label: "About",
    items: [
      { href: "/about/", label: "About", desc: "What the site publishes and its rules" },
      { href: "/methodology/", label: "Methodology", desc: "How every figure is read" },
      { href: "/sources/", label: "Sources", desc: "Every table used, with dates" },
      { href: "/privacy/", label: "Privacy", desc: "What happens to a postcode" },
    ],
  },
];

/** A path on this site as an absolute URL on the canonical origin. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

/**
 * The document title. Every page carries the site name after a pipe, never a
 * hyphen or a dash; the home page is the site name alone.
 */
export function pageTitle(title?: string): string {
  return title ? `${title} | ${SITE_NAME}` : SITE_NAME;
}

/**
 * JSON-LD as the text of a script element. `<` is escaped so no string in the
 * data can close the element early.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
