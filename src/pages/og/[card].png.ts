import type { APIRoute } from "astro";
import { HUB_CARDS, buildOg, renderOgCard, type HubCard, type OgCard } from "../../lib/og";
import { CURRENT_YEAR, loadYear, percent, wholePounds, yearLabel } from "../../lib/council-tax";
import { longDate, tableName } from "../../lib/sources";

export const prerender = true;

/**
 * The hub cards. Parameterised only so that getStaticPaths can gate them on
 * BUILD_OG=1: Astro ignores getStaticPaths on a route without a parameter.
 */
function cards(): Record<HubCard, OgCard> {
  const data = loadYear(CURRENT_YEAR);
  const year = yearLabel(CURRENT_YEAR);
  const area = data.england.areaBandD;
  const source = `MHCLG ${area ? tableName(area.table) : "council tax tables"}, ${longDate(data.source.published)}`;
  const englandFigure = area
    ? {
        figure: { value: wholePounds(area.england.pounds), label: `average Band D in England, ${year}`, change: `up ${percent(area.england.changePct)}` },
        caveat: "Includes the adult social care and average parish precepts.",
      }
    : {};
  return {
    home: { eyebrow: "Council tax, term dates, elections", heading: "Your council, from the official record", source: "Every figure from an official table, with its date" },
    councils: { eyebrow: "Councils", heading: "Every council in England", source: `MHCLG council tax tables, ${longDate(data.source.published)}` },
    "council-tax": { eyebrow: `Council tax ${year}`, heading: "Council tax in England", ...englandFigure, source },
    rises: { eyebrow: `Council tax ${year}`, heading: "How much has council tax gone up?", ...englandFigure, source },
  };
}

export function getStaticPaths() {
  if (!buildOg) return [];
  return HUB_CARDS.map((card) => ({ params: { card } }));
}

export const GET: APIRoute = async ({ params }) => {
  const png = await renderOgCard(cards()[params.card as HubCard]);
  return new Response(png, { headers: { "Content-Type": "image/png" } });
};
