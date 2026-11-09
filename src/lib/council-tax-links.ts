import { readFileSync } from "node:fs";
import { join } from "node:path";

export const councilTaxLinks: { fetched: string; source: string; urls: string[] } = JSON.parse(
  readFileSync(join(process.cwd(), "data/links/ukcounciltax-councils.json"), "utf8"),
);
const verifiedUrls = new Set(councilTaxLinks.urls);

/** An address is published only when the saved live sitemap lists it. */
export function councilTaxLink(slug: string): string | null {
  const url = `https://ukcounciltax.co.uk/councils/${slug}/`;
  return verifiedUrls.has(url) ? url : null;
}
