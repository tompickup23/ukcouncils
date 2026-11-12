/**
 * The annotation primitive: a run of text pieces on one baseline (a name, then its value),
 * clamped to a span, with an optional leader line to the thing it names. Each piece goes
 * through canvas.text(), so the contrast, manifest and overlap gates see it like any other
 * text; a leader is drawn first, so it never covers its own words.
 */
import { type Canvas, type Family } from "../canvas.js";
import type { Colour, TextRole } from "../../qa/gates.js";
export interface Piece {
    text: string;
    size: number;
    weight?: number;
    family?: Family;
    fill: Colour;
    role?: TextRole;
    tabular?: boolean;
}
export interface Annotation {
    pieces: Piece[];
    /** The gap between pieces. */
    gap: number;
    /** Where the run is centred, before clamping. */
    x: number;
    /** The baseline. */
    y: number;
    /** The run is kept inside [min, max]. */
    within: {
        min: number;
        max: number;
    };
    bg: Colour;
    /** A line from (x, y) to the run, in this colour. */
    leader?: {
        x: number;
        y: number;
        stroke: Colour;
        width?: number;
    };
}
/** The width of each piece and of the whole run. */
export declare function measure(a: Pick<Annotation, "pieces" | "gap">): {
    widths: number[];
    total: number;
};
/** Draws the run and returns where it starts and how wide it is. */
export declare function annotate(canvas: Canvas, a: Annotation): {
    left: number;
    width: number;
};
