import type { APIRoute } from "astro";
import { YEARS, loadYear, yearLabel } from "../lib/council-tax";
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl } from "../lib/site";

/**
 * The feed. Today it carries one item per council tax year the site holds,
 * dated by MHCLG's publication; by-elections join it with the elections data.
 * Items name no person.
 */
const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const GET: APIRoute = () => {
  const items = [...YEARS]
    .reverse()
    .map((year) => {
      const { source } = loadYear(year);
      const date = source.published ? new Date(`${source.published}T09:30:00Z`).toUTCString() : null;
      const link = absoluteUrl("/council-tax/");
      return `    <item>
      <title>${escape(`Council tax ${yearLabel(year)} for every council in England`)}</title>
      <link>${link}</link>
      <guid isPermaLink="false">ukcouncils-council-tax-${year}</guid>
      ${date ? `<pubDate>${date}</pubDate>` : ""}
      <description>${escape(`${source.title}, published by ${source.publisher}. Band A to H for every billing authority.`)}</description>
    </item>`;
    })
    .join("\n");
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(SITE_NAME)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escape(DEFAULT_DESCRIPTION)}</description>
    <language>en-gb</language>
${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
};
