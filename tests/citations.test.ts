import { describe, expect, it } from 'vitest';
import { shortenCitations, citationErrors } from '../scripts/lib/citations.mjs';
import { citationKey } from '../src/lib/citation-key';
import type { SourceRef } from '../src/lib/sources';
const source = {publisher: 'Fixture publisher', title: 'Fixture document', table: 'Table 1', date: '2026-01-01', url: 'https://example.org/source'};
const id = citationKey(source);
const line = (s: SourceRef = source) => `<p class="source-line" data-citation-key="${citationKey(s)}" data-citation-record='${JSON.stringify(s)}'>Source: Fixture publisher, Fixture document, Table 1, published 1 January 2026.</p>`;
const page = (content: string) => `<html><body><main>${content}<section id="sources"><p>Sources</p><details data-sources-drawer><summary>Sources</summary><ul data-profile-sources></ul></details></section></main></body></html>`;
describe('short citations in final reading order', () => {
  it('retains the first full citation, links later uses to a complete source entry and preserves the calculation method', () => {
    const html = shortenCitations(page(line() + line({...source, method: 'Calculated from published values'})));
    expect(citationErrors(html)).toEqual([]);
    expect(html.match(/data-citation-format="full"/g)).toHaveLength(1);
    expect(html.match(/data-citation-format="short"/g)).toHaveLength(1);
    expect(html).toContain(`href="#${id}"`);
    expect(html).toContain('Calculated from published values. Source:');
    expect(html).toContain('Fixture publisher, Table 1, 2026');
  });
  it('fails a broken link, a short first use and a missing full entry', () => {
    const html = shortenCitations(page(line() + line()));
    expect(citationErrors(html.replace(`href="#${id}"`, 'href="#absent"'))).toContain(`${id}: broken short link`);
    expect(citationErrors(html.replace('data-citation-format="full"', 'data-citation-format="short"'))).toContain(`${id}: first use is short`);
    expect(citationErrors(html.replace(`id="${id}"`, 'id="absent"'))).toContain(`${id}: missing or duplicate full entry`);
  });
  it('keeps incomplete source metadata in full', () => {
    const undated = {...source, date: ''};
    const html = shortenCitations(page(line(undated) + line(undated)));
    expect(html).not.toContain('data-citation-format="short"');
  });
  it('keeps a full first use in each alternative band panel and is idempotent', () => {
    const html = shortenCitations(page(`<div data-band-panel="A">${line()}</div><div data-band-panel="D">${line()}</div>${line()}`));
    expect(html.match(/data-citation-format="full"/g)).toHaveLength(2);
    expect(html.match(/data-citation-format="short"/g)).toHaveLength(1);
    expect(shortenCitations(html)).toBe(html);
    expect(citationErrors(html)).toEqual([]);
  });
});
