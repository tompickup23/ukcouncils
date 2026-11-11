import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { fetchPinnedJson } from './lib/pinned-json.mjs';
export const LINKS_COMMIT = '2bea52dbe74c7a689a500b3b73ff63dcefb900b6';
export const LINKS_HASH = '085eb3b0511aca0f3fad79a9aa3f0decd5a7b5529240229ceed7731b3fb0b617';
export async function importLocalLinks() {
  const file = 'src/data/local-links.json';
  const input = await fetchPinnedJson(`https://raw.githubusercontent.com/tompickup23/ukplaces/${LINKS_COMMIT}/${file}`, LINKS_HASH, 'Local Links');
  const registry = JSON.parse(readFileSync(resolve(process.cwd(), 'data/registry/councils.json'), 'utf8')).councils;
  const current = JSON.parse(readFileSync(resolve(process.cwd(), 'data/council-tax/england-2026-27.json'), 'utf8')).authorities;
  const councils = {};
  for (const {gss} of Object.values(registry).filter(c => current[c.gss])) {
    const row = input.places[gss];
    assert(row, `missing Local Links record ${gss}`);
    const links = {};
    for (const key of ['councilTax', 'bins']) {
      if (!row.links[key]) continue;
      assert(/^https?:\/\//.test(row.links[key]));
      links[key] = row.links[key];
    }
    if (Object.keys(links).length) councils[gss] = links;
  }
  assert.equal(Object.keys(councils).length, 272);
  assert.equal(Object.values(councils).filter(c => c.councilTax).length, 266);
  assert.equal(Object.values(councils).filter(c => c.bins).length, 218);
  const output = {source: input.source, checkedOn: input.checkedOn, services: input.services, via: {publisher: 'UK Places', file, commit: LINKS_COMMIT, sha256: LINKS_HASH}, councils};
  writeFileSync(resolve(process.cwd(), 'data/links/local-links.json'), JSON.stringify(output, null, 2) + '\n');
  console.log('Imported Local Links for 272 councils: 266 tax links and 218 bin links.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await importLocalLinks();
