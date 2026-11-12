/**
 * Axis primitives. The zero line is the one a bar chart may not move: drawn across the
 * plot at the scale's zero, marked with data-ek-baseline and data-ek-zero for the tests.
 */
import { type Canvas } from "../canvas.js";
export declare function zeroLine(canvas: Canvas, orientation: "vertical" | "horizontal", zero: number, from: number, to: number): void;
