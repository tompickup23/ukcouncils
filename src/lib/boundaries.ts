import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {geoArea, geoBounds, geoMercator, geoPath} from 'd3-geo';
import type {Feature, FeatureCollection, Polygon, MultiPolygon} from 'geojson';
import source from '../../data/geography/source.json';
export const boundarySource = source;
type Area = Feature<Polygon | MultiPolygon, {LAD26CD: string; LAD26NM: string}>;
function rewind(rings: number[][][]): number[][][] {
  return rings.map((ring, index) => {
    const signed = ring.reduce((sum,p,i) => {const q = ring[(i+1)%ring.length]; return sum+p[0]*q[1]-q[0]*p[1];},0);
    return (signed < 0) === (index === 0) ? ring : [...ring].reverse();
  });
}
let areas: Area[] | undefined;
export function boundaryAreas(): Area[] {
  if (areas) return areas;
  const raw = JSON.parse(readFileSync(join(process.cwd(), 'data/geography/lad26-england.geojson'), 'utf8')) as FeatureCollection<Polygon | MultiPolygon, Area['properties']>;
  areas = raw.features.map(f => ({...f, geometry: f.geometry.type === 'Polygon' ? {...f.geometry,coordinates: rewind(f.geometry.coordinates)} : {...f.geometry,coordinates: f.geometry.coordinates.map(rewind)}}));
  for (const area of areas) if (!(geoArea(area) > 0 && geoArea(area) < 1)) throw new Error(`Boundary winding or area invalid: ${area.properties.LAD26CD}`);
  return areas;
}
export function boundaryMap(gss: string) {
  const all = boundaryAreas(); const focal = all.find(area => area.properties.LAD26CD === gss);
  if (!focal) return null;
  const [[x0,y0],[x1,y1]] = geoBounds(focal);
  const dx = (x1-x0)*0.2, dy = (y1-y0)*0.2;
  const neighbours = all.filter(area => {
    if (area === focal) return false;
    const [[a,b],[c,d]] = geoBounds(area);
    return c >= x0-dx && a <= x1+dx && d >= y0-dy && b <= y1+dy;
  });
  const projection = geoMercator().fitExtent([[32,24],[268,156]], focal).clipExtent([[0,0],[300,180]]);
  const path = geoPath(projection).digits(1);
  return {focal: path(focal)!, context: neighbours.map(area => path(area) ?? '').join(' ')};
}
