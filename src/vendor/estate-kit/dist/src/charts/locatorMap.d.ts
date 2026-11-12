import { type ChartOptions, type ChartOutput } from "./frame.js";
type Ring = number[][];
export interface AreaFeature {
    type: "Feature";
    properties: {
        code: string;
        name: string;
    };
    geometry: {
        type: "Polygon";
        coordinates: Ring[];
    } | {
        type: "MultiPolygon";
        coordinates: Ring[][];
    };
}
export interface LocatorMapOptions extends ChartOptions {
    /** The areas to draw: the focus and its neighbours, with their codes and names. */
    areas: AreaFeature[];
    /** The code of the place the map is about. */
    focus: string;
    /** Area code to a value figure key. Areas without a key are hatched as having no figure. */
    values: Record<string, string>;
    /** Class breaks, ascending: 3 to 6 of them, giving 4 to 7 classes. */
    breaks: number[];
    /** The boundary licence line, printed with the source. Required. */
    boundaryCredit: string;
    /**
     * The same map's values in its other editions or years, area code to figure key. Plates
     * are sized for the widest value across all of them, so a site that renders one map per
     * year, passing the others here, gets one layout for every year and nothing moves.
     */
    lockAcross?: Record<string, string>[];
    /**
     * Where a neighbour that fits nowhere on the map is named: "list" (the default) in a
     * line under the key; "gutter" on a plate at the panel's edge with a leader line to its
     * area, the leaders never crossing, and in the line under the key only if no gutter has room.
     */
    neighbourLabels?: "list" | "gutter";
}
/** The ramp steps for a number of classes, spread across the seven so the ends always show. */
export declare function rampFor(classes: number): string[];
export declare function locatorMap(o: LocatorMapOptions): ChartOutput;
export {};
