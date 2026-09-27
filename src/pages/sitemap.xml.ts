import type { APIRoute } from "astro";
import { STATIC_PATHS, absoluteUrl } from "../lib/site";

/** Every indexable path. Programmatic pages join this list as they are built. */
export function sitemapPaths(): string[] {
  return [...STATIC_PATHS];
}

export const GET: APIRoute = () => {
  const urls = sitemapPaths()
    .map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`)
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
