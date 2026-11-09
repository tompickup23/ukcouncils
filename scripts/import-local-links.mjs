import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { fetchPinnedJson } from './lib/pinned-json.mjs';
export const LINKS_COMMIT = 'b1a32625943981c9f5a1c97e1c8f89d2dadc1985';
export const LINKS_HASH = '5c9e6a32e96fa0307ed077711ffb357922fa0c56052d368365ae68e488e181f9';
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
  assert.equal(Object.keys(councils).length, 258);
  assert.equal(Object.values(councils).filter(c => c.councilTax).length, 254);
  assert.equal(Object.values(councils).filter(c => c.bins).length, 207);
  const output = {source: input.source, checkedOn: input.checkedOn, services: input.services, via: {publisher: 'UK Places', file, commit: LINKS_COMMIT, sha256: LINKS_HASH}, councils};
  writeFileSync(resolve(process.cwd(), 'data/links/local-links.json'), JSON.stringify(output, null, 2) + '\n');
  console.log('Imported Local Links for 258 councils: 254 tax links and 207 bin links.');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await importLocalLinks();
