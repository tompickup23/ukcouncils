/**
 * Plates and gutter labels, lifted from the UK Demographics map library (src/lib/map/
 * layout.ts) and generalised: nothing here knows about councils, indicators or templates.
 *
 * A locked layout: a plate is sized for the widest text it will ever hold, across every
 *   edition or year the caller passes, so a layout computed once holds for all of them and
 *   nothing moves when the reader steps through the years.
 * Plates placed on a spiral round their anchor, the most important first, each where it
 *   touches no plate already placed and stays inside the panel.
 * Gutter labels for what found no place: each on its side of the panel, sorted by the
 *   height of its anchor and pushed apart, so their leader lines never cross; the sides
 *   balanced when one overflows; and a leader that would end under a plate moved to the
 *   nearest point of its own area that is clear.
 */
import type { Box } from "../../qa/gates.js";
/** The widest of the texts a plate will hold, measured by `measure`. */
export declare function lockedWidth(texts: string[], measure: (s: string) => number): number;
/** The radii, as fractions of an anchor's clear radius, that the spiral tries, twelve angles each. */
export declare const SPIRAL_RADII: number[];
/** Offsets to try round an anchor: the anchor itself, then rings at SPIRAL_RADII of `r`. */
export declare function spiral(r: number): [number, number][];
export interface PlateCandidate<T> {
    item: T;
    w: number;
    h: number;
    /** Where the plate wants to sit, and how far from it there is clear room. */
    anchor: {
        x: number;
        y: number;
    };
    r: number;
    /** Worth trying on the spiral at all. */
    eligible: boolean;
    /** Placed even when nothing is clear: clamped inside the panel at its anchor. */
    always?: boolean;
    /** An extra test of a top left position, such as "the centre stays inside its own area". */
    fits?: (x: number, y: number) => boolean;
}
export interface Placed<T> {
    item: T;
    x: number;
    y: number;
    w: number;
    h: number;
}
/**
 * Places plates in the order given (most important first). Positions are top left. Each
 * keeps `gap` from every plate before it and `inset` inside the panel.
 */
export declare function placePlates<T>(cands: PlateCandidate<T>[], o: {
    panel: Box;
    gap: number;
    inset: number;
}): {
    placed: Placed<T>[];
    unplaced: T[];
};
/**
 * Moves a leader's anchor off any plate: if `covered` holds at the anchor, the nearest
 * point of the area (`inside`, searched on a grid over `bounds`) that is not covered.
 * Returns the anchor unchanged when it is clear or no clear point exists.
 */
export declare function leaderAnchor(anchor: {
    x: number;
    y: number;
}, bounds: Box, inside: (x: number, y: number) => boolean, covered: (x: number, y: number) => boolean): {
    x: number;
    y: number;
};
export interface GutterItem<T> {
    item: T;
    w: number;
    h: number;
    anchor: {
        x: number;
        y: number;
    };
}
export interface GutterLabel<T> extends GutterItem<T> {
    side: "L" | "R"; /** Centre of the label. */
    x: number;
    y: number;
}
/**
 * Gutter labels, after UKD layout.ts: each item takes the side its anchor is on; while a
 * side overflows its height, its most central item crosses over if the other side has
 * room; on each side the items, sorted by anchor height, are pushed apart by `gap` and
 * shifted up if the last runs past `maxY`. Sorted order is kept, so leaders never cross.
 */
export declare function gutterLabels<T>(items: GutterItem<T>[], o: {
    panel: Box;
    gap: number;
    minY: number;
    maxY: number;
    inset: number;
    only?: "L" | "R";
}): GutterLabel<T>[];
type P2 = {
    x: number;
    y: number;
};
/** True when segment a to b passes through the box grown by `pad`. */
export declare function segmentHitsBox(a: P2, b: P2, box: Box, pad?: number): boolean;
/** True when segments a1 to a2 and b1 to b2 cross. */
export declare function segmentsCross(a1: P2, a2: P2, b1: P2, b2: P2): boolean;
export {};
