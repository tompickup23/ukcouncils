/**
 * The figure record. Generalised from the Burnley council tax film (Reports
 * Burnley_CTax_Video_work/remotion/src/lib/figures.ts): a figure is recorded once, with
 * its value, unit, display forms and its full source, and every renderer takes it by key.
 * Nothing in the kit accepts a typed number.
 *
 * The source caption string is built here and only here, so the site, the brief, the card
 * and the film print the same words.
 */
export type Unit = "gbp" | "pence" | "percent" | "count" | "rate" | "index";
export declare const UNITS: Unit[];
export interface Source {
    /** Optional linked citation metadata, required only by the full and short HTML helpers. */
    id?: string;
    publicationDate?: string;
    /** The body that published the document, as it names itself. */
    publisher: string;
    /** The document title, verbatim. */
    title: string;
    /** Where in the document: "Table 2.1" or a sheet name. One of table or page is required. */
    table?: string;
    /** For PDFs, the page as printed or the PDF page, for example "page 14". */
    page?: string;
    /** Edition, release or date of the document, for example "2026/27" or "12 March 2026". */
    edition: string;
    url?: string;
    /** Date the web source was read, ISO 8601. */
    accessed?: string;
}
export interface Display {
    /** The full form, for tables and the stat tile. */
    full?: string;
    /** A rounded form, for speech and film. */
    round?: string;
    /** A short form for tight labels. */
    short?: string;
}
interface Base {
    /** What the figure is a count of, said plainly. Shown as the stat tile label and table header. */
    label: string;
    /** A short name for direct labels on a chart. Falls back to label. */
    name?: string;
    unit: Unit;
    /** Decimal places for generated display forms. */
    dp?: number;
    source: Source;
    /** True for test and demo data. A fixture caption says so on every surface. */
    fixture?: boolean;
    note?: string;
}
export interface ValueFigure extends Base {
    kind: "value";
    value: number;
    display?: Display;
}
export interface SeriesPoint {
    /** The category or period, for example "2025/26" or an ISO date for a time axis. */
    label: string;
    value: number;
    display?: Display;
}
export interface SeriesFigure extends Base {
    kind: "series";
    /** "category" draws one label per point; "time" reads each label as an ISO date. */
    axis: "category" | "time";
    points: SeriesPoint[];
}
export type Figure = ValueFigure | SeriesFigure;
export type DisplayForm = keyof Display;
/** Problems with one record, as plain sentences. Empty when the record is sound. */
export declare function validateFigure(key: string, f: unknown): string[];
/** One source as caption text, without the "Source:" lead. */
export declare function sourceText(s: Source): string;
/**
 * The caption for one or more figures. Figures that share a source collapse into one
 * entry, so a chart of ten bars from one table prints one source.
 */
export declare function captionFor(figs: Figure[]): string;
/**
 * The caption as HTML, with each document title linked to its url. Its text content is
 * exactly captionFor(), which the tests check.
 */
export declare function captionHtml(figs: Figure[]): string;
/** Formats a number in a figure's unit. Arithmetic on the recorded value, never a new figure. */
export declare function formatValue(value: number, unit: Unit, dp?: number, form?: DisplayForm): string;
export interface FigureSet {
    keys(): string[];
    get(key: string): Figure;
    value(key: string): ValueFigure;
    series(key: string): SeriesFigure;
    /** A display form of a value figure: the recorded form if there is one, else generated. */
    show(key: string, form?: DisplayForm): string;
    caption(keys: string | string[]): string;
    captionHtml(keys: string | string[]): string;
}
/** Validates every record and returns the set. Any problem throws, naming every key at fault. */
export declare function defineFigures(data: Record<string, unknown>): FigureSet;
/** A point's display form, recorded or generated. */
export declare function showPoint(f: SeriesFigure, p: SeriesPoint, form?: DisplayForm): string;
/** Registers the default set, so a site loads its figures once and components need only a key. */
export declare function useFigures(set: FigureSet): FigureSet;
export declare function currentFigures(explicit?: FigureSet): FigureSet;
export {};
