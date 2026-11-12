import { type ChartOptions, type ChartOutput } from "./frame.js";
export interface HemicycleOptions extends ChartOptions {
    /** Value figure keys, one per party, each a count of seats. The figure's name is the party. */
    parties: string[];
    /** The value figure key for the number of seats in the chamber. */
    total: string;
    /** The value figure key for the seats needed for a majority. Without one, the kit draws more than half. */
    majority?: string;
    /** "party" colours each party by name from the party map; "series" takes --series-1 to 4 in order. */
    colours?: "party" | "series";
    /** "ideology" places known parties left to right as UK Elections does; "given" keeps the order passed. */
    order?: "ideology" | "given";
    /** What to call seats nobody holds. */
    emptyLabel?: string;
}
export declare function hemicycle(o: HemicycleOptions): ChartOutput;
