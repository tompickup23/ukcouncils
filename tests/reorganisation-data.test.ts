import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import data from '../data/reorganisation/areas.json';
import register from '../data/reorganisation/sources.json';

const sources = register as Record<string, {publisher: string; file: string; sha256: string; title: string; date: string; url: string; text?: string; pageTexts?: Record<string,string>}>;
const expectedProposals = [4,5,5,2,4,3,4,3,5,0,3,4,3,3,3,5,2,2,2,2,2];
const registry = JSON.parse(readFileSync(resolve('data/registry/councils.json'),'utf8')).councils;
describe('the reviewed reorganisation sources', () => {
  it('pins every cited saved file with its full provenance', () => {
    for (const source of Object.values(sources)) {
      for (const key of ['publisher','title','date','url','file','sha256']) expect(source[key as keyof typeof source]).toBeTruthy();
      expect(createHash('sha256').update(readFileSync(resolve(source.file))).digest('hex')).toBe(source.sha256);
    }
  });
  it('has exactly the reviewed areas, proposal counts and council joins', () => {
    expect(data.areas).toHaveLength(21);
    expect(data.areas.map(a=>a.proposals.length)).toEqual(expectedProposals);
    const councils=data.areas.flatMap(a=>a.councils);
    expect(councils).toHaveLength(205);
    expect(new Set(councils.map(c=>c.gss)).size).toBe(205);
    expect(councils.filter(c=>c.role==='county')).toHaveLength(21);
    expect(councils.filter(c=>c.role!=='county')).toHaveLength(184);
    for (const area of data.areas) {
      const county=area.councils.find(c=>c.role==='county')!;
      for (const council of area.councils) {
        if(council.role!=='county') expect(registry[council.gss]).toBeTruthy();
        if(council.role==='district') expect(registry[council.gss].parentGss).toBe(county.gss);
      }
    }
    expect(Object.fromEntries(['order','minded-to','withdrawn-2026-10','withdrawn-2026-09','undecided'].map(s=>[s,data.areas.filter(a=>a.status===s).length])))
      .toEqual({order:1,'minded-to':5,'withdrawn-2026-10':9,'withdrawn-2026-09':4,undecided:2});
  });
  it('has a named source and location for every imported claim', () => {
    function walk(value: unknown) {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) {value.forEach(walk);return;}
      const object=value as Record<string,unknown>;
      if (typeof object.source==='string') expect(sources[object.source], object.source).toBeTruthy();
      Object.values(object).forEach(walk);
    }
    walk(data);
    for (const area of data.areas) for(const quote of area.quotes) {
      const source=sources[quote.source];
      const page='page' in quote ? source.pageTexts?.[String(quote.page)] : source.text;
      expect(page).toBeTruthy();
      expect(readFileSync(resolve('docs/reorganisation-sources/text',page!),'utf8')).toContain(quote.text);
      expect(quote.text).not.toMatch(/[\u2013\u2014]|£|%|population|saving|cost|funding/i);
    }
  });
  it('keeps Lancashire documents only and representation dates absent', () => {
    const lancashire=data.areas.filter(a=>a.documentsOnly);
    expect(lancashire).toHaveLength(1);
    expect(lancashire[0].councils.filter(c=>c.role!=='county')).toHaveLength(14);
    expect(lancashire[0].proposals).toEqual([]);
    expect(lancashire[0].quotes).toEqual([]);
    expect(lancashire[0].timeline.map(t=>t.date)).toEqual(['2025-02-05','2026-02-05','2026-07-16','2026-10-29']);
    for(const area of data.areas) if(area.window) {
      expect(area.window.opens).toBeNull(); expect(area.window.closes).toBeNull();
    }
  });
});

it('contains no zero width characters in any generated data string', () => {
  function visit(value: unknown): void {
    if (typeof value === 'string') expect(value).not.toMatch(/[\u200b-\u200d\u2060\ufeff]/);
    else if (Array.isArray(value)) value.forEach(visit);
    else if (value && typeof value === 'object') {
      for (const [key, child] of Object.entries(value)) {visit(key); visit(child);}
    }
  }
  visit(data);
  visit(register);
});
