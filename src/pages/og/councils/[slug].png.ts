import type { APIRoute } from "astro";
import { buildOg, renderOgCard } from "../../../lib/og";
import {
  CURRENT_YEAR,
  loadYear,
  yearLabel,
  type Authority,
} from "../../../lib/council-tax";
import { councilPages } from "../../../lib/paths";
import { longDate, tableName } from "../../../lib/sources";

export const prerender = true;

/** Generic card for every selected band. URL fragments cannot change OG metadata. */
export function getStaticPaths() {
  if (!buildOg) return [];
  return councilPages().map(({ council, tax }) => ({ params: { slug: council.slug }, props: { gss: council.gss, tax } }));
}

export const GET: APIRoute = async ({ props }) => {
  const { tax } = props as { tax: Authority };
  const data = loadYear(CURRENT_YEAR);
  const png = await renderOgCard({
    eyebrow: `Council tax ${yearLabel(CURRENT_YEAR)}`,
    heading: tax.name,
    caveat: "Council tax bands A to H. Published area charges, sources and comparisons.",
    source: `MHCLG ${tableName(data.source.bandTable)}, ${longDate(data.source.published)}`,
  });
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
