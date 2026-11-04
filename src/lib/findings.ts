import { CURRENT_YEAR, PREVIOUS_YEAR, loadYear, yearLabel, type Authority, type Note, type Year } from "./council-tax";
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
  /**
   * The bin's key. Zero or above: every published change in the bin is at
   * least `floor` and under `floor + 1` per cent. Below zero: every fall in the
   * bin is at least `-(floor + 1)` and under `-floor` per cent.
   */
  floor: number;
  label: string;
  count: number;
  /**
   * Present on a row that counts councils whose published change MHCLG notes
   * as rounded, with the actual change below the referendum threshold. Those
   * councils sit in this row, never in a whole point bin.
   */
  note?: Note;
  /** The published, rounded change those councils carry. */
  published?: number;
}

/**
 * The bin key of a published change: the whole point of a rise, or of the
 * size of a fall, so a fall of exactly 1% sits with falls of 1% to under 2%.
 */
export function binFloor(pct: number): number {
  return pct >= 0 ? Math.floor(pct) : -(Math.floor(-pct) + 1);
}

/** The label of a whole point bin. A negative bin is a fall, stated as such. */
export function binLabel(floor: number): string {
  if (floor >= 0) return `${floor}% to under ${floor + 1}%`;
  if (floor === -1) return "a fall of under 1%";
  return `a fall of ${-(floor + 1)}% to under ${-floor}%`;
}

/**
 * MHCLG notes on an own row saying the published change shows as a rounded
 * figure and the actual change is below the referendum threshold (notes s and
 * w in 2026 to 2027). Matched on MHCLG's own wording, never on a council name.
 */
const ROUNDING_NOTE = /due to rounding/i;

export function roundingNote(authority: Authority): Note | null {
  return authority.own?.notes.find((n) => ROUNDING_NOTE.test(n.text)) ?? null;
}

/** The label of a rounding note row: the published figure and the note. */
export function roundedLabel(published: number, note: Note): string {
  return `published as ${published.toFixed(2)}%, below the threshold per MHCLG note ${note.id}`;
}

/**
 * MHCLG notes on an own row saying the average Band D including parish
 * precepts is pending approval (note x in 2026 to 2027). Matched on MHCLG's
 * own wording.
 */
const PENDING_PARISH_NOTE = /including local precepts.*pending approval/i;

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
  /** Every MHCLG rounding note a row carries, once each, printed under the table. */
  roundingNotes: Note[];
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
  const notes = new Map<string, Note>();
  const classes = byClass().map(({ code, label, authorities }) => {
    const counts = new Map<number, number>();
    const rounded = new Map<string, Bin>();
    for (const authority of authorities) {
      const pct = authority.own?.changePct;
      if (typeof pct !== "number") {
        notPublished += 1;
        continue;
      }
      total += 1;
      const note = roundingNote(authority);
      if (note) {
        notes.set(note.id, note);
        const key = `${note.id}|${pct}`;
        const row = rounded.get(key) ?? { floor: binFloor(pct), label: roundedLabel(pct, note), count: 0, note, published: pct };
        row.count += 1;
        rounded.set(key, row);
        continue;
      }
      const floor = binFloor(pct);
      counts.set(floor, (counts.get(floor) ?? 0) + 1);
    }
    // A rounding row sits just above the bin its published figure would fall
    // in, since MHCLG says the actual change is below that figure.
    const sortKey = (b: Bin) => (b.note ? b.floor - 0.5 : b.floor);
    const rows: Bin[] = [
      ...[...counts.entries()].map(([floor, count]) => ({ floor, label: binLabel(floor), count })),
      ...rounded.values(),
    ].sort((a, b) => sortKey(a) - sortKey(b) || a.label.localeCompare(b.label));
    return { classCode: code, label, councils: authorities.length, rows };
  });
  const roundingNotes = [...notes.values()].sort((a, b) => a.id.length - b.id.length || a.id.localeCompare(b.id));
  return { classes, roundingNotes, notPublished, total, source: ownSource(), accessed: loadYear(CURRENT_YEAR).generated };
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
  /** MHCLG notes that an average including parish precepts is pending approval, printed under the parish note. */
  pendingNotes: Note[];
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
  const pending = new Map<string, Note>();
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
      for (const note of authority.own?.notes ?? []) if (PENDING_PARISH_NOTE.test(note.text)) pending.set(note.id, note);
    }
    return { classCode: code, label, councils: authorities.length, rows };
  });
  const pendingNotes = [...pending.values()].sort((a, b) => a.id.length - b.id.length || a.id.localeCompare(b.id));
  return { classes, totals, pendingNotes, source: ownSource(), accessed: loadYear(CURRENT_YEAR).generated };
}

export const CHANGE_NOTE_ID = "band-d-change-by-point";
export const PARISH_NOTE_ID = "parish-precept-component";

/** The two notes as feed items, dated the day they were written. */
export function findingUpdates(): DataUpdate[] {
  const year = yearLabel(CURRENT_YEAR);
  const previous = yearLabel(PREVIOUS_YEAR);
  const change = changeDistribution();
  const parish = parishComponent();
  const cite = (s: SourceRef, accessed: string) =>
    `Source: ${s.publisher}, ${s.title}, ${s.table}, published ${longDate(s.date)}, accessed ${longDate(accessed)}`;
  return [
    {
      id: `finding-${CHANGE_NOTE_ID}-${CURRENT_YEAR}`,
      dataset: "council-tax",
      title: `Finding: own Band D change by whole percentage point, ${year} on ${previous}, by class`,
      date: FINDINGS_DATE,
      description: `How many of ${change.total} councils in each class changed their own Band D by each whole percentage point. ${cite(change.source, change.accessed)}.`,
      path: `/findings/#${CHANGE_NOTE_ID}`,
    },
    {
      id: `finding-${PARISH_NOTE_ID}-${CURRENT_YEAR}`,
      dataset: "council-tax",
      title: `Finding: councils whose ${year} average Band D includes parish precepts`,
      date: FINDINGS_DATE,
      description: `${parish.totals.withParish} councils, counted within each class. ${cite(parish.source, parish.accessed)}.`,
      path: `/findings/#${PARISH_NOTE_ID}`,
    },
  ];
}

/** Every item the feed and the changes list carry: the notes and every data update, newest first. */
export function allUpdates(): DataUpdate[] {
  return [...findingUpdates(), ...dataUpdates()].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
