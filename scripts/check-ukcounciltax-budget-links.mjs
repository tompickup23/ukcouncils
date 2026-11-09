/** Manual live sitemap snapshot. Builds only read the saved result. */
import {readFileSync, writeFileSync} from 'node:fs';
const source = 'https://ukcounciltax.co.uk/sitemap.xml';
const response = await fetch(source);
if (!response.ok) throw new Error(`Sitemap HTTP ${response.status}`);
const xml = await response.text();
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
const budgetUrls = new Set(urls.filter(url => /^https:\/\/ukcounciltax\.co\.uk\/tools\/budget\/(?:[^/]+\/)?$/.test(url)));
if (budgetUrls.size !== 297) throw new Error(`Expected 297 budget locations, found ${budgetUrls.size}`);
const registry = JSON.parse(readFileSync('data/registry/councils.json', 'utf8'));
const tax = JSON.parse(readFileSync('data/council-tax/england-2026-27.json', 'utf8'));
const urlsByGss = {};
for (const council of Object.values(registry.councils).filter(row => tax.authorities[row.gss])) {
  const url = [...budgetUrls].find(url => new URL(url).pathname === `/tools/budget/${council.slug}/`);
  if (!url) throw new Error(`Missing verified budget route for ${council.gss}`);
  urlsByGss[council.gss] = url;
}
if (Object.keys(urlsByGss).length !== 296) throw new Error('Expected 296 billing routes');
writeFileSync('data/links/ukcounciltax-budget.json', JSON.stringify({fetched: new Date().toISOString(), source, urlsByGss}, null, 2) + '\n');
console.log(`Verified ${Object.keys(urlsByGss).length} billing routes among ${budgetUrls.size} budget locations`);
