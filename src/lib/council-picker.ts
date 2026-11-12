import { councilPages, councilPath, slugify } from "./paths";

export interface PickerRow {
  gss: string; name: string; href: string; region: string; type: string;
  tier: string; county: string | null; search: string; noReturn: boolean;
}

/** One row per local profile. County and tier come from the held registry. */
export function englishRows(): PickerRow[] {
  return councilPages().map(({council, tax}) => {
    const county = council.type === 'Non-metropolitan district' ? council.county : null;
    if (!council.region || (council.type === 'Non-metropolitan district' && !county)) throw new Error(`Incomplete picker geography: ${council.gss}`);
    return {
      gss: council.gss, name: tax.name, href: councilPath(council), region: council.region,
      type: council.type === 'Non-metropolitan district' ? 'Shire district' : council.type,
      tier: council.parentGss ? 'Lower tier' : 'Single tier', county,
      search: [tax.name, council.officialName, county, council.region].filter(Boolean).join(' '),
      noReturn: false,
    };
  }).sort((a,b) => a.name.localeCompare(b.name, 'en-GB'));
}

export function pickerTypes(rows: PickerRow[]) {
  const order = ['Unitary authority', 'Shire district', 'Metropolitan district', 'London borough'];
  const present = new Set(rows.map(row => row.type));
  return order.filter(type => present.has(type)).map(type => ({label: type, value: slugify(type)}));
}
