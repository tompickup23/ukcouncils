// d3-geo is spherical: exterior rings clockwise in lon/lat, holes anticlockwise
// (ukdemographics src/lib/map/geo.ts, after ukelections src/lib/geoRewind.ts).
function clockwise(ring) {
    let a = 0;
    for (let i = 0; i < ring.length; i++) {
        const [x1, y1] = ring[i], [x2, y2] = ring[(i + 1) % ring.length];
        a += x1 * y2 - x2 * y1;
    }
    return a < 0;
}
const rewindRings = (rings) => rings.map((r, i) => (clockwise(r) === (i === 0) ? r : [...r].reverse()));
export function rewind(f) {
    const g = f.geometry;
    return { ...f, geometry: g.type === "Polygon" ? { type: "Polygon", coordinates: rewindRings(g.coordinates) } : { type: "MultiPolygon", coordinates: g.coordinates.map(rewindRings) } };
}
export function pole(a, proj, P) {
    const polys = a.geometry.type === "Polygon" ? [a.geometry.coordinates] : a.geometry.coordinates;
    const rings = polys.flat().map((r) => r.map((c) => proj(c)));
    const inside = (x, y) => {
        let c = false;
        for (const r of rings)
            for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
                const [xi, yi] = r[i], [xj, yj] = r[j];
                if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
                    c = !c;
            }
        return c;
    };
    const edge = (x, y) => {
        let m = Math.min(x - P.x, P.x + P.w - x, y - P.y, P.y + P.h - y);
        for (const r of rings)
            for (let i = 0; i < r.length - 1; i++) {
                const [ax, ay] = r[i], [bx, by] = r[i + 1], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
                const t = L ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / L)) : 0;
                m = Math.min(m, Math.hypot(x - ax - t * dx, y - ay - t * dy));
            }
        return m;
    };
    const pts = rings.flat();
    const bx0 = Math.min(...pts.map((p) => p[0])), by0 = Math.min(...pts.map((p) => p[1]));
    const bounds = { x: bx0, y: by0, w: Math.max(...pts.map((p) => p[0])) - bx0, h: Math.max(...pts.map((p) => p[1])) - by0 };
    let [x0, x1] = [Math.max(P.x, Math.min(...pts.map((p) => p[0]))), Math.min(P.x + P.w, Math.max(...pts.map((p) => p[0])))];
    let [y0, y1] = [Math.max(P.y, Math.min(...pts.map((p) => p[1]))), Math.min(P.y + P.h, Math.max(...pts.map((p) => p[1])))];
    let best = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, r: 0 };
    if (x1 <= x0 || y1 <= y0)
        return { ...best, inside, bounds };
    for (let pass = 0; pass < 4; pass++) {
        const step = Math.max(x1 - x0, y1 - y0) / 36;
        for (let x = x0; x <= x1; x += step)
            for (let y = y0; y <= y1; y += step) {
                if (!inside(x, y))
                    continue;
                const r = edge(x, y);
                if (r > best.r)
                    best = { x, y, r };
            }
        const sp = step * 2;
        [x0, x1, y0, y1] = [best.x - sp, best.x + sp, best.y - sp, best.y + sp];
    }
    return { ...best, inside, bounds };
}
