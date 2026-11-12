/**
 * Mark primitives for the grammar layer. A primitive draws its mark and registers the box
 * it fills with canvas.obstacle(), so the text against marks gate (kit 0.4.0) covers every
 * chart built from it with no further wiring.
 */
import { type Canvas } from "../canvas.js";
import type { Colour } from "../../qa/gates.js";
import type { Box } from "../../qa/gates.js";
/**
 * The path of a bar from `base` to `end` along its length, `cross` to `cross + thickness`
 * across it: the data end rounded by `r`, the base end square. Empty for a zero length.
 */
export declare function barPath(orientation: "vertical" | "horizontal", base: number, end: number, cross: number, thickness: number, r: number, length?: number): string;
export interface BarSpec {
    orientation: "vertical" | "horizontal";
    /** Where the bar starts along its length: the zero line. */
    base: number;
    /** Where it ends along its length. */
    end: number;
    /** Its length, as the scale measured it (base and end differ by this, up to rounding). */
    length: number;
    /** Where it starts across its length, and how thick it is. */
    cross: number;
    thickness: number;
    /** The radius of the data end. */
    r: number;
    fill: Colour;
    /** The native tooltip, so hover needs no script. */
    title: string;
    /** What the gate calls the bar in a message. */
    what: string;
    /** Extra attributes on the path (data-*), written after the paint. */
    attrs?: string;
}
/**
 * Opens a bar's group, draws its path and registers the box it fills. The caller draws
 * any labels that belong to the bar and then closes the group with `</g>`.
 */
export declare function openBar(canvas: Canvas, s: BarSpec): Box;
/**
 * Registers a stroked polyline as the boxes of its segments, each grown by half the
 * stroke, so text that crosses the line is refused while text beside it is not.
 */
export declare function polylineObstacles(canvas: Canvas, what: string, points: {
    x: number;
    y: number;
}[], strokeWidth: number): void;
