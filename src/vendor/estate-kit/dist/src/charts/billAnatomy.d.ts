import { type ChartOptions, type ChartOutput } from "./frame.js";
export interface BillAnatomyOptions extends ChartOptions {
    /** Value figure keys for the parts, in the order the bill lists them. */
    parts: string[];
    /** The value figure key for the published total. */
    total: string;
    /** With more than four parts, the part key drawn in the accent. Defaults to the largest. */
    highlight?: string;
    /** Opt in: every part and the total must carry a published `name` (see `nameErrors`). Off by default, as in 0.4.0. */
    requireNames?: boolean;
}
export declare function billAnatomy(o: BillAnatomyOptions): ChartOutput;
