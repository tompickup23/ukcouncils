/**
 * Label placement for the grammar layer: pure functions over boxes, no drawing. The first
 * routine is ZeroBar's (kit 0.4.0), generalised: try candidate places in order and take the
 * first that touches no mark and stays inside the plot. The second is PositionStrip's row
 * stacking; the third pushes end labels apart, as Line does.
 */
import type { Box } from "../../qa/gates.js";
export declare const overlaps: (a: Box, b: Box) => boolean;
export interface Candidate<T> {
    /** The box the label would fill here. */
    box: Box;
    /** What the caller needs back to draw it here. */
    at: T;
    /** False when this place leaves the plot; such a place is skipped. */
    inside?: boolean;
}
/** The first candidate that is inside and clear of every obstacle, or undefined. */
export declare function firstClear<T>(candidates: Candidate<T>[], obstacles: Box[]): T | undefined;
/**
 * Stacks spans on rows: each takes the first row where it is `pad` clear of every span
 * already on that row. Mutates and returns the spans with their `row`.
 */
export declare function stackRows<T extends {
    l: number;
    w: number;
    row: number;
}>(spans: T[], pad: number): T[];
/** Pushes positions sorted top to bottom down until each is at least `gap` below the last. */
export declare function spread<T extends {
    y: number;
}>(sorted: T[], gap: number): T[];
