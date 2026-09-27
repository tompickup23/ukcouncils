import { YEARS, BANDS, loadYear } from './council-tax';
import { councilPages } from './paths';
import { councilTaxSource } from './sources';
import type { TaxRow } from './tax-view';

/** Same GSS only across years. A changed code never inherits an old area's value. */
export function taxRows(): TaxRow[] {
  return councilPages().map(({ council, tax }) => ({
    slug: council.slug, gss: council.gss, name: tax.name, region: tax.region,
    classCode: tax.classCode, classLabel: tax.class, basis: 'area-average',
    years: Object.fromEntries(YEARS.map(year => {
      const row = loadYear(year).authorities[council.gss];
      return [year, Object.fromEntries(BANDS.flatMap(band => {
        const value = row?.classCode === tax.classCode ? row.bands[band] : undefined;
        return typeof value === 'number' && Number.isFinite(value) && value > 0 ? [[band, Math.round(value * 100)]] : [];
      }))];
    })),
  }));
}
export function taxSources() {
  return Object.fromEntries(YEARS.map(year => {
    const {source} = loadYear(year);
    return [year, {
      ...councilTaxSource(year, source.bandTable),
      revised: source.updated,
      licence: source.licence, licenceUrl: source.licenceUrl,
      files: source.files.map(file => ({url: file.url, sha256: file.sha256})),
    }];
  }));
}
