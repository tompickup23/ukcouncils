import { councilPages, councilPath } from "./paths";

export interface CouncilIndexRow {
  name: string;
  officialName: string;
  slug: string;
  region: string;
  type: string;
  url: string;
}

/** The same council set and profile names as the generated profile routes. */
export function councilIndex(): CouncilIndexRow[] {
  return councilPages().map(({ council, tax }) => ({
    name: tax.name,
    officialName: council.officialName,
    slug: council.slug,
    region: council.region,
    type: council.type,
    url: councilPath(council),
  }));
}
