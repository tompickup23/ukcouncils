export interface TableSpec {
    caption: string;
    head: string[];
    rows: string[][];
    source: string;
    /** Columns after the first are numbers: right aligned with tabular figures. */
    numeric?: boolean;
}
export declare function tableTwin(t: TableSpec): string;
