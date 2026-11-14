import { type Source } from "../figures/figures.js";
import { type ChartOptions, type ChartOutput } from "./frame.js";
import { type AreaFeature } from "./grammar/geo.js";
import { type MapIndicatorRegistry } from "./mapIndicators.js";
interface AreaMapBase extends ChartOptions {
    /** Unique on the page, for pattern ids. */
    id: string;
    title: string;
    description: string;
    areas: AreaFeature[];
    links: Record<string, string>;
    registry: MapIndicatorRegistry;
    indicator: string;
    boundaryCredit: string;
    /** State geographic exclusions and what the measure does not show. */
    notDrawn: string;
}
export type AreaMapOptions = AreaMapBase & ({
    modeData: "fixed";
    values: Record<string, string>;
    categories?: never;
    source?: never;
    fixture?: never;
} | {
    modeData: "categorical";
    categories: Record<string, string | null>;
    source: Source;
    fixture?: boolean;
    values?: never;
});
export declare function areaMap(o: AreaMapOptions): ChartOutput;
export {};
