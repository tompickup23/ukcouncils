import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { longDate, type SourceRef } from "./sources";
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
/**
 * The bibliographic record for a scheduled election. The publisher is the body that issued the
 * quoted document: legislation.gov.uk for a statutory instrument, or the council named at the start
 * of the held label for its own page. UK Elections is the register that quoted it, said after the
 * title, never the publisher.
 */
export function electionSource(record: ElectionRecord): SourceRef {
  const line = electionSourceLine(record);
  if (new URL(record.sourceUrl).hostname.endsWith("legislation.gov.uk")) {
    return {publisher: "legislation.gov.uk", title: record.sourceLabel, url: record.sourceUrl, table: line.attribution};
  }
  const cut = record.sourceLabel.indexOf(", ");
  if (cut < 1) throw new Error(`Election source label has no publisher: ${record.sourceLabel}`);
  return {publisher: record.sourceLabel.slice(0, cut), title: record.sourceLabel.slice(cut + 2), url: record.sourceUrl, table: line.attribution};
}
export const electionQuoteIsHeld = (quote: string): boolean => /re-?organi[sz]|unitary|abolish|structural change/i.test(quote);
