/** Shared map geometry from LocatorMap, after the UK Elections ring winding fix. */
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
export declare function rewind(f: AreaFeature): AreaFeature;
/**
 * The pole of inaccessibility of an area as drawn: the point inside the area, and inside
 * the panel, furthest from either edge, found by a refining grid search on the projected
 * rings (after UKD layout.ts geoPole, which searches in lon/lat; here the panel cut is part
 * of the edge, since a plate must sit inside the panel).
 */
type Pt = [number, number];
export declare function pole(a: AreaFeature, proj: (p: Pt) => Pt | null, P: {
    x: number;
    y: number;
    w: number;
    h: number;
}): {
    x: number;
    y: number;
    r: number;
    inside: (x: number, y: number) => boolean;
    bounds: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
};
export {};
