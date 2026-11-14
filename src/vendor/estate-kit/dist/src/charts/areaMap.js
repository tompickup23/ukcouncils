/** Whole extent map from the UK Elections choropleth, using LocatorMap's layout.
 * Native links replace the donor's scripted navigation. No boundaries are shipped.
 */
import { geoMercator, geoPath } from "d3-geo";
import { tokens } from "../../generated/tokens.js";
import { DASHES } from "../qa/gates.js";
import { captionFor, currentFigures, defineFigures, formatValue } from "../figures/figures.js";
import { frame } from "./frame.js";
import { esc, n2, textWidth } from "./canvas.js";
import { pole, rewind } from "./grammar/geo.js";
import { placePlates } from "./grammar/plates.js";
import { defineMapIndicators, mapClass, colourFor } from "./mapIndicators.js";
import { tableTwin } from "./table.js";
import { rampFor } from "./locatorMap.js";
const R = tokens.ramp;
const PATTERNS = ["horizontal lines", "vertical lines", "rising lines", "falling lines", "dots", "rings", "grid", "crosses"];
const strokes = ["M0 4H8", "M4 0V8", "M-2 2L2 -2M0 8L8 0M6 10L10 6", "M-2 6L2 10M0 0L8 8M6 -2L10 2", "", "", "M0 4H8M4 0V8", "M2 2L6 6M6 2L2 6"];
function href(value) {
    if (typeof value !== "string" || /[\s\\\u0000-\u001f]/.test(value) || !(/^(\/(?!\/)|#[A-Za-z]|https?:\/\/)/.test(value)))
        throw new Error("every area needs a safe link: a site path, fragment or HTTP URL");
    return esc(value);
}
export function areaMap(o) {
    if (o.template && o.template !== "inline")
        throw new Error("AreaMap draws the inline template only");
    for (const key of ["title", "description", "boundaryCredit", "notDrawn"])
        if (!o[key]?.trim())
            throw new Error(`AreaMap needs ${key}`);
    if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(o.id ?? ""))
        throw new Error("AreaMap needs a unique id using letters, digits and underscores or hyphens");
    if (!o.areas?.length)
        throw new Error("AreaMap needs geometry");
    const registry = defineMapIndicators(o.registry);
    const ind = registry[o.indicator];
    if (!ind || ind.kind !== o.modeData)
        throw new Error("select a registry indicator matching modeData");
    const codes = o.areas.map(a => a.properties.code);
    if (new Set(codes).size !== codes.length || codes.some(c => !c?.trim()))
        throw new Error("each area needs a unique code");
    const inputs = o.modeData === "fixed" ? o.values : o.categories;
    for (const code of Object.keys(inputs))
        if (!codes.includes(code))
            throw new Error(`${code}: value has no input geometry`);
    const set = o.modeData === "categorical" ? o.set ?? defineFigures({}) : currentFigures(o.set);
    const keys = o.modeData === "fixed" ? codes.map(code => {
        if (!o.values[code])
            throw new Error(`${code}: supply a figure record, including for an unknown value`);
        return o.values[code];
    }) : [];
    const figures = keys.map(k => set.valueRecord(k));
    if (ind.kind === "fixed" && figures.some(f => f.unit !== ind.unit || f.source.edition !== figures[0].source.edition))
        throw new Error("one map must share its indicator unit and edition");
    const sources = o.modeData === "fixed" ? figures : [{ source: o.source, fixture: o.fixture }];
    for (const { source } of sources)
        for (const field of ["publisher", "title", "table", "edition"])
            if (!source?.[field]?.trim())
                throw new Error(`AreaMap source needs ${field}`);
    const caption = `${captionFor(sources)} ${o.boundaryCredit} Not drawn: ${o.notDrawn}`;
    const fr = frame({ ...o, set }, caption, 0, undefined, sources);
    const { canvas, tpl, plot: P, bg } = fr;
    const fs = tpl.font.label;
    let y = canvas.para(P.x, P.y, o.description, P.w, { size: tpl.font.axis, fill: "text-muted", bg }) + 14;
    const panel = { x: P.x, y, w: P.w, h: P.w * 0.9 };
    const areas = o.areas.map(rewind);
    // Fit all supplied geometry, never crop to a focus area or silently omit an island.
    const projection = geoMercator().fitExtent([[panel.x + 12, panel.y + 12], [panel.x + panel.w - 12, panel.y + panel.h - 12]], { type: "FeatureCollection", features: areas });
    const path = geoPath(projection);
    const labels = ind.kind === "categorical" ? ind.categories.map(c => c.label) : Array.from({ length: ind.breaks.length + 1 }, (_, i) => {
        const show = (v) => {
            const [mantissa, exponent = "0"] = String(v).split("e");
            const dp = Math.max(0, (mantissa.split(".")[1]?.length ?? 0) - Number(exponent));
            if (dp > 20)
                throw new Error("a map break needs more precision than its key can print");
            return formatValue(v, ind.unit, dp);
        };
        return i === 0 ? `Under ${show(ind.breaks[0])}` : i === ind.breaks.length ? `${show(ind.breaks[i - 1])} and over` : `${show(ind.breaks[i - 1])} to under ${show(ind.breaks[i])}`;
    });
    const rows = areas.map((a, i) => {
        const code = a.properties.code;
        if (!a.properties.name?.trim())
            throw new Error(`${code}: area needs a name`);
        if (o.modeData === "categorical" && !Object.hasOwn(o.categories, code))
            throw new Error(`${code}: supply a category or null`);
        const value = o.modeData === "fixed" ? figures[i].value : o.categories[code];
        const cls = mapClass(ind, value);
        const shown = o.modeData === "fixed" ? set.show(keys[i]) : cls === null ? "Unknown" : labels[cls];
        const link = href(o.links[code]);
        const d = path(a);
        if (!d || /NaN|Infinity/.test(d) || !(path.area(a) > 0))
            throw new Error(`${code}: geometry cannot be drawn`);
        return { a, code, cls, shown, link, d, colour: colourFor(ind, value) };
    });
    canvas.allow(...rows.map(r => r.shown));
    const fixed = ind.kind === "fixed";
    const patternId = (i) => `${o.id}-pattern-${i}`;
    // Fixed classes are ordered: the sequential ramp on the estate ground, as LocatorMap and the
    // UK Demographics maps draw them, where lightness carries the order without a hatch, and an
    // unknown is the ramp's striped no figure fill. Categorical classes are unordered: the four
    // gated series, each with its own pattern so no class rests on colour alone.
    const ramp = fixed ? rampFor(labels.length) : [];
    const fillFor = (cls) => cls === null ? `url(#${patternId(7)})` : fixed ? ramp[cls] : `url(#${patternId(cls)})`;
    const ground = fixed ? R.ground : bg;
    canvas.add("<defs>");
    if (fixed) {
        canvas.mark("map plates", R.ink, [R.ground]);
        canvas.add(`<pattern id="${patternId(7)}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${R.na}"/><rect width="2.5" height="8" fill="${R.naStripe}"/></pattern>`);
    }
    else {
        const colourTokens = [...new Set(labels.map((_, i) => `series-${i % 4 + 1}`))];
        canvas.series("map classes", colourTokens);
        for (const c of [...colourTokens, "text-muted"])
            canvas.mark(`map fill and pattern ${c}`, c, [bg]);
        for (const i of [...labels.map((_, i) => i), 7]) {
            const fill = i === 7 ? "text-muted" : `series-${i % 4 + 1}`;
            canvas.add(`<pattern id="${patternId(i)}" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" ${canvas.paint({ fill })}/>`);
            if (i === 4)
                canvas.add(`<circle cx="4" cy="4" r="1.5" ${canvas.paint({ fill: bg })}/>`);
            else if (i === 5)
                canvas.add(`<circle cx="4" cy="4" r="2.5" fill="none" ${canvas.paint({ stroke: bg })} stroke-width="1.2"/>`);
            else
                canvas.add(`<path d="${strokes[i]}" ${canvas.paint({ stroke: bg })} stroke-width="1.3" fill="none"/>`);
            canvas.add("</pattern>");
        }
    }
    canvas.add("</defs>");
    canvas.add(`<title>${esc(fr.title)}</title><desc>${esc(o.description)} Not drawn: ${esc(o.notDrawn)}</desc>`);
    if (fixed)
        canvas.rect(panel.x, panel.y, panel.w, panel.h, R.ground, `rx="${tokens.radius["radius-sm"].replace("px", "")}"`);
    const stroke = fixed ? `stroke="${R.ground}"` : canvas.paint({ stroke: bg });
    for (const r of rows) {
        const name = `${r.a.properties.name}: ${r.shown}${r.cls === null ? "" : `; ${labels[r.cls]}`}`;
        canvas.add(`<a href="${r.link}" role="link" aria-label="${esc(name)}" class="ek-area-link"><path d="${r.d}" fill="${fillFor(r.cls)}" ${stroke} stroke-width="1.5" stroke-linejoin="round" data-ek-area="${esc(r.code)}" data-ek-class="${r.cls ?? "unknown"}"><title>${esc(name)}</title></path></a>`);
    }
    // Grounded plates deliberately overlay geography, as in LocatorMap. Only key swatches
    // are obstacles: treating area bounding boxes as obstacles would forbid every plate.
    const candidates = rows.map(r => {
        const p = pole(r.a, projection, panel);
        const name = r.a.properties.name;
        const w = Math.max(textWidth(name, fs, "sans", 600), textWidth(r.shown, tpl.font.value)) + 16;
        const h = fs + tpl.font.value + 24;
        return { item: r, w, h, anchor: p, r: p.r, eligible: p.r > Math.min(w, h) * 0.3, fits: (x, y) => p.inside(x + w / 2, y + h / 2) };
    });
    const layout = placePlates(candidates, { panel, gap: 6, inset: 6 });
    for (const p of layout.placed) {
        canvas.add(`<g pointer-events="none" aria-hidden="true" data-ek-plate="${esc(p.item.code)}">`);
        canvas.rect(p.x, p.y, p.w, p.h, ground, 'rx="3"');
        canvas.text(p.x + 8, p.y + fs + 4, p.item.a.properties.name, { size: fs, weight: 600, fill: fixed ? R.ink : "text", bg: ground });
        canvas.text(p.x + 8, p.y + fs + tpl.font.value + 12, p.item.shown, { size: tpl.font.value, fill: fixed ? R.ink : "text", bg: ground, role: "value" });
        canvas.add("</g>");
    }
    y += panel.h + 16;
    y = canvas.para(P.x, y, ind.label, P.w, { size: fs, weight: 600, fill: "text", bg }) + 8;
    const sw = 28;
    for (const [i, label] of [...labels, "Unknown"].entries()) {
        const pi = i === labels.length ? 7 : i;
        // Swatches carry a thin edge, so the darkest ramp class still shows as a square on a dark page.
        const edge = fixed ? ` ${canvas.paint({ stroke: "border-strong" })} stroke-width="1"` : "";
        canvas.add(`<rect x="${n2(P.x)}" y="${n2(y)}" width="${sw}" height="${sw}" fill="${fillFor(pi === 7 ? null : pi)}"${edge}/>`);
        canvas.obstacle(`key swatch ${label}`, { x: P.x, y, w: sw, h: sw });
        const named = fixed ? (pi === 7 ? `${label} (striped)` : label) : `${label} (${PATTERNS[pi]})`;
        const bottom = canvas.para(P.x + sw + 12, y, named, P.w - sw - 12, { size: fs, fill: "text", bg });
        y = Math.max(y + sw, bottom) + 8;
    }
    if (layout.unplaced.length)
        y = canvas.para(P.x, y + 4, "Some area labels do not fit on the map. Every area is named in its link and in the table below.", P.w, { size: tpl.font.axis, fill: "text-muted", bg });
    fr.close(y);
    canvas.assertTextBounds();
    if (fr.sourceOutput && o.sourceFormat)
        fr.sourceOutput.sourceHtml += ` ${esc(o.boundaryCredit)} Not drawn: ${esc(o.notDrawn)}`;
    const alt = o.alt ?? `${fr.title}. ${o.description} Not drawn: ${o.notDrawn} Every area links to its page; the table gives every area and class.`;
    if ([alt, caption, ...rows.flatMap(r => [r.a.properties.name, r.shown]), ...labels].some(s => DASHES.test(s)))
        throw new Error("dash in AreaMap text");
    const svg = canvas.finish("AreaMap", alt, 'data-ek-area-map=""', "group");
    const table = tableTwin({ caption: fr.title, head: ["Area", ind.label, ...(ind.kind === "fixed" ? ["Class"] : [])], rows: rows.map(r => [r.a.properties.name, r.shown, ...(ind.kind === "fixed" ? [r.cls === null ? "Unknown" : labels[r.cls]] : [])]), rowLinks: rows.map(r => o.links[r.code]), source: caption, numeric: false });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
