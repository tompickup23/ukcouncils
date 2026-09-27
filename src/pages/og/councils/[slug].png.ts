import type { APIRoute } from "astro";
import { buildOg, renderOgCard } from "../../../lib/og";
import {
  CURRENT_YEAR,
  PREVIOUS_YEAR,
  bandChange,
  changePhrase,
  loadYear,
  pounds,
  yearLabel,
  type Authority,
} from "../../../lib/council-tax";
import { councilPages } from "../../../lib/paths";
import { longDate, tableName } from "../../../lib/sources";

export const prerender = true;

/** One card per council page, carrying its Band D and the change, with the caveat. */
export function getStaticPaths() {
  if (!buildOg) return [];
  return councilPages().map(({ council, tax }) => ({ params: { slug: council.slug }, props: { gss: council.gss, tax } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { gss, tax } = props as { gss: string; tax: Authority };
  const data = loadYear(CURRENT_YEAR);
  const change = bandChange(gss, "D");
  const png = await renderOgCard({
    eyebrow: `Council tax ${yearLabel(CURRENT_YEAR)}`,
    heading: tax.name,
    figure: {
      value: pounds(tax.bands.D),
      label: "Band D a year",
      change: change ? `${changePhrase(change)} on ${yearLabel(PREVIOUS_YEAR)}` : undefined,
    },
    caveat: "Area charge: every body's share, with parish precepts as an average.",
    source: `MHCLG ${tableName(data.source.bandTable)}, ${longDate(data.source.published)}`,
  });
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
