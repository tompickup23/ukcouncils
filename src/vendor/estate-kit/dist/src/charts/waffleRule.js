/**
 * The waffle allocation rule and its paints, with no imports at all, so a client bundle
 * (the UK Council Tax budget game's grid) can take exactly the rule the server draws with
 * and nothing else: `@tompickup23/estate-kit/waffle-rule`. waffle.ts imports from here, so
 * there is one copy. Keep this file free of imports; tests/subpaths.test.ts checks it.
 */
const SERIES = ["series-1", "series-2", "series-3", "series-4"];
/**
 * The order parts take their paint: the four series solid, then with one diagonal stroke,
 * then with a cross. The neutrals are not used: they sit under 0.09 from a series under
 * colour vision, so a fifth hue would break the series gate.
 */
export const WAFFLE_PAINTS = ["none", "diagonal", "cross"].flatMap((hatch) => SERIES.map((fill) => ({ fill, hatch })));
/** The most parts a waffle splits between: one per paint. */
export const WAFFLE_MAX_PARTS = WAFFLE_PAINTS.length;
/**
 * The class a grid square takes for part i (`sq-p0` to `sq-p11`), or `sq-empty` for none.
 * The kit stylesheet maps each class to its paint, so a script recolours a server drawn
 * grid by class alone.
 */
export function squareClass(part) {
    if (part === null)
        return "sq-empty";
    if (!Number.isInteger(part) || part < 0 || part >= WAFFLE_MAX_PARTS)
        throw new Error(`squareClass: part ${part} is not 0 to ${WAFFLE_MAX_PARTS - 1}`);
    return `sq-p${part}`;
}
/**
 * Whole squares for each share, adding to exactly 100: floors first, then the largest
 * remainders, ties to the earlier part. The shares are percentages of one whole, so they
 * must be finite, not negative, and add to 100 within half a square (the same tolerance
 * Waffle allows percentage parts); anything else throws rather than returning a grid of
 * more or fewer than a hundred squares. Within that tolerance the result always adds to
 * exactly 100. A client drawing a part filled grid (a player's answers mid round)
 * normalises its values to shares first, or leaves the rest as empty squares itself.
 */
export function squaresFor(shares) {
    if (!Array.isArray(shares) || shares.length === 0)
        throw new Error("squaresFor needs at least one share");
    for (const [i, s] of shares.entries()) {
        if (typeof s !== "number" || !Number.isFinite(s))
            throw new Error(`squaresFor: share ${i} is not a finite number`);
        if (s < 0)
            throw new Error(`squaresFor: share ${i} is negative (${s})`);
    }
    const total = shares.reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 0.5)
        throw new Error(`squaresFor: the shares add up to ${total}, not 100; normalise them to percentages of one whole first`);
    const floors = shares.map((s) => Math.floor(s));
    let left = 100 - floors.reduce((a, b) => a + b, 0);
    const order = shares.map((s, i) => ({ i, r: s - Math.floor(s) })).sort((a, b) => b.r - a.r || a.i - b.i);
    for (const { i } of order) {
        if (left <= 0)
            break;
        floors[i]++;
        left--;
    }
    return floors;
}
