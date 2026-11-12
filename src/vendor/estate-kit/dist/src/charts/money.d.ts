/**
 * The to the penny reconciliation BillAnatomy has always made, shared so a money Waffle
 * makes the same one: the parts must add up to the published total, a figure of its own
 * from the document, never the sum the kit computes. A missing precept or a mistyped part
 * cannot reach a page.
 */
import { type ValueFigure } from "../figures/figures.js";
/** A money value in whole pence (hundredths of the unit), so sums compare exactly. */
export declare const pence: (v: number) => number;
/** Throws unless every part and the total are money in one unit and the parts add up to the total to the penny. */
export declare function reconcile(parts: [string, ValueFigure][], total: [string, ValueFigure], what: string): void;
