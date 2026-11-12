/**
 * Axis primitives. The zero line is the one a bar chart may not move: drawn across the
 * plot at the scale's zero, marked with data-ek-baseline and data-ek-zero for the tests.
 */
import { n2 } from "../canvas.js";
export function zeroLine(canvas, orientation, zero, from, to) {
    const attrs = `data-ek-baseline="${n2(zero)}" data-ek-zero="${n2(zero)}"`;
    if (orientation === "vertical")
        canvas.line(from, zero, to, zero, "border-strong", 1.5, attrs);
    else
        canvas.line(zero, from, zero, to, "border-strong", 1.5, attrs);
}
