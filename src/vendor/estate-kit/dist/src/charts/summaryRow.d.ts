import type { ChartOptions } from "./frame.js";
export interface SummaryFact {
    /** Missing facts have no figure key and are omitted. A recorded zero is still a value. */
    figure?: string | null;
    label?: string;
    perspective?: string;
    perspectiveWaived?: string;
}
export interface SummaryRowOptions extends Pick<ChartOptions, "set" | "mode" | "site"> {
    facts: SummaryFact[];
}
export interface SummaryTile {
    figure: string;
    label: string;
    value: string;
    svg: string;
    sourceHtml: string;
}
/** Returns only present facts. Invalid figure keys still fail; they are not missing data. */
export declare function summaryRowTiles(o: SummaryRowOptions): SummaryTile[];
export declare function summaryRowHtml(o: SummaryRowOptions): string;
