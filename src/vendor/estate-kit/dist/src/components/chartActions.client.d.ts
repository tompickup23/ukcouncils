/**
 * The one script enhancement of ChartActions: "Copy table" copies the chart's table twin as
 * tab separated text, and "Table" opens the twin it points at. Without script the button
 * stays hidden and the link still lands on the twin's summary. Exported for the test, and
 * run by ChartActions.astro on load.
 */
interface Clip {
    writeText(text: string): Promise<void>;
}
/** A table's rows as tab separated text, one line per row, cells trimmed. */
export declare function tableText(table: HTMLTableElement): string;
export declare function enhanceChartActions(root: Document, clipboard: Clip | undefined): void;
export {};
