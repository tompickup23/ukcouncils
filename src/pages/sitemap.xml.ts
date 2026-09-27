import type { APIRoute } from "astro";
import { programmaticPaths } from "../lib/paths";
import { STATIC_PATHS, absoluteUrl } from "../lib/site";
import { CURRENT_YEAR, loadYear } from "../lib/council-tax";

/** Every indexable path: the hubs, then every programmatic page. */
export function sitemapPaths(): string[] {
  return [...STATIC_PATHS, ...programmaticPaths()];
}

export const GET: APIRoute = () => {
  // Every page is built from the council tax tables, so the day the current
  // table was last updated is the day any page last changed.
  const lastmod = loadYear(CURRENT_YEAR).source.updated;
  const urls = sitemapPaths()
    .map((path) => `  <url><loc>${absoluteUrl(path)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
