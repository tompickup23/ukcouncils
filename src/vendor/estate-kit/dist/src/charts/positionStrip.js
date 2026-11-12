/**
 * PositionStrip: where one place's value sits within its class, on a track from the
 * class's lowest published value to its highest, with the median and the 90th percentile
 * marked. Moved into the kit from ukdemographics src/components/BenchmarkStrip.astro
 * (733eb02), with the changes UK Council Tax A5 section 6.1 lists:
 *
 * 1. tokens, not its three hard coded tones, which failed the contrast gate on white;
 * 2. figures by key: the value is one figure, the distribution is a series figure of the
 *    class's published values, and the kit computes the lowest, median, 90th percentile and
 *    highest from it, printing the method and the count of the class inside the drawing;
 * 3. no silent clamp: a value outside the class's range throws, as does a place whose own
 *    point in the class does not match the value, or figures from different editions or in
 *    different units, so only compatible figures are compared;
 * 4. the basis stated in the drawing and the source line inside it, and a table twin;
 * 5. scale labels in the house voice ("lowest", "median", "90th percentile", "highest"),
 *    which label the scale, not an area, so the alt text may use them past the ranking gate;
 * 6. the 460 by 92 viewBox redrawn on the kit's 600 unit inline template and the cards.
 *
 * Percentiles use linear interpolation between closest ranks (Hyndman and Fan type 7, as
 * Excel PERCENTILE.INC and numpy's default), so the median of an even count is the mean of
 * the middle two.
 */
import { checkNames } from "../qa/names.js";
import { esc, n2, textWidth } from "./canvas.js";
import { annotate, linear, stackRows } from "./grammar/index.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, formatValue, showPoint } from "../figures/figures.js";
/** The fewest members a class may have: a 90th percentile of fewer values says little. */
export const MIN_CLASS = 10;
/** The scale labels, which the ranking gate lets the alt text use. */
export const SCALE_LABELS = { min: "lowest", median: "median", p90: "90th percentile", max: "highest" };
/** Linear interpolation between closest ranks (type 7) on sorted values. */
export function percentile(sorted, p) {
    if (!sorted.length)
        throw new Error("percentile of nothing");
    const h = (sorted.length - 1) * p;
    const lo = Math.floor(h), hi = Math.ceil(h);
    return sorted[lo] + (h - lo) * (sorted[hi] - sorted[lo]);
}
/** The five numbers of a class, from its published values. */
export function stripStats(values) {
    const s = [...values].sort((a, b) => a - b);
    return { n: s.length, min: s[0], median: percentile(s, 0.5), p90: percentile(s, 0.9), max: s[s.length - 1] };
}
export function positionStrip(o) {
    const set = currentFigures(o.set);
    const v = set.value(o.figure);
    const d = set.series(o.distribution);
    if (!o.classLabel?.trim())
        throw new Error(`${o.distribution}: name the class (classLabel), for the method line`);
    if (!o.basis?.trim())
        throw new Error(`${o.figure}: state the basis the values share (basis)`);
    if (v.unit !== d.unit)
        throw new Error(`${o.figure}: the value is in ${v.unit} and the class in ${d.unit}; compare only one unit`);
    if (v.source.edition !== d.source.edition)
        throw new Error(`${o.figure}: the value is from ${v.source.edition} and the class from ${d.source.edition}; compare only one edition`);
    if (d.points.length < MIN_CLASS)
        throw new Error(`${o.distribution}: a class needs at least ${MIN_CLASS} published values for a 90th percentile; ${d.points.length} given`);
    const labels = new Set(d.points.map((p) => p.label));
    if (labels.size !== d.points.length)
        throw new Error(`${o.distribution}: each member of the class appears once`);
    const st = stripStats(d.points.map((p) => p.value));
    if (v.value < st.min || v.value > st.max) {
        throw new Error(`${o.figure}: ${set.show(o.figure)} lies outside the class (lowest ${formatValue(st.min, d.unit, d.dp)}, highest ${formatValue(st.max, d.unit, d.dp)}); a strip does not clamp`);
    }
    if (o.place !== undefined) {
        const own = d.points.find((p) => p.label === o.place);
        if (!own)
            throw new Error(`${o.distribution}: "${o.place}" is not a member of the class`);
        if (own.value !== v.value)
            throw new Error(`${o.figure}: the value ${set.show(o.figure)} differs from ${o.place}'s point in the class, ${showPoint(d, own)}`);
    }
    if (st.max === st.min)
        throw new Error(`${o.distribution}: every member has the same value; there is no range to place it on`);
    const minP = d.points.find((p) => p.value === st.min), maxP = d.points.find((p) => p.value === st.max);
    const shown = {
        value: set.show(o.figure),
        min: showPoint(d, minP),
        median: formatValue(st.median, d.unit, d.dp),
        p90: formatValue(st.p90, d.unit, d.dp),
        max: showPoint(d, maxP)
    };
    if (o.requireNames)
        checkNames(set, [o.figure], "PositionStrip");
    const placeName = v.name ?? o.place ?? v.label;
    const method = `Median and 90th percentile calculated from the published values of the ${st.n} ${o.classLabel}, by linear interpolation.`;
    const basis = `Basis: ${o.basis.trim().replace(/\.$/, "")}.`;
    const keys = [o.figure, o.distribution];
    const caption = set.caption(keys);
    const fr = frame({ ...o, set }, caption, 0, "positionStrip", keys.map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    const P = fr.plot;
    canvas.allow(...Object.values(shown));
    canvas.scaleLabels(...Object.values(SCALE_LABELS));
    const xOf = linear(st.min, st.max, P.x, P.w).at;
    const clampX = (left, w) => Math.min(Math.max(left, P.x), P.x + P.w - w);
    // The place: its name and value above the dot, as one annotation clamped to the plot.
    const dotX = xOf(v.value);
    const top = tpl.thumb ? P.y + P.h / 2 - font.value * 1.35 - (Math.max(10, font.label * 0.55) * 1.8) : P.y;
    annotate(canvas, {
        pieces: [
            { text: placeName, size: font.label, fill: "text" },
            { text: shown.value, size: font.value, weight: 600, fill: "text", tabular: true, role: "value" }
        ],
        gap: font.label * 0.4, x: dotX, y: top + font.value, within: { min: P.x, max: P.x + P.w }, bg
    });
    // The track, the band from lowest to the 90th percentile, the ticks and the dot.
    const trackH = Math.max(10, font.label * 0.55);
    const tick = trackH * 1.8;
    const trackY = top + font.value + font.value * 0.35 + tick;
    const r = trackH * 0.95;
    canvas.mark("strip dot", "accent", [bg, "bg-subtle"]);
    canvas.mark("strip 90th percentile tick", "accent", [bg, "bg-subtle"]);
    canvas.mark("strip median tick", "text-muted", [bg, "bg-subtle"]);
    canvas.add(`<g class="ek-strip" data-ek-n="${st.n}">`);
    canvas.add(`<rect x="${n2(P.x)}" y="${n2(trackY - trackH / 2)}" width="${n2(P.w)}" height="${n2(trackH)}" rx="${n2(trackH / 2)}" ${canvas.paint({ fill: "bg-subtle", stroke: "border" })} data-ek-track="" data-ek-min="${n2(P.x)}" data-ek-max="${n2(P.x + P.w)}"/>`);
    canvas.add(`<rect x="${n2(P.x)}" y="${n2(trackY - trackH / 2)}" width="${n2(xOf(st.p90) - P.x)}" height="${n2(trackH)}" rx="${n2(trackH / 2)}" ${canvas.paint({ fill: "accent-wash", stroke: "border" })} data-ek-band=""/>`);
    for (const [k, colour] of [["median", "text-muted"], ["p90", "accent"]]) {
        const x = xOf(st[k]);
        canvas.add(`<line x1="${n2(x)}" y1="${n2(trackY - tick)}" x2="${n2(x)}" y2="${n2(trackY + tick)}" ${canvas.paint({ stroke: colour })} stroke-width="2.5" stroke-dasharray="5 4" data-ek-stat="${k}" data-value="${st[k]}" data-x="${n2(x)}"/>`);
    }
    const focus = esc(o.place ?? o.figure);
    canvas.add(`<g class="ek-strip-place"><title>${esc(`${placeName}: ${shown.value}`)}</title><circle cx="${n2(dotX)}" cy="${n2(trackY)}" r="${n2(r)}" ${canvas.paint({ fill: "accent", stroke: bg })} stroke-width="3" data-ek-pos="${n2(dotX)}" data-value="${v.value}" data-ek-focus="${focus}"/></g>`);
    canvas.add(`</g>`);
    // The marks register their boxes, so no label may sit on the track, a tick or the dot.
    canvas.obstacle("the strip track", { x: P.x, y: trackY - trackH / 2, w: P.w, h: trackH });
    for (const k of ["median", "p90"])
        canvas.obstacle(`the ${k} tick`, { x: xOf(st[k]) - 1.25, y: trackY - tick, w: 2.5, h: tick * 2 });
    canvas.obstacle(`the dot for ${placeName}`, { x: dotX - r - 1.5, y: trackY - r - 1.5, w: (r + 1.5) * 2, h: (r + 1.5) * 2 });
    if (tpl.thumb) {
        fr.close(P.y + P.h);
        return { svg: canvas.finish(`PositionStrip ${o.figure} thumb`, ""), table: "", alt: "", caption, width: canvas.W, height: canvas.H };
    }
    // The scale: four blocks of label and value, each on the first row where it touches no
    // other, so close ticks stack instead of colliding.
    const lh = font.axis * 1.25;
    const blocks = ["min", "median", "p90", "max"].map((k) => {
        const label = SCALE_LABELS[k];
        const w = Math.max(textWidth(label, font.axis), textWidth(shown[k], font.axis, "sans", 600));
        const anchorX = k === "min" ? P.x : k === "max" ? P.x + P.w : xOf(st[k]);
        const l = k === "min" ? P.x : k === "max" ? P.x + P.w - w : clampX(anchorX - w / 2, w);
        return { k, label, w, l, row: 0 };
    });
    const placed = stackRows(blocks, font.axis * 0.6);
    const scaleTop = trackY + tick + font.axis * 0.6;
    for (const b of placed) {
        const y = scaleTop + b.row * (lh * 2 + font.axis * 0.4);
        const anchor = b.k === "min" ? "start" : b.k === "max" ? "end" : "middle";
        const x = anchor === "start" ? b.l : anchor === "end" ? b.l + b.w : b.l + b.w / 2;
        canvas.text(x, y + font.axis, b.label, { size: font.axis, fill: "text-muted", bg, anchor, role: "scale", group: `scale-${b.k}` });
        canvas.text(x, y + font.axis + lh, shown[b.k], { size: font.axis, weight: 600, fill: "text", bg, anchor, tabular: true, role: "value", group: `scale-${b.k}` });
    }
    const rows = Math.max(...placed.map((b) => b.row)) + 1;
    let y = scaleTop + rows * (lh * 2 + font.axis * 0.4) + font.axis * 0.4;
    y = canvas.para(P.x, y, method, P.w, { size: font.axis, fill: "text-muted", bg });
    y = canvas.para(P.x, y + 4, basis, P.w, { size: font.axis, fill: "text-muted", bg });
    if (tpl.H && y > P.y + P.h + 1)
        throw new Error(`${o.figure}/${tpl.key}: the strip runs past its space`);
    fr.close(y);
    const alt = o.alt ?? `A strip placing ${placeName} at ${shown.value} among ${st.n} ${o.classLabel}, from the ${SCALE_LABELS.min}, ${shown.min}, to the ${SCALE_LABELS.max}, ${shown.max}; the ${SCALE_LABELS.median} is ${shown.median} and the ${SCALE_LABELS.p90} ${shown.p90}.${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`PositionStrip ${o.figure} ${tpl.key}`, alt);
    const how = `Calculated from the ${st.n} published values`;
    const table = tableTwin({
        caption: fr.title ?? `${v.label}, within the ${st.n} ${o.classLabel}`,
        head: ["", d.name ?? d.label, "How"],
        rows: [
            [placeName, shown.value, "Published"],
            [`Lowest of the ${st.n}`, shown.min, "Published"],
            ["Median", shown.median, how],
            ["90th percentile", shown.p90, how],
            [`Highest of the ${st.n}`, shown.max, "Published"]
        ],
        source: `${method} ${basis} ${caption}`,
        numeric: false
    });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
