import { tokens } from "../../generated/tokens.js";
import { rampFor } from "./locatorMap.js";
export function defineMapIndicators(input) {
    if (!Object.keys(input).length)
        throw new Error("a map registry needs an indicator");
    const registry = Object.create(null);
    for (const [id, ind] of Object.entries(input)) {
        if (!id.trim() || !ind.label?.trim())
            throw new Error("an indicator needs an id and label");
        if (ind.kind === "fixed") {
            if (!["gbp", "pence", "rate", "percent", "index"].includes(ind.unit))
                throw new Error("a map shades rates, never counts");
            if (ind.breaks.length < 3 || ind.breaks.length > 6 || ind.breaks.some((b, i) => !Number.isFinite(b) || (i > 0 && b <= ind.breaks[i - 1])))
                throw new Error("fixed breaks must be finite and strictly rising, three to six of them, giving four to seven classes");
            registry[id] = Object.freeze({ ...ind, breaks: Object.freeze([...ind.breaks]) });
        }
        else if (ind.kind === "categorical") {
            if (ind.categories.length < 1 || ind.categories.length > 7 || ind.categories.some(c => !c.id?.trim() || !c.label?.trim()) || new Set(ind.categories.map(c => c.id)).size !== ind.categories.length)
                throw new Error("categorical maps need one to seven unique named classes");
            registry[id] = Object.freeze({ ...ind, categories: Object.freeze(ind.categories.map(c => Object.freeze({ ...c }))) });
        }
        else
            throw new Error("unknown indicator kind");
    }
    return Object.freeze(registry);
}
/** Null is a class of its own, never the first class. */
export function mapClass(ind, value) {
    if (value === null)
        return null;
    if (ind.kind === "fixed") {
        if (typeof value !== "number" || !Number.isFinite(value))
            throw new Error("a fixed indicator needs a finite value or null");
        return ind.breaks.filter(b => value >= b).length;
    }
    const index = ind.categories.findIndex(c => c.id === value);
    if (index < 0)
        throw new Error(`category ${value} is not in the fixed registry`);
    return index;
}
/**
 * Fixed classes are ordered, so they take the sequential ramp (one hue, steadily lighter, as
 * LocatorMap and the UK Demographics maps draw them) and an unknown takes the ramp's no figure
 * colour. Categorical classes are unordered, so they take the four gated series, repeated
 * only with a different pattern for further classes.
 */
export function colourFor(ind, value) {
    const i = mapClass(ind, value);
    if (ind.kind === "fixed")
        return i === null ? tokens.ramp.na : rampFor(ind.breaks.length + 1)[i];
    return i === null ? "text-muted" : `series-${i % 4 + 1}`;
}
