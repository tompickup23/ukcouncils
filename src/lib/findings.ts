import { CURRENT_YEAR, PREVIOUS_YEAR, loadYear, yearLabel, type Authority, type Year } from "./council-tax";
import { longDate, tableName, type SourceRef } from "./sources";
import { dataUpdates, type DataUpdate } from "./dataset-dates";

/**
 * The data notes on /findings/. Each is a count or a distribution read from
 * the council tax files, grouped within MHCLG's class of authority, never
 * ranked and never compared across classes. tests/findings.test.ts recomputes
 * every count from the JSON.
 */

/** The date each note was written. The counts come from the data, never from here. */
export const FINDINGS_DATE = "2026-11-04";

/** MHCLG's classes, in the order its tables list them. */
export const CLASS_ORDER: Authority["classCode"][] = ["ILB", "OLB", "MD", "UA", "SD"];

export interface ClassGroup<T> {
  classCode: Authority["classCode"];
  label: string;
  councils: number;
  rows: T;
}

export interface Bin {
  /** The whole point at or above which every change in the bin sits. */
  floor: number;
  label: string;
  count: number;
}

/**
 * The label of a whole point bin: a change at least `floor` and below
 * `floor + 1` per cent. A negative bin is a fall, stated as such.
 */
export function binLabel(floor: number): string {
  if (floor >= 0) return `${floor}% to under ${floor + 1}%`;
  return `a fall of more than ${-(floor + 1)}% and up to ${-floor}%`;
}

function byClass(year: Year = CURRENT_YEAR) {
  const data = loadYear(year);
  const groups = new Map<Authority["classCode"], { label: string; authorities: Authority[] }>();
  for (const authority of Object.values(data.authorities)) {
    const group = groups.get(authority.classCode) ?? { label: authority.class, authorities: [] };
    group.authorities.push(authority);
    groups.set(authority.classCode, group);
  }
  return CLASS_ORDER.filter((code) => groups.has(code)).map((code) => ({ code, ...groups.get(code)! }));
}

function ownTables(year: Year = CURRENT_YEAR): string {
  const tables = [...new Set(Object.values(loadYear(year).authorities).flatMap((a) => (a.own ? [a.own.table] : [])))].sort();
  return tables.map(tableName).join(" and ");
}

function ownSource(): SourceRef {
  const { source } = loadYear(CURRENT_YEAR);
  return {
    publisher: "MHCLG",
    title: source.title,
    url: source.url,
    table: ownTables(),
    date: source.published,
  };
}

export interface ChangeNote {
  classes: ClassGroup<Bin[]>[];
  /** Councils whose row holds no published change. Absent from every bin. */
  notPublished: number;
  total: number;
  source: SourceRef;
  accessed: string;
}

/**
 * How many councils in each class changed their own Band D by each whole
 * percentage point in the current year against the previous one, using the
 * percentage MHCLG publishes in Tables 8a and 8c (excluding parish precepts).
 */
export function changeDistribution(): ChangeNote {
  let notPublished = 0;
  let total = 0;
  const classes = byClass().map(({ code, label, authorities }) => {
    const counts = new Map<number, number>();
    for (const authority of authorities) {
      const pct = authority.own?.changePct;
      if (typeof pct !== "number") {
        notPublished += 1;
        continue;
      }
      total += 1;
      const floor = Math.floor(pct);
      counts.set(floor, (counts.get(floor) ?? 0) + 1);
    }
    const rows = [...counts.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([floor, count]) => ({ floor, label: binLabel(floor), count }));
    return { classCode: code, label, councils: authorities.length, rows };
  });
  return { classes, notPublished, total, source: ownSource(), accessed: loadYear(CURRENT_YEAR).generated };
}

export interface ParishCounts {
  /** Average Band D including parish precepts above the figure excluding them. */
  withParish: number;
  /** The two published averages equal. */
  without: number;
  /** Including below excluding, which MHCLG's tables should not hold. */
  lower: number;
  /** Either average absent from the row. */
  notPublished: number;
}

export interface ParishNote {
  classes: ClassGroup<ParishCounts>[];
  totals: ParishCounts;
  source: SourceRef;
  accessed: string;
}

/**
 * How many councils' current year average Band D includes a parish precept
 * component: MHCLG publishes each council's average Band D excluding and
 * including parish precepts in Tables 8a and 8c, and where the second is
 * higher, parish precepts are part of it.
 */
export function parishComponent(): ParishNote {
  const totals: ParishCounts = { withParish: 0, without: 0, lower: 0, notPublished: 0 };
  const classes = byClass().map(({ code, label, authorities }) => {
    const rows: ParishCounts = { withParish: 0, without: 0, lower: 0, notPublished: 0 };
    for (const authority of authorities) {
      const excl = authority.own?.bandD;
      const incl = authority.own?.bandDWithParish;
      const key: keyof ParishCounts =
        typeof excl !== "number" || typeof incl !== "number"
          ? "notPublished"
          : incl > excl
            ? "withParish"
            : incl === excl
              ? "without"
              : "lower";
      rows[key] += 1;
      totals[key] += 1;
    }
    return { classCode: code, label, councils: authorities.length, rows };
  });
  return { classes, totals, source: ownSource(), accessed: loadYear(CURRENT_YEAR).generated };
}

export const CHANGE_NOTE_ID = "band-d-change-by-point";
export const PARISH_NOTE_ID = "parish-precept-component";

/** The two notes as feed items, dated the day they were written. */
export function findingUpdates(): DataUpdate[] {
  const year = yearLabel(CURRENT_YEAR);
  const previous = yearLabel(PREVIOUS_YEAR);
  const change = changeDistribution();
  const parish = parishComponent();
  const cite = (s: SourceRef) => `Source: ${s.publisher}, ${s.title}, ${s.table}, published ${longDate(s.date)}`;
  return [
    {
      id: `finding-${CHANGE_NOTE_ID}-${CURRENT_YEAR}`,
      dataset: "council-tax",
      title: `Finding: own Band D change by whole percentage point, ${year} on ${previous}, by class`,
      date: FINDINGS_DATE,
      description: `How many of ${change.total} councils in each class changed their own Band D by each whole percentage point. ${cite(change.source)}.`,
      path: `/findings/#${CHANGE_NOTE_ID}`,
    },
    {
      id: `finding-${PARISH_NOTE_ID}-${CURRENT_YEAR}`,
      dataset: "council-tax",
      title: `Finding: councils whose ${year} average Band D includes parish precepts`,
      date: FINDINGS_DATE,
      description: `${parish.totals.withParish} councils, counted within each class. ${cite(parish.source)}.`,
      path: `/findings/#${PARISH_NOTE_ID}`,
    },
  ];
}

/** Every item the feed and the changes list carry: the notes and every data update, newest first. */
export function allUpdates(): DataUpdate[] {
  return [...findingUpdates(), ...dataUpdates()].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
