/**
 * The figure record. Generalised from the Burnley council tax film (Reports
 * Burnley_CTax_Video_work/remotion/src/lib/figures.ts): a figure is recorded once, with
 * its value, unit, display forms and its full source, and every renderer takes it by key.
 * Nothing in the kit accepts a typed number.
 *
 * The source caption string is built here and only here, so the site, the brief, the card
 * and the film print the same words.
 */
export const UNITS = ["gbp", "pence", "percent", "count", "rate", "index"];
const FIXTURE_PREFIX = "Fixture, not a published figure.";
/** True for a string with something in it once trimmed, so "   " counts as missing. */
function filled(v) {
    return typeof v === "string" && v.trim() !== "";
}
/** An ISO 8601 date, optionally with a time: "2026-01-01". "May 2025" is refused, as in Python. */
function isoDate(v) {
    return /^\d{4}-\d{2}-\d{2}/.test(v) && !Number.isNaN(Date.parse(v.slice(0, 10)));
}
/** Problems with one record, as plain sentences. Empty when the record is sound. */
export function validateFigure(key, f) {
    const errs = [];
    const r = f;
    if (!r || typeof r !== "object")
        return [`${key}: not an object`];
    if (r.kind !== "value" && r.kind !== "series")
        errs.push(`${key}: kind must be "value" or "series"`);
    if (!filled(r.label))
        errs.push(`${key}: label is required (what the figure is a count of)`);
    if (!r.unit || !UNITS.includes(r.unit))
        errs.push(`${key}: unit must be one of ${UNITS.join(", ")}`);
    const s = r.source;
    if (!s)
        errs.push(`${key}: source is required`);
    else {
        for (const field of ["publisher", "title", "edition"]) {
            if (!filled(s[field]))
                errs.push(`${key}: source.${field} is required`);
        }
        if (!filled(s.table) && !filled(s.page))
            errs.push(`${key}: source.table or source.page is required`);
        for (const field of ["table", "page", "url", "accessed"]) {
            if (s[field] !== undefined && !filled(s[field]))
                errs.push(`${key}: source.${field} is blank; leave it out or fill it`);
        }
    }
    if (r.kind === "value" && (typeof r.value !== "number" || !Number.isFinite(r.value))) {
        errs.push(`${key}: value must be a finite number`);
    }
    if (r.kind === "series") {
        if (r.axis !== "category" && r.axis !== "time")
            errs.push(`${key}: axis must be "category" or "time"`);
        if (!Array.isArray(r.points) || r.points.length === 0)
            errs.push(`${key}: points must be a non empty list`);
        else
            r.points.forEach((p, i) => {
                if (!p || typeof p.label !== "string")
                    errs.push(`${key}: point ${i} needs a label`);
                if (!p || typeof p.value !== "number" || !Number.isFinite(p.value))
                    errs.push(`${key}: point ${i} needs a finite value`);
                if (r.axis === "time" && p && typeof p.label === "string" && !isoDate(p.label))
                    errs.push(`${key}: point ${i} label is not an ISO date`);
            });
    }
    return errs;
}
/** The locator part of a caption: the table, then the page. */
function locator(s) {
    return [s.table, s.page].filter(Boolean).join(", ");
}
/** One source as caption text, without the "Source:" lead. */
export function sourceText(s) {
    return [s.publisher, s.title, locator(s), s.edition].filter(Boolean).join(", ");
}
/**
 * The caption for one or more figures. Figures that share a source collapse into one
 * entry, so a chart of ten bars from one table prints one source.
 */
export function captionFor(figs) {
    if (figs.length === 0)
        throw new Error("captionFor needs at least one figure");
    const texts = [...new Set(figs.map((f) => sourceText(f.source)))];
    const lead = texts.length === 1 ? "Source: " : "Sources: ";
    const body = lead + texts.join("; ") + ".";
    return figs.some((f) => f.fixture) ? `${FIXTURE_PREFIX} ${body}` : body;
}
const escHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
/**
 * The caption as HTML, with each document title linked to its url. Its text content is
 * exactly captionFor(), which the tests check.
 */
export function captionHtml(figs) {
    const seen = new Map();
    for (const f of figs)
        seen.set(sourceText(f.source), f.source);
    const parts = [...seen.values()].map((s) => {
        const title = s.url ? `<a href="${escHtml(s.url)}">${escHtml(s.title)}</a>` : escHtml(s.title);
        return [escHtml(s.publisher), title, escHtml(locator(s)), escHtml(s.edition)].filter(Boolean).join(", ");
    });
    const body = (parts.length === 1 ? "Source: " : "Sources: ") + parts.join("; ") + ".";
    return figs.some((f) => f.fixture) ? `${FIXTURE_PREFIX} ${body}` : body;
}
const nf = (dp) => new Intl.NumberFormat("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
/** Formats a number in a figure's unit. Arithmetic on the recorded value, never a new figure. */
export function formatValue(value, unit, dp, form = "full") {
    const places = form === "round" ? 0 : dp ?? (unit === "gbp" && !Number.isInteger(value) ? 2 : 0);
    if (form === "short" && (unit === "gbp" || unit === "count") && Math.abs(value) >= 1e3) {
        const [div, suffix] = Math.abs(value) >= 1e9 ? [1e9, "bn"] : Math.abs(value) >= 1e6 ? [1e6, "m"] : [1e3, "k"];
        const n = nf(1).format(value / div).replace(/\.0$/, "");
        return unit === "gbp" ? `£${n}${suffix}` : `${n}${suffix}`;
    }
    const n = nf(places).format(value);
    switch (unit) {
        case "gbp": return value < 0 ? `minus £${n.replace("-", "")}` : `£${n}`;
        case "pence": return `${n}p`;
        case "percent": return `${n}%`;
        default: return n;
    }
}
/** Validates every record and returns the set. Any problem throws, naming every key at fault. */
export function defineFigures(data) {
    const problems = Object.entries(data).filter(([k]) => !k.startsWith("$")).flatMap(([k, v]) => validateFigure(k, v));
    if (problems.length)
        throw new Error(`figure set invalid:\n  ${problems.join("\n  ")}`);
    const records = Object.fromEntries(Object.entries(data).filter(([k]) => !k.startsWith("$")));
    const get = (key) => {
        const f = records[key];
        if (!f)
            throw new Error(`figure set has no key "${key}"`);
        return f;
    };
    const value = (key) => {
        const f = get(key);
        if (f.kind !== "value")
            throw new Error(`figure "${key}" is a series, not a single value`);
        return f;
    };
    const series = (key) => {
        const f = get(key);
        if (f.kind !== "series")
            throw new Error(`figure "${key}" is a single value, not a series`);
        return f;
    };
    return {
        keys: () => Object.keys(records),
        get,
        value,
        series,
        show: (key, form = "full") => {
            const f = value(key);
            return f.display?.[form] ?? formatValue(f.value, f.unit, f.dp, form);
        },
        caption: (keys) => captionFor((Array.isArray(keys) ? keys : [keys]).map(get)),
        captionHtml: (keys) => captionHtml((Array.isArray(keys) ? keys : [keys]).map(get))
    };
}
/** A point's display form, recorded or generated. */
export function showPoint(f, p, form = "full") {
    return p.display?.[form] ?? formatValue(p.value, f.unit, f.dp, form);
}
let registered = null;
/** Registers the default set, so a site loads its figures once and components need only a key. */
export function useFigures(set) {
    registered = set;
    return set;
}
export function currentFigures(explicit) {
    const set = explicit ?? registered;
    if (!set)
        throw new Error("no figure set: pass figures={...} or call useFigures() first");
    return set;
}
