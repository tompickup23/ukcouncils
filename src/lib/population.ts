import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { SourceRef } from "./sources";

export interface PopulationArea { code: string; name: string; geography: string; allAges: number }
export const population = JSON.parse(readFileSync(resolve(process.cwd(), "data/population/mye25-population.json"), "utf8")) as {
  source: { publisher: string; title: string; url: string; published: string; licence: string };
  areas: Record<string, PopulationArea>;
};
export function populationFor(gss: string): number | null {
  const count = population.areas[gss]?.allAges;
  return typeof count === "number" && count > 0 ? count : null;
}
export function populationSource(): SourceRef {
  return { ...population.source, table: "MYE2 Persons, all ages", date: population.source.published };
}
