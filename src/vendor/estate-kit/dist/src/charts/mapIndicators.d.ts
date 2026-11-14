/** Fixed definitions, after the UK Demographics indicator registry and colourFor.
 * Sites own their small registry. Nothing here derives thresholds from observations.
 */
import type { Unit } from "../figures/figures.js";
export interface FixedMapIndicator {
    kind: "fixed";
    label: string;
    unit: Exclude<Unit, "count">;
    /** Values at a break belong to the class above it. Never recompute by year. Three to six
     * breaks, giving the four to seven classes the sequential ramp spreads across. */
    breaks: readonly number[];
}
export interface CategoricalMapIndicator {
    kind: "categorical";
    label: string;
    /** Stable order and keys across editions, including classes with no observations. */
    categories: readonly {
        id: string;
        label: string;
    }[];
}
export type MapIndicator = FixedMapIndicator | CategoricalMapIndicator;
export type MapIndicatorRegistry = Readonly<Record<string, MapIndicator>>;
export declare function defineMapIndicators(input: Record<string, MapIndicator>): MapIndicatorRegistry;
/** Null is a class of its own, never the first class. */
export declare function mapClass(ind: MapIndicator, value: number | string | null): number | null;
/**
 * Fixed classes are ordered, so they take the sequential ramp (one hue, steadily lighter, as
 * LocatorMap and the UK Demographics maps draw them) and an unknown takes the ramp's no figure
 * colour. Categorical classes are unordered, so they take the four gated series, repeated
 * only with a different pattern for further classes.
 */
export declare function colourFor(ind: MapIndicator, value: number | string | null): string;
