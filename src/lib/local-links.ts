import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { longDate, type SourceRef } from "./sources";
export interface OwnPages { councilTax?: string; bins?: string }
export const localLinks = JSON.parse(readFileSync(resolve(process.cwd(), "data/links/local-links.json"), "utf8")) as {
  source: {name: string; url: string; exportDate: string; licence: string};
  checkedOn: string;
  services: {id: keyof OwnPages; title: string}[];
  councils: Record<string, OwnPages>;
};
export const ownPagesFor = (gss: string): OwnPages | null => localLinks.councils[gss] ?? null;
export const localLinksSource = (): SourceRef => ({
  publisher: localLinks.source.name,
  title: "links to services provided by local authorities",
  url: localLinks.source.url,
  table: `export of ${longDate(localLinks.source.exportDate)}; each link checked by UK Places on ${longDate(localLinks.checkedOn)}`,
});
