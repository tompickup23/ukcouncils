/** Acceptance check in disposable copies. The real raw cache is never modified. */
import {mkdtempSync, mkdirSync, copyFileSync, readFileSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {importBudget} from './import-ra-budget.mjs';
const root = process.cwd();
const scratch = mkdtempSync(join(tmpdir(), 'ukc-ra-cache-'));
const originalFetch = globalThis.fetch;
try {
  for (const path of ['data/budget', 'tests/fixtures']) mkdirSync(join(scratch, path), {recursive: true});
  for (const path of ['data/budget/sources.json', 'data/budget/table-10-2026-27.json', 'tests/fixtures/budget-ct-reconciliation.json']) copyFileSync(join(root, path), join(scratch, path));
  const expected = readFileSync(join(root, 'data/budget/ra-2026-27.json'));
  process.chdir(scratch);
  const identical = () => {
    if (!readFileSync('data/budget/ra-2026-27.json').equals(expected)) throw new Error('Imported JSON differs from pinned output');
  };
  await importBudget(); identical();
  console.log('Cold cache: downloaded, rehashed and reproduced pinned JSON');
  globalThis.fetch = async () => {throw new Error('Network disabled for warm cache check');};
  await importBudget(); identical();
  console.log('Warm cache: passed with all network requests refused');
  const sources = JSON.parse(readFileSync('data/budget/sources.json', 'utf8'));
  for (const source of Object.values(sources)) {
    const path = join('data/raw', source.file);
    const original = readFileSync(path);
    const changed = Buffer.from(original); changed[0] ^= 1; writeFileSync(path, changed);
    let rejected = false;
    try {await importBudget();} catch (error) {rejected = error.message.includes('pinned hash mismatch');}
    finally {writeFileSync(path, original);}
    if (!rejected) throw new Error(`Tampered cache accepted: ${source.file}`);
    if (createHash('sha256').update(readFileSync(path)).digest('hex') !== source.sha256) throw new Error('Restore failed');
    console.log(`Tampered byte: rejected before parsing ${source.file}`);
  }
  await importBudget(); identical();
} finally {
  globalThis.fetch = originalFetch;
  process.chdir(root);
  rmSync(scratch, {recursive: true, force: true});
}
