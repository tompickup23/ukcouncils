/** The dash pattern of the map renderer: em dash, en dash, a spaced hyphen, the entities. */
export declare const DASHES: RegExp;
/** No ranking language in a title or the alt text: areas are never ordered by a value. */
export declare const RANKING_WORDS: RegExp;
/** Neutral verbs: a share "fell" or "rose", nothing more. */
export declare const LOADED_WORDS: RegExp;
/** A colour is a token name ("series-1", "text") or a literal hex for party colours. */
export type Colour = string;
/** OKLab distance two series must keep under every vision (ukdemographics tests/ethnic-palette.test.ts). */
export declare const MIN_SERIES_DISTANCE = 0.09;
export declare const MIN_MARK_CONTRAST = 3;
export type TextRole = "title" | "value" | "scale";
export interface Box {
    x: number;
    y: number;
    w: number;
    h: number;
}
export interface TextCheck {
    content: string;
    size: number;
    weight: number;
    fill: Colour;
    bg: Colour;
    role?: TextRole;
    /** Texts in one group (the lines of one wrapped block) may touch. */
    group?: string;
    /** The measured box, from the TTF advance widths. Absent for checks built by hand. */
    box?: Box;
}
export interface MarkCheck {
    what: string;
    fill: Colour;
    against: Colour[];
}
/** A drawn mark no text may sit on: a bar, measured as the box it fills. */
export interface ObstacleCheck {
    what: string;
    box: Box;
}
export interface SeriesCheck {
    what: string;
    colours: Colour[];
}
export interface Checks {
    texts: TextCheck[];
    marks: MarkCheck[];
    series: SeriesCheck[];
    /** Marks no text may overlap (kit 0.4.0). Absent on checks built by hand. */
    obstacles?: ObstacleCheck[];
    /** The display forms the chart took from its figures; every "value" text must be one. */
    manifest: Set<string>;
    /** Scale labels the alt text may use. */
    scale: Set<string>;
    alt?: string;
}
export declare const emptyChecks: () => Checks;
/** Ranking or loaded words in a string, with the given scale labels taken out first. */
export declare function wordErrors(text: string, where: string, scale?: Iterable<string>): string[];
/**
 * The checks that do not depend on the palette: values in the manifest, overlapping text,
 * and the words of titles and alt text.
 */
export declare function layoutErrors(checks: Checks): string[];
export declare const resolve: (c: Colour, pal: Record<string, string>) => string;
/** The contrast a piece of text needs: large text (24 units, or 18.66 at 600) needs 3. */
export declare const textNeed: (size: number, weight: number) => 3 | 4.5;
/** Every failure for one palette. `name` says which theme and site, for the message. */
export declare function gateErrors(checks: Pick<Checks, "texts" | "marks" | "series">, pal: Record<string, string>, name: string): string[];
/** Runs the gates against every palette and throws with every failure listed. */
export declare function assertGates(checks: Checks, palettes: {
    name: string;
    pal: Record<string, string>;
}[], what: string): void;
