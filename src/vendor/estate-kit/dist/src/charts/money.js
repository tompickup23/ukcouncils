/**
 * The to the penny reconciliation BillAnatomy has always made, shared so a money Waffle
 * makes the same one: the parts must add up to the published total, a figure of its own
 * from the document, never the sum the kit computes. A missing precept or a mistyped part
 * cannot reach a page.
 */
import { formatValue } from "../figures/figures.js";
/** A money value in whole pence (hundredths of the unit), so sums compare exactly. */
export const pence = (v) => Math.round(v * 100);
/** Throws unless every part and the total are money in one unit and the parts add up to the total to the penny. */
export function reconcile(parts, total, what) {
    const [totalKey, t] = total;
    for (const [k, f] of [...parts, total]) {
        if (f.unit !== t.unit || (f.unit !== "gbp" && f.unit !== "pence"))
            throw new Error(`${k}: every part and the total must be money in one unit`);
        if (f.value < 0)
            throw new Error(`${k}: ${what} cannot be negative`);
    }
    const sum = parts.reduce((s, [, f]) => s + pence(f.value), 0);
    if (sum !== pence(t.value)) {
        throw new Error(`${totalKey}: the parts add up to ${formatValue(sum / 100, t.unit, 2)} but the published total is ${formatValue(t.value, t.unit, 2)}; a part is missing or wrong`);
    }
}
