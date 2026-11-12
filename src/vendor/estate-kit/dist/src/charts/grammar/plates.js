/** The widest of the texts a plate will hold, measured by `measure`. */
export function lockedWidth(texts, measure) {
    return Math.max(...texts.map(measure));
}
/** The radii, as fractions of an anchor's clear radius, that the spiral tries, twelve angles each. */
export const SPIRAL_RADII = [0.35, 0.7, 1.0, 1.4];
/** Offsets to try round an anchor: the anchor itself, then rings at SPIRAL_RADII of `r`. */
export function spiral(r) {
    const tries = [[0, 0]];
    for (const rad of SPIRAL_RADII)
        for (let i = 0; i < 12; i++)
            tries.push([Math.cos((i * Math.PI) / 6) * r * rad, Math.sin((i * Math.PI) / 6) * r * rad]);
    return tries;
}
/**
 * Places plates in the order given (most important first). Positions are top left. Each
 * keeps `gap` from every plate before it and `inset` inside the panel.
 */
export function placePlates(cands, o) {
    const { panel: P, gap, inset } = o;
    const placed = [];
    const unplaced = [];
    const clash = (x, y, w, h) => placed.some((q) => x < q.x + q.w + gap && x + w + gap > q.x && y < q.y + q.h + gap && y + h + gap > q.y);
    const outside = (x, y, w, h) => x < P.x + inset || y < P.y + inset || x + w > P.x + P.w - inset || y + h > P.y + P.h - inset;
    for (const c of cands) {
        let pos = null;
        if (c.eligible) {
            for (const [dx, dy] of spiral(c.r)) {
                const x = c.anchor.x + dx - c.w / 2, y = c.anchor.y + dy - c.h / 2;
                if (!clash(x, y, c.w, c.h) && !outside(x, y, c.w, c.h) && (!c.fits || c.fits(x, y))) {
                    pos = [x, y];
                    break;
                }
            }
        }
        if (!pos && c.always)
            pos = [Math.min(Math.max(c.anchor.x - c.w / 2, P.x + inset), P.x + P.w - c.w - inset), Math.min(Math.max(c.anchor.y - c.h / 2, P.y + inset), P.y + P.h - c.h - inset)];
        if (!pos) {
            unplaced.push(c.item);
            continue;
        }
        placed.push({ item: c.item, x: pos[0], y: pos[1], w: c.w, h: c.h });
    }
    return { placed, unplaced };
}
/**
 * Moves a leader's anchor off any plate: if `covered` holds at the anchor, the nearest
 * point of the area (`inside`, searched on a grid over `bounds`) that is not covered.
 * Returns the anchor unchanged when it is clear or no clear point exists.
 */
export function leaderAnchor(anchor, bounds, inside, covered) {
    if (!covered(anchor.x, anchor.y))
        return anchor;
    const step = Math.max(2, Math.max(bounds.w, bounds.h) / 40);
    let best = null;
    for (let x = bounds.x; x <= bounds.x + bounds.w; x += step)
        for (let y = bounds.y; y <= bounds.y + bounds.h; y += step) {
            if (!inside(x, y) || covered(x, y))
                continue;
            const d = Math.hypot(x - anchor.x, y - anchor.y);
            if (!best || d < best.d)
                best = { x, y, d };
        }
    return best ? { x: best.x, y: best.y } : anchor;
}
/**
 * Gutter labels, after UKD layout.ts: each item takes the side its anchor is on; while a
 * side overflows its height, its most central item crosses over if the other side has
 * room; on each side the items, sorted by anchor height, are pushed apart by `gap` and
 * shifted up if the last runs past `maxY`. Sorted order is kept, so leaders never cross.
 */
export function gutterLabels(items, o) {
    const { panel, gap, minY, maxY, inset } = o;
    const midX = panel.x + panel.w / 2;
    // With one gutter every item goes to it and nothing is balanced.
    const sides = new Map(items.map((e) => [e, o.only ?? (e.anchor.x < midX ? "L" : "R")]));
    const need = (sd) => items.filter((e) => sides.get(e) === sd).reduce((acc, e) => acc + e.h + gap, -gap);
    const avail = maxY - minY;
    for (let guard = 0; !o.only && guard < items.length; guard++) {
        const full = need("L") > avail ? "L" : need("R") > avail ? "R" : null;
        if (!full)
            break;
        const other = full === "L" ? "R" : "L";
        const movable = items.filter((e) => sides.get(e) === full).sort((p, q) => (full === "L" ? q.anchor.x - p.anchor.x : p.anchor.x - q.anchor.x))[0];
        if (!movable || need(other) + movable.h + gap > avail)
            break;
        sides.set(movable, other);
    }
    const out = [];
    for (const side of ["L", "R"]) {
        const list = items.filter((e) => sides.get(e) === side).sort((a, b) => a.anchor.y - b.anchor.y);
        const ys = [];
        let last = -Infinity, lastH = 0;
        for (const e of list) {
            const y = Math.max(e.anchor.y, minY + e.h / 2, last + (lastH + e.h) / 2 + gap);
            ys.push(y);
            last = y;
            lastH = e.h;
        }
        const over = last + lastH / 2 - maxY;
        list.forEach((e, i) => {
            const y = over > 0 ? ys[i] - over : ys[i];
            const x = side === "L" ? panel.x + inset + e.w / 2 : panel.x + panel.w - inset - e.w / 2;
            out.push({ ...e, side, x, y });
        });
    }
    return out;
}
/** True when segment a to b passes through the box grown by `pad`. */
export function segmentHitsBox(a, b, box, pad = 0) {
    const x0 = box.x - pad, y0 = box.y - pad, x1 = box.x + box.w + pad, y1 = box.y + box.h + pad;
    // Liang and Barsky: clip the segment's parameter range against each side of the box.
    let t0 = 0, t1 = 1;
    const dx = b.x - a.x, dy = b.y - a.y;
    for (const [p, q] of [[-dx, a.x - x0], [dx, x1 - a.x], [-dy, a.y - y0], [dy, y1 - a.y]]) {
        if (p === 0) {
            if (q < 0)
                return false;
            continue;
        }
        const t = q / p;
        if (p < 0) {
            if (t > t1)
                return false;
            if (t > t0)
                t0 = t;
        }
        else {
            if (t < t0)
                return false;
            if (t < t1)
                t1 = t;
        }
    }
    return t0 <= t1;
}
/** True when segments a1 to a2 and b1 to b2 cross. */
export function segmentsCross(a1, a2, b1, b2) {
    const side = (p, q, r) => Math.sign((q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x));
    return side(a1, a2, b1) !== side(a1, a2, b2) && side(b1, b2, a1) !== side(b1, b2, a2);
}
