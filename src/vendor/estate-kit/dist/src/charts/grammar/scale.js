/**
 * Scales for the grammar layer (RETHINK_2026-11.md section 4.2). Each is a plain function
 * of numbers with no drawing, so a chart composes them and the arithmetic is written once.
 * The expressions are kept exactly as the charts first wrote them, term for term, so a
 * chart moved onto the grammar draws the same bytes (tests/chart-golden.test.ts).
 */
/** A continuous scale from a domain onto a length that starts at `start`. */
export function linear(d0, d1, start, length) {
    const at = (v) => start + ((v - d0) / (d1 - d0)) * length;
    return { at, d0, d1, start, length };
}
/** The domain of bars measured from zero: always holds zero, so the baseline never moves. */
export function zeroDomain(values) {
    const lo = Math.min(0, ...values);
    const hi = Math.max(0, ...values);
    return { lo, hi, span: hi - lo || 1 };
}
/**
 * A scale for bars measured from zero, over a zeroDomain. `up` runs from the top of the
 * length to the bottom with the highest value first (vertical bars); `right` runs left to
 * right (horizontal bars).
 */
export function zeroScale(domain, start, length, direction) {
    const { lo, hi, span } = domain;
    const zero = direction === "up" ? start + (hi / span) * length : start + (-lo / span) * length;
    /** How long a bar for `v` is, from zero. */
    const extent = (v) => (Math.abs(v) / span) * length;
    return { lo, hi, span, zero, extent, start, length };
}
/** Equal bands across a length, one per item, each with its gap shared either side. */
export function bands(n, start, length, opts = {}) {
    const step = length / n;
    const gap = Math.max(opts.minGap ?? 0, step * (opts.gapRatio ?? 0));
    const band = step - gap;
    /** Where band i starts, past half its gap. */
    const at = (i) => start + i * step + gap / 2;
    /** Where a mark `thickness` thick starts when centred in band i. */
    const centred = (i, thickness) => start + i * step + (step - thickness) / 2;
    return { step, gap, band, at, centred };
}
