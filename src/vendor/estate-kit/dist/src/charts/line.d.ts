import { type ChartOptions, type ChartOutput } from "./frame.js";
export interface LineOptions extends ChartOptions {
    /** Series figure keys, drawn in order. All must share a unit and an axis kind. */
    series: string[];
    /** "series" takes --series-1 to --series-4 in order; "party" takes each series name's party colour. */
    colours?: "series" | "party";
    yFrom?: "zero" | "data";
}
export declare function line(o: LineOptions): ChartOutput;
