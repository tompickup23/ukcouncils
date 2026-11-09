import { describe, expect, it } from 'vitest';
import { fencedLines, capturePaths } from '../.github/scripts/review-inputs.mjs';

const block = (heading: string, content: string) => `## ${heading}\n\n\`\`\`text\n${content}\n\`\`\`\n`;

describe('PR review inputs', () => {
  it('allows no pages without an allowance block', () => {
    expect(fencedLines('A brief', 'Pages allowed to differ')).toEqual([]);
    expect(fencedLines(block('Pages allowed to differ', ''), 'Pages allowed to differ')).toEqual([]);
  });
  it('reads individual globs as data', () => {
    expect(fencedLines(block('Pages allowed to differ', 'councils/**\n$(touch example)'), 'Pages allowed to differ'))
      .toEqual(['councils/**', '$(touch example)']);
  });
  it('ignores headings inside other fenced examples', () => {
    expect(fencedLines('````\n## Pages allowed to differ\n```\n**\n```\n````', 'Pages allowed to differ')).toEqual([]);
  });
  it('rejects duplicate or incomplete controls', () => {
    const heading = 'Pages allowed to differ';
    expect(() => fencedLines(block(heading, '**') + block(heading, ''), heading)).toThrow();
    expect(() => fencedLines(`## ${heading}\n\`\`\`\n**`, heading)).toThrow();
    expect(() => fencedLines(`## ${heading}\nAn explanation`, heading)).toThrow();
  });
  it('uses the default capture paths for an absent or empty block', () => {
    expect(capturePaths('')).toEqual(['/', '/councils/burnley/']);
    expect(capturePaths(block('Pages to capture', ''))).toEqual(['/', '/councils/burnley/']);
  });
  it('keeps capture paths on the local preview origin', () => {
    expect(capturePaths(block('Pages to capture', '/\n/councils/burnley/'))).toEqual(['/', '/councils/burnley/']);
    for (const path of ['https://example.com/', '//example.com/', '/\\example.com/', '/ bad']) {
      expect(() => capturePaths(block('Pages to capture', path))).toThrow();
    }
  });
});
