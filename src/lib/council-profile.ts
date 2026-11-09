import { CLASS_PLURAL, type StripPoint } from "./position-strip";
import { boundaryAreas, boundarySource } from "./boundaries";
import {
  CURRENT_YEAR,
  PREVIOUS_YEAR,
  YEARS,
  bandChange,
  loadYear,
  type Authority,
} from "./council-tax";
import { loadRegistry, type Council } from "./registry";
import { calendarFor } from "./school-holidays";
import { changeSource, councilTaxSource, type SourceRef } from "./sources";
import { spendingFor, spendingRecord, type SpendingRecord } from "./spending";

/**
 * The profile of one council: what it is, what it publishes about its
 * spending, Band D at a glance, the next school break and one list of every
 * table and file the page drew on. Built from committed data only, so every
 * council gets the same sections wherever its data exists, and a section with
 * no data is null: the page leaves it out, with no placeholder.
 *
 * Two sections the plan names are not built, because no committed file holds
 * their data: who runs the council (seats by party and control) and its
 * elections (the last and the next scheduled date). They join when a sourced
 * file does; nothing here infers them from a sister site link.
 *
 * No statutory basis for the services a type of council provides is named on
 * the methodology or sources pages, so the first section states the type as
 * the register records it and lists no services.
 */

/** The section ids, in the order a council page prints them. */
export const PROFILE_SECTIONS = ["about", "spending", "tax-summary", "school-holidays", "sources"] as const;
export type ProfileSection = (typeof PROFILE_SECTIONS)[number];

export interface ProfileAbout {
  officialName: string;
  /** The type field of the register, as recorded. */
  type: string;
  /** The county whose council also serves a district, where the register names one. */
  county: string | null;
  source: SourceRef;
}

export interface ProfileTax {
  currentGss: string;
  points: StripPoint[];
  classLabel: string;
  bandD: number;
  source: SourceRef;
  change: { from: number; to: number; pounds: number; pct: number } | null;
  changeSource: SourceRef;
}

export interface ProfileBreak {
  label: string;
  start: string;
  end: string;
}

export interface ProfileTermDates {
  authorityName: string;
  authorityUrl: string;
  academicYear: string;
  /** The first break that has not ended by the selection date, or null. */
  next: ProfileBreak | null;
  /** The date the selection was made, ISO, Europe/London. */
  selectedOn: string;
  sourceUrl: string;
  retrievedAt: string | null;
  snapshotDate: string | null;
}

export interface CouncilProfile {
  about: ProfileAbout;
  spending: SpendingRecord | null;
  tax: ProfileTax | null;
  termDates: ProfileTermDates | null;
  sources: SourceRef[];
  sections: ProfileSection[];
}

/** Today in Europe/London as YYYY-MM-DD, the date a build selects the next break on. */
export function londonToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function registrySource(): SourceRef {
  const registry = loadRegistry();
  return {
    publisher: "UK Places",
    title: "register of local authorities",
    url: registry.source.spine,
    table: "type and county fields",
    date: registry.generated,
  };
}

export function profileAbout(council: Council): ProfileAbout {
  return {
    officialName: council.officialName,
    type: council.type,
    county: council.county,
    source: registrySource(),
  };
}

/** Band D this year and its change on last year, both as published. Null without a Band D. */
export function profileTax(council: Council, tax: Authority): ProfileTax | null {
  const bandD = tax.bands.D;
  if (typeof bandD !== "number" || bandD <= 0) return null;
  return {
    bandD,
    currentGss: council.gss,
    points: Object.entries(loadYear(CURRENT_YEAR).authorities)
      .filter(([, row]) => row.classCode === tax.classCode && typeof row.bands.D === "number" && row.bands.D > 0)
      .map(([gss, row]) => ({gss, name: row.name, value: row.bands.D!})),
    classLabel: CLASS_PLURAL[tax.classCode],
    source: councilTaxSource(CURRENT_YEAR, loadYear(CURRENT_YEAR).source.bandTable),
    change: bandChange(council.gss, "D"),
    changeSource: changeSource(PREVIOUS_YEAR, CURRENT_YEAR),
  };
}

/**
 * The next break from the UK School Holiday Dates snapshot, for the education
 * authority the snapshot joins the council to by GSS code. Null where the
 * snapshot holds no calendar for it.
 */
export function profileTermDates(
  council: Pick<Council, "gss" | "parentGss">,
  today = londonToday(),
): ProfileTermDates | null {
  const calendar = calendarFor(council);
  if (!calendar) return null;
  const breaks = calendar.year.breaks as { label: string; start: string; end: string }[];
  const next = breaks.find((event) => event.end >= today) ?? null;
  return {
    authorityName: calendar.authority.name,
    authorityUrl: calendar.authority.url,
    academicYear: calendar.year.academicYear,
    next: next ? { label: next.label, start: next.start, end: next.end } : null,
    selectedOn: today,
    sourceUrl: calendar.year.sourceUrl,
    retrievedAt: calendar.year.retrievedAt ? String(calendar.year.retrievedAt).slice(0, 10) : null,
    snapshotDate: calendar.snapshotDate ?? null,
  };
}

/**
 * Every table and file a council page draws on, once each, in page order. It
 * mirrors what the page prints: the band table for each year in the history,
 * the England area table, the own share tables, the register, the spending
 * summary, the school calendar and the boundary file.
 */
export function profileSources(council: Council, tax: Authority, today = londonToday()): SourceRef[] {
  const out: SourceRef[] = [];
  const seen = new Set<string>();
  const add = (ref: SourceRef | null) => {
    if (!ref) return;
    const key = `${ref.url}|${ref.table ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(ref);
  };

  const current = loadYear(CURRENT_YEAR);
  // Band D for every year held, newest first; the band selector and the
  // history read these.
  for (const year of [...YEARS].reverse()) {
    const data = loadYear(year);
    if (data.authorities[council.gss]) add(councilTaxSource(year, data.source.bandTable));
  }
  const area = current.england.areaBandD;
  if (area) add(councilTaxSource(CURRENT_YEAR, area.table));
  if (tax.own) add(councilTaxSource(CURRENT_YEAR, tax.own.table));
  const county = tax.classCode === "SD" && council.parentGss ? current.counties[council.parentGss] ?? null : null;
  if (county) add(councilTaxSource(CURRENT_YEAR, county.table));

  add(registrySource());

  const spending = spendingRecord(tax.name, spendingFor(council.gss));
  if (spending) add(spending.source);

  const term = profileTermDates(council, today);
  if (term) {
    add({
      publisher: term.authorityName,
      title: "official school term dates",
      url: term.sourceUrl,
      table: `${term.academicYear} calendar, captured by UK School Holiday Dates`,
      date: term.retrievedAt,
    });
  }

  // Whether the committed boundary file holds this council, by its GSS code
  // alone: drawing the map only to learn that would project every area.
  if (hasBoundary(council.gss)) {
    add({
      publisher: boundarySource.publisher,
      title: boundarySource.title,
      url: boundarySource.url,
      // The file records its edition, not a publication date.
      table: `${boundarySource.date} edition, publication date not recorded`,
      date: null,
    });
  }

  return out;
}

let boundaryIds: Set<string> | undefined;
function hasBoundary(gss: string): boolean {
  boundaryIds ??= new Set(boundaryAreas().map((area) => area.properties.LAD26CD));
  return boundaryIds.has(gss);
}

export function councilProfile(council: Council, tax: Authority, today = londonToday()): CouncilProfile {
  const about = profileAbout(council);
  const spending = spendingRecord(tax.name, spendingFor(council.gss));
  const taxAtAGlance = profileTax(council, tax);
  const termDates = profileTermDates(council, today);
  const sources = profileSources(council, tax, today);
  const present: Record<ProfileSection, boolean> = {
    about: true,
    spending: spending !== null,
    "tax-summary": taxAtAGlance !== null,
    "school-holidays": termDates !== null,
    sources: sources.length > 0,
  };
  return {
    about,
    spending,
    tax: taxAtAGlance,
    termDates,
    sources,
    sections: PROFILE_SECTIONS.filter((id) => present[id]),
  };
}
