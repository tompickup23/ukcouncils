import { type ChartOptions, type ChartOutput } from "./frame.js";
export interface RankedBarRow {
    figure: string;
    /** A signed change figure. Its own unit may be percentage points (unit rate). */
    change?: string;
}
export interface RankedBarsOptions extends ChartOptions {
    /** In caller order. One comparable group only; the chart never sorts or selects rows. */
    rows: RankedBarRow[];
    classLabel: string;
    basis: string;
}
export declare function rankedBars(o: RankedBarsOptions): ChartOutput;
