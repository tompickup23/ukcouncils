/**
 * Scales for the grammar layer (RETHINK_2026-11.md section 4.2). Each is a plain function
 * of numbers with no drawing, so a chart composes them and the arithmetic is written once.
 * The expressions are kept exactly as the charts first wrote them, term for term, so a
 * chart moved onto the grammar draws the same bytes (tests/chart-golden.test.ts).
 */
/** A continuous scale from a domain onto a length that starts at `start`. */
export declare function linear(d0: number, d1: number, start: number, length: number): {
    at: (v: number) => number;
    d0: number;
    d1: number;
    start: number;
    length: number;
};
/** The domain of bars measured from zero: always holds zero, so the baseline never moves. */
export declare function zeroDomain(values: number[]): {
    lo: number;
    hi: number;
    span: number;
};
/**
 * A scale for bars measured from zero, over a zeroDomain. `up` runs from the top of the
 * length to the bottom with the highest value first (vertical bars); `right` runs left to
 * right (horizontal bars).
 */
export declare function zeroScale(domain: {
    lo: number;
    hi: number;
    span: number;
}, start: number, length: number, direction: "up" | "right"): {
    lo: number;
    hi: number;
    span: number;
    zero: number;
    extent: (v: number) => number;
    start: number;
    length: number;
};
/** Equal bands across a length, one per item, each with its gap shared either side. */
export declare function bands(n: number, start: number, length: number, opts?: {
    gapRatio?: number;
    minGap?: number;
}): {
    step: number;
    gap: number;
    band: number;
    at: (i: number) => number;
    centred: (i: number, thickness: number) => number;
};
