import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sax from "sax";

const source = "https://ukcounciltax.co.uk/sitemap.xml";
const response = await fetch(source, { signal: AbortSignal.timeout(30_000) });
if (!response.ok) throw new Error(`Sitemap fetch failed: HTTP ${response.status}`);
const parser = sax.parser(true);
const locations = [];
let inLocation = false;
let location = "";
parser.onopentag = node => {
  if (node.name === "loc") { inLocation = true; location = ""; }
};
parser.ontext = text => { if (inLocation) location += text; };
parser.oncdata = text => { if (inLocation) location += text; };
parser.onclosetag = name => {
  if (name === "loc") { locations.push(location.trim()); inLocation = false; }
};
parser.write(await response.text()).close();
const urls = [...new Set(locations.filter(value => {
  const url = new URL(value);
  return url.origin === "https://ukcounciltax.co.uk" && url.pathname.startsWith("/councils/");
}))].sort();
const registry = JSON.parse(readFileSync(join(process.cwd(), "data/registry/councils.json"), "utf8"));
const councils = Object.values(registry.councils).filter(c => c.country === "England" && !/county/i.test(c.type));
const missing = councils.filter(c => !urls.includes(`https://ukcounciltax.co.uk/councils/${c.slug}/`));
if (councils.length !== 296 || missing.length) {
  throw new Error(`Sitemap coverage failed: ${councils.length} billing councils; missing: ${missing.map(c => c.slug).join(", ")}`);
}
const councilUrls = urls.filter(url => new URL(url).pathname !== "/councils/");
if (councilUrls.length !== 296) throw new Error(`Expected 296 council URLs; found ${councilUrls.length}`);
const directory = join(process.cwd(), "data/links");
mkdirSync(directory, { recursive: true });
writeFileSync(join(directory, "ukcounciltax-councils.json"), `${JSON.stringify({ fetched: new Date().toISOString(), source, urls }, null, 2)}\n`);
console.log(`Verified ${councilUrls.length} council URLs and saved ${urls.length} sitemap locations.`);
