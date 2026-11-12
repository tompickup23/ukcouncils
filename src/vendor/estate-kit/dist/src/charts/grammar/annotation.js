/**
 * The annotation primitive: a run of text pieces on one baseline (a name, then its value),
 * clamped to a span, with an optional leader line to the thing it names. Each piece goes
 * through canvas.text(), so the contrast, manifest and overlap gates see it like any other
 * text; a leader is drawn first, so it never covers its own words.
 */
import { textWidth } from "../canvas.js";
/** The width of each piece and of the whole run. */
export function measure(a) {
    const widths = a.pieces.map((p) => textWidth(p.text, p.size, p.family ?? "sans", p.weight ?? 400));
    // Summed left to right, a gap before each piece after the first, so the arithmetic is
    // the same as a chart that adds name, gap and value in that order.
    let total = 0;
    widths.forEach((w, i) => { total = i ? total + a.gap + w : w; });
    return { widths, total };
}
/** Draws the run and returns where it starts and how wide it is. */
export function annotate(canvas, a) {
    const { widths, total } = measure(a);
    const left = Math.min(Math.max(a.x - total / 2, a.within.min), a.within.max - total);
    if (a.leader)
        canvas.line(a.leader.x, a.leader.y, Math.min(Math.max(a.leader.x, left), left + total), a.y, a.leader.stroke, a.leader.width ?? 1);
    let x = left;
    a.pieces.forEach((p, i) => {
        canvas.text(x, a.y, p.text, { size: p.size, weight: p.weight, family: p.family, fill: p.fill, bg: a.bg, role: p.role, tabular: p.tabular });
        x = x + widths[i] + a.gap;
    });
    return { left, width: total };
}
