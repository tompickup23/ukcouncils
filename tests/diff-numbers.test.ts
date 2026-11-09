import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve('scripts/diff-numbers.mjs');
const fixtures = resolve('tests/fixtures/diff-numbers');
let directory: string;
let baseline: string;
let candidate: string;
const council = 'councils/burnley/index.html';

function run(...args: string[]) {
  return spawnSync(process.execPath, [script, baseline, candidate, ...args], { encoding: 'utf8' });
}
function change(path: string, from: string, to: string) {
  const file = join(candidate, path);
  writeFileSync(file, readFileSync(file, 'utf8').replace(from, to));
}
function rows(output: string) {
  return output.trim().split('\n').slice(1, -1).map((line) => line.split('\t'));
}

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), 'diff-numbers-'));
  baseline = join(directory, 'baseline');
  candidate = join(directory, 'candidate');
  cpSync(fixtures, directory, { recursive: true });
});
afterEach(() => rmSync(directory, { recursive: true, force: true }));

describe('built page number comparison', () => {
  it('passes identical builds', () => {
    const result = run();
    expect(result.status).toBe(0);
    expect(rows(result.stdout)).toEqual([]);
    expect(result.stdout).toContain('0 pages outside allowed globs');
  });

  it('reports one changed body figure on its page and fails', () => {
    change(council, '£2,345.67', '£2,345.68');
    const result = run();
    expect(result.status).toBe(1);
    expect(rows(result.stdout)).toEqual([
      [JSON.stringify(council), 'changed', '["£2,345.67"]', '["£2,345.68"]', '[]', '[]', 'body text', 'no'],
    ]);
  });

  it('reports a changed SVG text figure in the SVG columns', () => {
    change(council, '12.5%', '13.5%');
    const result = run();
    expect(result.status).toBe(1);
    expect(rows(result.stdout)[0].slice(2, 7)).toEqual(['[]', '[]', '["12.5%"]', '["13.5%"]', 'SVG text']);
  });

  it('allows a changed page only when a glob covers it', () => {
    change(council, '£2,345.67', '£2,345.68');
    expect(run('--allow', 'councils/*/index.html').status).toBe(0);
    expect(run('--allow', 'index.html', '--allow', 'councils/**').status).toBe(0);
    expect(run('--allow', 'other/**').status).toBe(1);
    expect(run('--allow', 'councils/*.html').status).toBe(1);
  });

  it('reports a removed page and fails unless it is allowed', () => {
    rmSync(join(candidate, council));
    const result = run();
    expect(result.status).toBe(1);
    expect(rows(result.stdout)[0][1]).toBe('removed');
    expect(result.stdout).toContain('1 pages removed');
    expect(run('--allow', 'councils/**').status).toBe(0);
  });

  it('reports added pages even when they have no numbers', () => {
    writeFileSync(join(candidate, 'new.html'), '<p>A new page</p>');
    const result = run();
    expect(result.status).toBe(1);
    expect(rows(result.stdout)[0][1]).toBe('added');
    expect(run('--allow', 'new.html').status).toBe(0);
  });

  it('compares multisets and ignores token order', () => {
    change('index.html', 'Repeated 42 and 42', 'Repeated 42');
    const result = run();
    expect(result.status).toBe(1);
    expect(rows(result.stdout)[0][2]).toBe('["42"]');
    change('index.html', 'Repeated 42', 'Repeated 42 and 42');
    change('index.html', '£1,234.56 and 4.5%', '4.5% and £1,234.56');
    expect(run().status).toBe(0);
  });

  it('ignores metadata, raw scripts, styles, templates, attributes and hidden text', () => {
    for (const figure of ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000']) {
      change('index.html', figure, '9999');
    }
    expect(run().status).toBe(0);
  });

  it('decodes entities and joins inline fragments without joining block figures', () => {
    change(council, '£2,345.67', '&pound;<span>2,345</span>&#46;67');
    change(council, '12.5%', '12<tspan>&#x2e;5</tspan>&percnt;');
    expect(run().status).toBe(0);
    writeFileSync(join(baseline, 'blocks.html'), '<p>12</p><p>34</p>');
    writeFileSync(join(candidate, 'blocks.html'), '<p>1234</p>');
    expect(run().status).toBe(1);
  });

  it('keeps years, grouped numbers and decimals as complete tokens', () => {
    change(council, '£2,345.67 for 2026/27', '£2\u202f345.68 for 2027/28');
    const result = run();
    expect(rows(result.stdout)[0][2]).toBe('["£2,345.67","2026/27"]');
    expect(rows(result.stdout)[0][3]).toBe('["£2 345.68","2027/28"]');
  });

  it('reports both text locations when both change', () => {
    change(council, '£2,345.67', '£2,345.68');
    change(council, '12.5%', '13.5%');
    expect(rows(run().stdout)[0][6]).toBe('both');
  });

  it('rejects missing build directories and incomplete options', () => {
    expect(run('--allow').status).toBe(2);
    rmSync(candidate, { recursive: true });
    const result = run();
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('Number comparison could not run');
  });
});
