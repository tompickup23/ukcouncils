import { type ChartOptions, type ChartOutput } from "./frame.js";
export { squaresFor, squareClass, WAFFLE_MAX_PARTS, WAFFLE_PAINTS, type Hatch, type Paint } from "./waffleRule.js";
export type WaffleSize = "standard" | "small";
export interface WaffleOptions extends ChartOptions {
    /** A value figure in percent, from 0 to 100. Give this or parts. */
    figure?: string;
    /** Two to twelve value figures in one unit, in key order. Give this or figure. */
    parts?: string[];
    /** Key text for the filled squares of a single figure. Defaults to the figure's name or label. */
    filledLabel?: string;
    /** Key text for the empty squares of a single figure. No number: the reader counts them. */
    emptyLabel?: string;
    /** standard (the default) or small, the 10 by 10 phone size with the key below. */
    size?: WaffleSize;
    /**
     * Grid only: the hundred squares and nothing else, for a script to recolour (the A6
     * player's grid, option 1). Every square is a group with data-ek-square="0" to "99" and
     * one class, sq-p0 to sq-p11 or sq-empty, and carries both hatch strokes, hidden unless
     * its part is hatched; kit.css maps the classes to the paints. Takes figure, parts, or
     * neither for an empty grid. No text is drawn: the page puts the source beside it.
     */
    grid?: boolean;
    /**
     * The value figure key of the published total, for a split of money (a bill by body, a
     * budget by service). The parts must add up to it to the penny or the chart refuses, as
     * BillAnatomy does, so a missing part cannot renormalise into a confident split. Pass it
     * whenever the document publishes a total.
     */
    total?: string;
}
export declare function waffle(o: WaffleOptions): ChartOutput;
