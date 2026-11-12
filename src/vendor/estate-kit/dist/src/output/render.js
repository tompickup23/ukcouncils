/**
 * The string export (K5 of the Council Intel kit upgrade plan, 11 November 2026): chart
 * requests in, strings out, for a caller that cannot import the kit's components, such as
 * the Council Intel pack generator, which is Python. Each request names a chart, carries
 * its figure records, its options, its site and its ground; each result is the inline SVG
 * string, the table twin and the alt text, with the caption and the size.
 *
 * Nothing is relaxed for the export. Every request is drawn by the chart itself, so it
 * passes every gate the chart runs (contrast, marks, colour vision, dashes, the manifest,
 * overlap, ranking and loaded words, a chart's own rules such as a bill that must add up);
 * its figures pass the figure record's validation; and the strings it returns are checked
 * once more for dashes and for an accessible name. A request that fails is named, with
 * every reason, and no result is returned for any request.
 */
import { defineFigures } from "../figures/figures.js";
import { DASHES } from "../qa/gates.js";
import { SITE_KEYS } from "../../generated/tokens.js";
import { zeroBar } from "../charts/zeroBar.js";
import { line } from "../charts/line.js";
import { waffle } from "../charts/waffle.js";
import { statTile, scoreCard } from "../charts/statTile.js";
import { billAnatomy } from "../charts/billAnatomy.js";
import { positionStrip } from "../charts/positionStrip.js";
import { hemicycle } from "../charts/hemicycle.js";
import { locatorMap } from "../charts/locatorMap.js";
/** The charts a request may name, by the name each is exported under. */
export const EXPORT_CHARTS = { zeroBar, line, waffle, statTile, scoreCard, billAnatomy, positionStrip, hemicycle, locatorMap };
/** Options a request sets on its own fields, not inside options. */
const RESERVED = ["set", "site", "ground", "mode", "template"];
/** Thrown with every failing request. The message names each request and each reason. */
export class ExportError extends Error {
    failures;
    constructor(failures) {
        super(failures.map((f) => `request "${f.id}" (${f.chart}) failed:\n${f.errors.map((e) => `  ${e.replace(/\n/g, "\n    ")}`).join("\n")}`).join("\n"));
        this.failures = failures;
    }
}
const textOf = (html) => html.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
/** The checks on the returned strings, after the chart's own gates. */
function stringErrors(out) {
    const errs = [];
    for (const [what, text] of [["alt text", out.alt], ["caption", out.caption], ["table twin", textOf(out.table)], ["drawing", textOf(out.svg)]]) {
        if (DASHES.test(text))
            errs.push(`dash in the ${what}: "${text.match(DASHES)[0]}"`);
    }
    if (!/^<svg [^>]*role="img"[^>]*aria-label="[^"]+"/.test(out.svg))
        errs.push("the SVG has no role and accessible name");
    if (!out.alt.trim())
        errs.push("no alt text");
    if (!out.table.includes("<table"))
        errs.push("no table twin");
    return errs;
}
function requestErrors(r) {
    const errs = [];
    if (!(r.chart in EXPORT_CHARTS))
        errs.push(`unknown chart "${r.chart}"; one of ${Object.keys(EXPORT_CHARTS).join(", ")}`);
    if (!SITE_KEYS.includes(r.site))
        errs.push(`unknown site "${r.site}"; one of ${SITE_KEYS.join(", ")}`);
    if (r.ground !== undefined && r.ground !== "paper" && r.ground !== "desk")
        errs.push(`ground is "paper" or "desk", not "${r.ground}"`);
    if (r.theme !== undefined && r.theme !== "light" && r.theme !== "dark")
        errs.push(`theme is "light", "dark" or absent for css mode, not "${r.theme}"`);
    for (const k of RESERVED)
        if (r.options && k in r.options)
            errs.push(`options.${k} is not allowed: ${k === "template" ? "the export draws inline only" : `set it as the request's own field`}`);
    return errs;
}
/** Draws one request. Throws with every reason it fails. */
export function renderRequest(r, shared = {}) {
    const errs = requestErrors(r);
    if (errs.length)
        throw new Error(errs.join("\n"));
    const set = defineFigures({ ...shared, ...(r.figures ?? {}) });
    const site = r.site, ground = (r.ground ?? "paper");
    const mode = r.theme ? { kind: "hex", theme: r.theme, site, ground } : { kind: "css", ground };
    const out = EXPORT_CHARTS[r.chart]({ ...(r.options ?? {}), set, site, ground, mode, template: "inline" });
    const after = stringErrors(out);
    if (after.length)
        throw new Error(after.join("\n"));
    return { id: r.id, chart: r.chart, site, ground, mode: r.theme ? r.theme : "css", svg: out.svg, table: out.table, alt: out.alt, caption: out.caption, ...(out.title ? { title: out.title } : {}), width: out.width, height: out.height };
}
/** Draws every request, in order. Throws an ExportError naming every request that fails. */
export function renderRequests(input) {
    if (!input || !Array.isArray(input.requests) || input.requests.length === 0)
        throw new ExportError([{ id: "(file)", chart: "", errors: ["the file holds no requests: give { \"requests\": [ ... ] }"] }]);
    const seen = new Set();
    const failures = [];
    const results = [];
    input.requests.forEach((r, i) => {
        const id = typeof r?.id === "string" && r.id.trim() ? r.id : `(request ${i + 1}, no id)`;
        const chart = typeof r?.chart === "string" ? r.chart : "";
        if (seen.has(id)) {
            failures.push({ id, chart, errors: ["the id is used by an earlier request"] });
            return;
        }
        seen.add(id);
        if (id !== r?.id) {
            failures.push({ id, chart, errors: ["every request needs an id"] });
            return;
        }
        try {
            results.push(renderRequest(r, input.figures ?? {}));
        }
        catch (e) {
            failures.push({ id, chart, errors: [e.message] });
        }
    });
    if (failures.length)
        throw new ExportError(failures);
    return { results };
}
