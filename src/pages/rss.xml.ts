import type { APIRoute } from "astro";
import { allUpdates } from "../lib/findings";
import { DEFAULT_DESCRIPTION, SITE_NAME, absoluteUrl } from "../lib/site";

/**
 * The feed: one item per data update, dated by the dataset's own edition
 * (src/lib/dataset-dates.ts), and one per findings note. /findings/ lists the
 * same items. Items name no person.
 */
const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function feedXml(): string {
  const items = allUpdates()
    .map(
      (u) => `    <item>
      <title>${escape(u.title)}</title>
      <link>${escape(absoluteUrl(u.path))}</link>
      <guid isPermaLink="false">ukcouncils-${escape(u.id)}</guid>
      <pubDate>${new Date(`${u.date}T09:30:00Z`).toUTCString()}</pubDate>
      <description>${escape(u.description)}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
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
}

export const GET: APIRoute = () =>
  new Response(feedXml(), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
