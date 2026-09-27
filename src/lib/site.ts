export const SITE_NAME = "UK Councils";

/**
 * The canonical origin. Every canonical tag, every Open Graph URL, every entry
 * in the sitemap and the sitemap line in robots.txt is built from this one
 * value through `absoluteUrl`, so a domain move is one edit here.
 */
export const SITE_URL = "https://ukcouncils.co.uk";

export const DEFAULT_DESCRIPTION =
  "Council tax by band, school term dates, election results and council contracts for every "
  + "local authority in the UK, each figure with its official source and date.";

/** The key the manual theme choice is stored under. public/theme-init.js reads the same key. */
export const THEME_STORAGE_KEY = "ukcouncils-theme";

/**
 * Static routes that are indexable. Adding a hub page under src/pages means
 * adding it here in the same change, or it never reaches the sitemap or the
 * search index. tests/site.test.ts fails on a hub that is missing.
 */
export const STATIC_PATHS = ["/"] as const;

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
