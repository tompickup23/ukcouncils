import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { checkBody } from '../scripts/check-pr-body.mjs';

const block = (heading: string, content: string) => `## ${heading}\n\n\`\`\`text\n${content}\n\`\`\`\n`;
const files = ['index.html', 'sources/index.html', 'councils/burnley/index.html', 'councils/barnet/index.html'];

describe('pull request description check', () => {
  it('passes a description with no controls and says the diff runs strict', () => {
    const result = checkBody('A tooling only change.', files);
    expect(result.errors).toEqual([]);
    expect(result.notes.join(' ')).toContain('runs strict');
    expect(result.notes.join(' ')).toContain('/ and /councils/burnley/');
  });
  it('fails a heading with prose where the fenced block should be', () => {
    const result = checkBody('## Pages allowed to differ\n\n`councils/*/index.html`\n', files);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Number diff');
  });
  it('fails an allowed glob written as a URL path', () => {
    const result = checkBody(block('Pages allowed to differ', '/sources/'), files);
    expect(result.errors[0]).toContain('/sources/index.html');
  });
  it('passes built file globs and warns when one matches nothing', () => {
    expect(checkBody(block('Pages allowed to differ', '/sources/index.html\ncouncils/*/index.html'), files))
      .toMatchObject({ errors: [], warnings: [] });
    expect(checkBody(block('Pages allowed to differ', 'regions/**'), files).warnings).toHaveLength(1);
  });
  it('fails capture paths the design check would reject and warns on unknown pages', () => {
    expect(checkBody(block('Pages to capture', 'dist/index.html'), files).errors[0]).toContain('Design check');
    expect(checkBody(block('Pages to capture', '/\n/councils/burnley/'), files)).toMatchObject({ errors: [], warnings: [] });
    expect(checkBody(block('Pages to capture', '/councils/nowhere/'), files).warnings).toHaveLength(1);
  });
  it('reads the empty blocks in the pull request template as strict and default', () => {
    const template = readFileSync('.github/pull_request_template.md', 'utf8');
    const result = checkBody(template, files);
    expect(result).toMatchObject({ errors: [], warnings: [] });
    expect(result.notes.join(' ')).toContain('is empty');
  });
  it('fails a second heading, as the hosted parser does', () => {
    const twice = block('Pages allowed to differ', 'sources/index.html') + block('Pages allowed to differ', 'index.html');
    expect(checkBody(twice, files).errors[0]).toContain('Use one Pages allowed to differ heading');
  });
  it('skips the built page checks when there is no dist', () => {
    expect(checkBody(block('Pages allowed to differ', 'regions/**'), null)).toMatchObject({ errors: [], warnings: [] });
  });
});
