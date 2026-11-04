import type { APIRoute } from "astro";
import { programmaticPaths } from "../lib/paths";
import { sitemapEntries } from "../lib/lastmod";
import { STATIC_PATHS, absoluteUrl } from "../lib/site";

/** Every indexable path: the hubs, then every programmatic page. */
export function sitemapPaths(): string[] {
  return [...STATIC_PATHS, ...programmaticPaths()];
}

export const GET: APIRoute = () => {
  // lastmod is the newest source date the page draws on (src/lib/lastmod.ts),
  // never the build time. A page with no dated source carries none.
  const lastmod = new Map(sitemapEntries().map((entry) => [entry.path, entry.lastmod]));
  const urls = sitemapPaths()
    .map((path) => {
      const date = lastmod.get(path);
      return `  <url><loc>${absoluteUrl(path)}</loc>${date ? `<lastmod>${date}</lastmod>` : ""}</url>`;
    })
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
