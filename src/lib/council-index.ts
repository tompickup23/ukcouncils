import { councilPages, councilPath } from "./paths";

export interface CouncilIndexRow {
  name: string;
  officialName: string;
  slug: string;
  /** The class label profiles and CouncilFinder print, e.g. "Shire district". */
  classLabel: string;
  /** The region as CouncilFinder prints it. */
  region: string;
  url: string;
}

/**
 * The same council set and profile names as the generated profile routes. The
 * class and region are the printed labels from the council tax rows, not the
 * registry wording ("Non-metropolitan district" there is "Shire district" on
 * the page).
 */
export function councilIndex(): CouncilIndexRow[] {
  return councilPages().map(({ council, tax }) => ({
    name: tax.name,
    officialName: council.officialName,
    slug: council.slug,
    classLabel: tax.class,
    region: tax.region,
    url: councilPath(council),
  }));
}
