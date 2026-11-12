/**
 * The waffle allocation rule and its paints, with no imports at all, so a client bundle
 * (the UK Council Tax budget game's grid) can take exactly the rule the server draws with
 * and nothing else: `@tompickup23/estate-kit/waffle-rule`. waffle.ts imports from here, so
 * there is one copy. Keep this file free of imports; tests/subpaths.test.ts checks it.
 */
export type Hatch = "none" | "diagonal" | "cross";
export interface Paint {
    fill: string;
    hatch: Hatch;
}
/**
 * The order parts take their paint: the four series solid, then with one diagonal stroke,
 * then with a cross. The neutrals are not used: they sit under 0.09 from a series under
 * colour vision, so a fifth hue would break the series gate.
 */
export declare const WAFFLE_PAINTS: Paint[];
/** The most parts a waffle splits between: one per paint. */
export declare const WAFFLE_MAX_PARTS: number;
/**
 * The class a grid square takes for part i (`sq-p0` to `sq-p11`), or `sq-empty` for none.
 * The kit stylesheet maps each class to its paint, so a script recolours a server drawn
 * grid by class alone.
 */
export declare function squareClass(part: number | null): string;
/**
 * Whole squares for each share, adding to exactly 100: floors first, then the largest
 * remainders, ties to the earlier part. The shares are percentages of one whole, so they
 * must be finite, not negative, and add to 100 within half a square (the same tolerance
 * Waffle allows percentage parts); anything else throws rather than returning a grid of
 * more or fewer than a hundred squares. Within that tolerance the result always adds to
 * exactly 100. A client drawing a part filled grid (a player's answers mid round)
 * normalises its values to shares first, or leaves the rest as empty squares itself.
 */
export declare function squaresFor(shares: number[]): number[];
