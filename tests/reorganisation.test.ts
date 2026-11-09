import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';
import {reorganisationFor, reorganisationData, reorganisationSources, validateReorganisation} from '../src/lib/reorganisation';
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
