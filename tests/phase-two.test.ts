import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {geoArea} from 'd3-geo';
import {boundaryAreas,boundaryMap,boundarySource} from '../src/lib/boundaries';
import {councilPages} from '../src/lib/paths';
import {taxRows,taxSources} from '../src/lib/tax-view-data';
import {csvCell,taxCsv} from '../src/lib/tax-export';
import {cardPalette} from '../src/styles/palette';

describe('boundary provenance and shape', () => {
  it('matches every current council by exact GSS and omits unknown codes', () => {
    const areas = boundaryAreas();
    expect(areas).toHaveLength(boundarySource.count);
    expect(new Set(areas.map(f=>f.properties.LAD26CD)).size).toBe(areas.length);
    for (const {council} of councilPages()) expect(areas.some(f=>f.properties.LAD26CD === council.gss),council.slug).toBe(true);
    expect(boundaryMap('E00000000')).toBeNull();
  });
  it('retains the source checksum and renders the area rather than its spherical complement', () => {
    expect(createHash('sha256').update(readFileSync('data/geography/lad26-england.geojson')).digest('hex')).toBe(boundarySource.sha256);
    for (const area of boundaryAreas()) {expect(geoArea(area)).toBeGreaterThan(0); expect(geoArea(area)).toBeLessThan(1);}
    const burnley = boundaryMap('E07000117')!;
    expect(burnley.focal.length).toBeGreaterThan(100);
    expect(burnley.focal).not.toContain('NaN');
    expect(burnley.context.length).toBeGreaterThan(100);
  });
});
describe('portable CSV figures', () => {
  it('reconciles an exact selected band and year and carries its provenance', () => {
    const row = taxRows().find(r=>r.slug === 'burnley')!;
    const csv = taxCsv([row], 'A', '2026-27', taxSources()['2026-27']);
    expect(csv).toContain('"1699.61","169.96"');
    expect(csv).toContain('"2026-27","A"');
    expect(csv).toContain('Open Government Licence');
    expect(csv).toContain(taxSources()['2026-27'].files[0].sha256);
    expect(csv).toContain('before discounts');
    expect(csv.split('\r\n')).toHaveLength(3);
  });
  it('omits missing values and never derives absent bands', () => {
    const row = {...taxRows()[0], years: {'2026-27': {D: 0}}};
    expect(taxCsv([row], 'D', '2026-27', taxSources()['2026-27']).split('\r\n')).toHaveLength(2);
  });
  it('quotes commas, quotes, newlines and neutralises spreadsheet formula text', () => {
    expect(csvCell('A,"B"\nC')).toBe('"A,""B""\nC"');
    for (const text of ['=1+1',' +SUM(A1)','@cmd','-formula','\t=cmd']) expect(csvCell(text)).toBe('"\''+text+'"');
  });
});
function luminance(hex: string) {return hex.slice(1).match(/../g)!.map(x=>parseInt(x,16)/255).map(x=>x<=0.04045?x/12.92:((x+0.055)/1.055)**2.4).reduce((v,x,i)=>v+x*[0.2126,0.7152,0.0722][i],0);}
function contrast(a:string,b:string){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);}
it('blue accent clears AA in light and dark themes', () => {
  for (const bg of ['#ffffff','#f5f6f7',cardPalette.accentWash]) expect(contrast(cardPalette.accentDeep,bg)).toBeGreaterThan(4.5);
  for (const bg of [cardPalette.ground,'#122838']) expect(contrast(cardPalette.accentBright,bg)).toBeGreaterThan(4.5);
});
