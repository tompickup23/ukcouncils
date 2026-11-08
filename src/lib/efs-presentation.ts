import { efs, pages, type EfsRole, type EfsTable } from "./efs";
import { longDate, type SourceRef } from "./sources";

export const efsYear = (text: string) => text.replace(/\b(\d{4})-(\d{2})\b/g, "$1/$2");
export const efsRoles: Record<EfsRole, string> = {
  stated: "figure for the page's year",
  prior_year: "for an earlier year",
  later_year: "for a later year",
  revision_note: "revised figure",
  superseded: "later revised on this page",
  covering_total: "total covering the years listed",
  withdrawn: "in-principle support given; request withdrawn",
};
export function efsTableHeading(table: EfsTable, year: string): string {
  const headings: Record<EfsTable, string> = {
    main: `Exceptional Financial Support requests from local authorities: ${efsYear(year)}`,
    hra: "Housing Revenue Account",
    police: "Police Force",
    later: `Capitalisation support for ${efsYear(year)}`,
    birmingham_revised: "Birmingham: revised Exceptional Financial Support profile",
  };
  return headings[table];
}
export function efsSource(year: string, table?: EfsTable): SourceRef {
  const page = pages[year];
  return {
    publisher: efs.publisher,
    title: page.title,
    url: page.url,
    table: `${table ? `${efsTableHeading(table, year)}, ` : ""}last updated ${longDate(page.updated)}`,
  };
}
