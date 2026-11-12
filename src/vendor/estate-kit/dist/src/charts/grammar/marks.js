/**
 * Mark primitives for the grammar layer. A primitive draws its mark and registers the box
 * it fills with canvas.obstacle(), so the text against marks gate (kit 0.4.0) covers every
 * chart built from it with no further wiring.
 */
import { esc, n2 } from "../canvas.js";
/**
 * The path of a bar from `base` to `end` along its length, `cross` to `cross + thickness`
 * across it: the data end rounded by `r`, the base end square. Empty for a zero length.
 */
export function barPath(orientation, base, end, cross, thickness, r, length = Math.abs(end - base)) {
    if (!(length > 0))
        return "";
    const x = cross, w = thickness, y = cross, h = thickness;
    if (orientation === "vertical") {
        return end < base
            ? `M${n2(x)},${n2(base)} V${n2(end + r)} Q${n2(x)},${n2(end)} ${n2(x + r)},${n2(end)} H${n2(x + w - r)} Q${n2(x + w)},${n2(end)} ${n2(x + w)},${n2(end + r)} V${n2(base)} Z`
            : `M${n2(x)},${n2(base)} V${n2(end - r)} Q${n2(x)},${n2(end)} ${n2(x + r)},${n2(end)} H${n2(x + w - r)} Q${n2(x + w)},${n2(end)} ${n2(x + w)},${n2(end - r)} V${n2(base)} Z`;
    }
    return end > base
        ? `M${n2(base)},${n2(y)} H${n2(end - r)} Q${n2(end)},${n2(y)} ${n2(end)},${n2(y + r)} V${n2(y + h - r)} Q${n2(end)},${n2(y + h)} ${n2(end - r)},${n2(y + h)} H${n2(base)} Z`
        : `M${n2(base)},${n2(y)} H${n2(end + r)} Q${n2(end)},${n2(y)} ${n2(end)},${n2(y + r)} V${n2(y + h - r)} Q${n2(end)},${n2(y + h)} ${n2(end + r)},${n2(y + h)} H${n2(base)} Z`;
}
/**
 * Opens a bar's group, draws its path and registers the box it fills. The caller draws
 * any labels that belong to the bar and then closes the group with `</g>`.
 */
export function openBar(canvas, s) {
    const d = barPath(s.orientation, s.base, s.end, s.cross, s.thickness, s.r, s.length);
    canvas.add(`<g class="ek-bar"><title>${esc(s.title)}</title><path d="${d}" ${canvas.paint({ fill: s.fill })}${s.attrs ? " " + s.attrs : ""}/>`);
    const len = s.length, lo = Math.min(s.base, s.end);
    const box = s.orientation === "vertical"
        ? { x: s.cross, y: lo, w: s.thickness, h: len }
        : { x: lo, y: s.cross, w: len, h: s.thickness };
    canvas.obstacle(s.what, box);
    return box;
}
/**
 * Registers a stroked polyline as the boxes of its segments, each grown by half the
 * stroke, so text that crosses the line is refused while text beside it is not.
 */
export function polylineObstacles(canvas, what, points, strokeWidth) {
    const pad = strokeWidth / 2;
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1], b = points[i];
        canvas.obstacle(`${what}, segment ${i}`, {
            x: Math.min(a.x, b.x) - pad,
            y: Math.min(a.y, b.y) - pad,
            w: Math.abs(b.x - a.x) + pad * 2,
            h: Math.abs(b.y - a.y) + pad * 2
        });
    }
}
