export interface TableSpec {
    caption: string;
    head: string[];
    rows: string[][];
    source: string;
    /** Columns after the first are numbers: right aligned with tabular figures. */
    numeric?: boolean;
    /** Trusted caller links, validated by AreaMap before rendering. */
    rowLinks?: string[];
}
export declare function tableTwin(t: TableSpec): string;
