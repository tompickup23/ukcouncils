import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { longDate, type SourceRef } from "./sources";

/**
 * What AI DOGE holds of a council's published spending, read from the JSON
 * scripts/fetch-spending-summaries.mjs writes, and the sentences a council
 * page prints from it. Every read resolves from process.cwd().
 *
 * The AI DOGE rules travel with this data. A body with no headline shows no
 * total, and nothing here computes one. No figure is ranked or compared across
 * councils. Supplier names are never stored, so none can be printed.
 */

export interface SpendingYear {
  monthsHeld: number;
  records: number;
}

export interface SpendingHeadline {
  year: string;
  records: number;
  totalNet: number;
}

export interface SpendingBody {
  id: string;
  url: string;
  generated: string;
  thresholdGbp: number | null;
  bank: boolean;
  years: Record<string, SpendingYear>;
  headline: SpendingHeadline | null;
}

export interface SpendingFile {
  generated: string;
  source: {
    publisher: string;
    summaries: { url: string; generated: string | null };
    banks: { url: string; generated: string | null };
  };
  bodies: Record<string, SpendingBody>;
}

let cached: SpendingFile | null = null;

export function spendingPath(root = process.cwd()): string {
  return join(root, "data", "spending", "aidoge-summaries.json");
}

export function loadSpending(root = process.cwd()): SpendingFile {
  if (cached && root === process.cwd()) return cached;
  const path = spendingPath(root);
  if (!existsSync(path)) throw new Error(`${path} is missing. Run npm run data:spending.`);
  const data = JSON.parse(readFileSync(path, "utf-8")) as SpendingFile;
  if (root === process.cwd()) cached = data;
  return data;
}

/** The AI DOGE body for a council, by GSS code, or null where there is none. */
export function spendingFor(gss: string, root = process.cwd()): SpendingBody | null {
  return loadSpending(root).bodies[gss] ?? null;
}

// Money and counts as AI DOGE prints them (aidoge-site src/lib/labels.ts,
// copied, not imported): whole pounds, rounded, and grouped counts.
const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("en-GB");

export function gbp(value: number): string {
  return GBP.format(Math.round(value));
}

export function num(value: number): string {
  return NUM.format(value);
}

/** The financial years held, oldest first. */
function yearsHeld(body: SpendingBody): string[] {
  return Object.keys(body.years).sort();
}

const startOf = (fy: string) => Number(fy.slice(0, 4));

/**
 * "2023/24 to 2025/26" where the years run without a gap, as AI DOGE words its
 * coverage note, and each year listed where one is missing, so a range never
 * claims a year that is not held.
 */
export function yearsPhrase(years: string[]): string {
  if (years.length === 1) return years[0];
  const last = years.at(-1)!;
  const contiguous = years.slice(1).every((fy, i) => startOf(fy) === startOf(years[i]) + 1);
  if (contiguous) return `${years[0]} to ${last}`;
  return `${years.slice(0, -1).join(", ")} and ${last}`;
}

export interface SpendingRecord {
  heading: string;
  /** The sentences before the link, in order. */
  sentences: string[];
  /** The caveat under the figures, where there are figures. */
  caveat: string | null;
  link: { text: string; href: string };
  source: SourceRef;
}

export const SPENDING_HEADING = "What the council publishes about its spending";

/**
 * The spending section for one council, or null where AI DOGE has no page for
 * it: no empty section and no placeholder.
 *
 * With a headline: the payments and total for the latest year AI DOGE holds in
 * full. Without one: the years held, in the wording the AI DOGE page uses, and
 * no total. The month the latest file covers is not stated: no published field
 * names it, and it is not derived from a count of months.
 */
export function spendingRecord(name: string, body: SpendingBody | null): SpendingRecord | null {
  if (!body) return null;
  const asAt = longDate(body.generated);
  if (!asAt) return null;
  const sentences: string[] = [];
  let caveat: string | null = null;
  const headline = body.headline;
  if (headline) {
    const threshold = body.thresholdGbp ? ` of ${gbp(body.thresholdGbp)} and over` : "";
    sentences.push(
      `${name} published ${num(headline.records)} payments${threshold} in ${headline.year}, `
      + `totalling ${gbp(headline.totalNet)}, as at ${asAt}.`,
    );
    caveat = "Counted from the council's own spending files as AI DOGE holds them, after refunds. "
      + "What a council publishes above its threshold is a part of what it spends, not all of it: "
      + "wages and payments below the threshold are not in it.";
  } else {
    const years = yearsHeld(body);
    if (years.length === 0) {
      sentences.push(`No spending records are held for ${name} yet, as at ${asAt}.`);
    } else {
      sentences.push(`Records held on AI DOGE for ${yearsPhrase(years)}, as at ${asAt}.`);
      sentences.push(
        "Spending records are held for this council, but they do not yet meet AI DOGE's test for publishing a total, "
        + "so none is shown.",
      );
    }
  }
  const link = { text: "How the payments summary is compiled", href: "/methodology/#payments" };
  return {
    heading: SPENDING_HEADING,
    sentences,
    caveat,
    link,
    source: {
      publisher: "AI DOGE",
      title: `spending summary for ${name}`,
      url: "/methodology/#payments",
      table: "from the council's own published spending files",
      date: body.generated,
    },
  };
}
