import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { longDate } from "./sources";
export interface ElectionRecord {
  nextYear: number;
  dateLabel: string | null;
  pattern: "whole" | "thirds" | "halves";
  sourceLabel: string;
  sourceUrl: string;
  quote: string;
  joinedVia: string | null;
}
export const elections = JSON.parse(readFileSync(resolve(process.cwd(), "data/elections/next-elections.json"), "utf8")) as {
  source: {publisher: string; title: string; checked: string; method: string; rule: string; commit: string; file: string};
  councils: Record<string, ElectionRecord>;
};
export const electionFor = (gss: string): ElectionRecord | null => elections.councils[gss] ?? null;
export function electionSourceLine(record: ElectionRecord) {
  return {label: record.sourceLabel, url: record.sourceUrl, attribution: `quoted in the ${elections.source.publisher} ${elections.source.title}, checked ${longDate(elections.source.checked)}`};
}
export const electionQuoteIsHeld = (quote: string): boolean => /re-?organi[sz]|unitary|abolish|structural change/i.test(quote);
