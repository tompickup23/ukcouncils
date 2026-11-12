import { type ChartOptions, type ChartOutput } from "./frame.js";
export interface PositionStripOptions extends ChartOptions {
    /** The place's value figure. */
    figure: string;
    /** A series figure of every published value in the class, one point per member. */
    distribution: string;
    /** The label of the place's own point in the distribution. Its value must equal the figure's. */
    place?: string;
    /** The class in the plural, for the method line: "shire districts". */
    classLabel: string;
    /** The charge basis, stated in the drawing: "Area Band D, including parish precepts". */
    basis: string;
    /** Opt in: the place's figure must carry a published `name` (see `nameErrors`). Off by default, as in 0.4.0. */
    requireNames?: boolean;
}
/** The fewest members a class may have: a 90th percentile of fewer values says little. */
export declare const MIN_CLASS = 10;
/** The scale labels, which the ranking gate lets the alt text use. */
export declare const SCALE_LABELS: {
    readonly min: "lowest";
    readonly median: "median";
    readonly p90: "90th percentile";
    readonly max: "highest";
};
/** Linear interpolation between closest ranks (type 7) on sorted values. */
export declare function percentile(sorted: number[], p: number): number;
export interface StripStats {
    n: number;
    min: number;
    median: number;
    p90: number;
    max: number;
}
/** The five numbers of a class, from its published values. */
export declare function stripStats(values: number[]): StripStats;
export declare function positionStrip(o: PositionStripOptions): ChartOutput;
