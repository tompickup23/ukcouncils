import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {panelView, templates, reorganisationFor, reorganisationData, reorganisationSources, validateReorganisation} from '../src/lib/reorganisation';
describe('the sourced panel loader', () => {
  it('joins 184 pages and omits counties and councils outside the programme', () => {
    const councils = reorganisationData.areas.flatMap(a => a.councils);
    expect(councils.filter(c => reorganisationFor(c.gss))).toHaveLength(184);
    expect(councils.filter(c => c.role === 'county').every(c => reorganisationFor(c.gss) === null)).toBe(true);
    expect(reorganisationFor('E08000025')).toBeNull();
  });
  it('rejects unsupported sources and figures at load', () => {
    for (const value of [{source:'missing'}, {quote:'659000'}, {label:'Transition funding'}, {quote:'a\u2014b'}]) {
      expect(() => validateReorganisation(value,reorganisationSources)).toThrow();
    }
  });
  it('pins the four L1 feeds', () => {
    expect(reorganisationSources.L1.files).toHaveLength(4);
    expect(new Set(reorganisationSources.L1.files!.map(f => f.sha256)).size).toBe(4);
    for(const file of reorganisationSources.L1.files!) expect(createHash('sha256').update(readFileSync(file.file)).digest('hex')).toBe(file.sha256);
  });
});

it('gives every minded to order quotation the permitted subject', () => {
  for (const area of reorganisationData.areas.filter(a => a.mindedTo)) {
    const view = panelView(area.councils.find(c => c.role !== 'county')!.gss)!;
    expect(view.orderRequirement).toMatchObject({
      text: templates.neededOrderLead, quote: templates.neededOrder,
      source: area.mindedTo!.source, page: area.mindedTo!.statutoryPage,
    });
    expect(`${view.orderRequirement!.text} ${view.orderRequirement!.quote}.`)
      .toBe('Any change would need to be provided for in a structural changes order.');
  }
});

it('omits the rail for every documents only council and keeps the other rails', () => {
  for (const area of reorganisationData.areas) {
    for (const council of area.councils.filter(c => c.role !== 'county')) {
      expect(panelView(council.gss)!.rail).toHaveLength(area.documentsOnly ? 0 : 5);
    }
  }
});
