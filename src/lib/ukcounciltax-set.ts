import { readFileSync } from "node:fs";
import { join } from "node:path";
import { councilPages } from "./paths";

/**
 * UK Council Tax decides which councils have a "Set the budget" page. This site
 * links to those pages only, from the copy that scripts/copy-ukcounciltax-set.mjs
 * saves with the source file's SHA256 pinned. tests/ukcounciltax-set.test.ts
 * checks the copy, and compares it with UK Council Tax when that checkout exists.
 */
export interface SetManifest {
  copiedFrom: { repository: string; path: string; commit: string; sha256: string; edition: string; model: string; reviewedOn: string };
  hub: string;
  verifiedLive: { source: string; fetched: string; setPagesListed: number };
  eligibleSha256: string;
  eligible: { gss: string; slug: string; name: string }[];
}

export const UKCT_ORIGIN = "https://ukcounciltax.co.uk";

export function loadSetManifest(): SetManifest {
  return JSON.parse(readFileSync(join(process.cwd(), "data/links/ukcounciltax-set.json"), "utf8"));
}

export interface SetLink { gss: string; name: string; href: string }

/** One link per eligible council, named as this site names it, A to Z. */
export function setLinks(manifest = loadSetManifest()): SetLink[] {
  const names = new Map(councilPages().map(({ council, tax }) => [council.gss, tax.name]));
  return manifest.eligible
    .map(({ gss, slug }) => {
      const name = names.get(gss);
      if (!name) throw new Error(`Set the budget: ${gss} has no council page on this site`);
      return { gss, name, href: `${UKCT_ORIGIN}/tools/budget/${encodeURIComponent(slug)}/set/` };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "en-GB"));
}
