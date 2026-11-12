export const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
/** The first candidate that is inside and clear of every obstacle, or undefined. */
export function firstClear(candidates, obstacles) {
    for (const c of candidates) {
        if (c.inside === false)
            continue;
        if (!obstacles.some((o) => overlaps(c.box, o)))
            return c.at;
    }
    return undefined;
}
/**
 * Stacks spans on rows: each takes the first row where it is `pad` clear of every span
 * already on that row. Mutates and returns the spans with their `row`.
 */
export function stackRows(spans, pad) {
    const placed = [];
    for (const b of spans) {
        while (placed.some((q) => q.row === b.row && b.l < q.l + q.w + pad && b.l + b.w + pad > q.l))
            b.row++;
        placed.push(b);
    }
    return placed;
}
/** Pushes positions sorted top to bottom down until each is at least `gap` below the last. */
export function spread(sorted, gap) {
    for (let k = 1; k < sorted.length; k++)
        if (sorted[k].y - sorted[k - 1].y < gap)
            sorted[k].y = sorted[k - 1].y + gap;
    return sorted;
}
