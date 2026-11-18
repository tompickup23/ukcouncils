import {describe, expect, it} from 'vitest';
import {readFileSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

/**
 * The budget tests unzip the pinned RA workbooks under data/raw/, which git
 * ignores. A workflow job that runs the unit tests on a fresh checkout must
 * restore those workbooks first. The weekly refresh did not, and failed on
 * 16 November 2026 (run 43878614599).
 */
const dir = '.github/workflows';
const jobs = readdirSync(dir).filter(file => file.endsWith('.yml')).flatMap(file => {
  const text = readFileSync(join(dir, file), 'utf8');
  const body = text.slice(text.indexOf('\njobs:\n') + 7);
  return body.split(/\n(?=  [A-Za-z0-9_-]+:\n)/).map(job => ({file, name: job.trim().split(':')[0], job}));
});
const lineOf = (job: string, pattern: RegExp) => job.split('\n').findIndex(line => pattern.test(line));

describe('workflow jobs that run the unit tests', () => {
  const testing = jobs.filter(({job}) => /^\s*(?:run: )?npm test\s*$/m.test(job));
  it('finds the test jobs in all three workflows', () => {
    expect([...new Set(testing.map(({file}) => file))].sort()).toEqual(['ci.yml', 'deploy.yml', 'refresh-data.yml']);
  });
  it.each(testing)('$file $name restores the pinned RA workbooks before npm test', ({job}) => {
    const restore = lineOf(job, /name: Restore pinned RA workbooks/);
    const rehash = lineOf(job, /node scripts\/import-ra-budget\.mjs/);
    const test = lineOf(job, /^\s*(?:run: )?npm test\s*$/);
    expect(restore).toBeGreaterThan(-1);
    expect(rehash).toBeGreaterThan(restore);
    expect(test).toBeGreaterThan(rehash);
    for (const file of ['RA_2026-27_data_Part_1.ods', 'RA_2026-27_data_Part_2.ods', 'SG_2026-27.ods']) expect(job).toContain(`data/raw/${file}`);
  });
});
