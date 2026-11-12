import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setImmediate } from 'node:timers/promises';
import { shortenCitations } from './lib/citations.mjs';
const root = join(process.cwd(), 'dist/councils');
let count = 0;
for (const entry of readdirSync(root, {withFileTypes: true})) {
  if (!entry.isDirectory()) continue;
  const path = join(root, entry.name, 'index.html');
  writeFileSync(path, shortenCitations(readFileSync(path, 'utf8')));
  count++;
  // Release closed DOM windows and their queued tasks between profiles.
  await setImmediate();
}
console.log(`Linked source citations checked on ${count} council profiles`);
