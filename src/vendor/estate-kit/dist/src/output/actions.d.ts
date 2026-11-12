export interface ChartActionsOptions {
    /** The id of the chart's table twin, the details element ChartFigure draws. */
    twinId: string;
    /** What the chart shows, for the links' accessible names: "Band D by year". */
    label: string;
    /** The chart's prebuilt PNGs, one per theme. Leave out when the build made none. */
    png?: {
        light: string;
        dark: string;
    };
}
/** The markup of the actions row. ChartActions.astro renders it and adds the copy script. */
export declare function chartActionsHtml(o: ChartActionsOptions): string;
/** The PNG file names for a chart, one per theme: "<name>-light.png" and "<name>-dark.png". */
export declare function chartPngNames(name: string): {
    light: string;
    dark: string;
};
