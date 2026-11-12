/**
 * BillAnatomy: one bill split into the bodies that charge it, as a single bar from zero
 * with a keyed row per part (name, charge, share of the bill). The idea is UK Council
 * Tax's local bill breakdown (ukcounciltax src/components/LocalBillTool.astro), where every
 * component reconciles to the published total, and the stacked bars of the Burnley film
 * (Burnley_CTax_Video_work/remotion/src/scenes/S7to11.tsx).
 *
 * The total is its own figure, taken from the published document, never the sum the kit
 * computes. The parts must add up to it to the penny or the chart refuses to build, so a
 * missing precept or a mistyped part cannot reach a page.
 *
 * Colour: up to four parts take the series in order; more than four take one accent for
 * the highlighted part and two alternating neutrals for the rest, since the key rows carry
 * identity (clawd .claude/rules/dataviz.md: more than about five series, one accent plus
 * grey). A 2 unit surface gap separates the segments.
 */
import { esc, n2, textWidth } from "./canvas.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, formatValue } from "../figures/figures.js";
import { pence, reconcile } from "./money.js";
import { checkNames } from "../qa/names.js";
const SERIES = ["series-1", "series-2", "series-3", "series-4"];
export function billAnatomy(o) {
    const set = currentFigures(o.set);
    const parts = o.parts.map((k) => set.value(k));
    const total = set.value(o.total);
    if (parts.length < 2)
        throw new Error("BillAnatomy needs at least two parts");
    reconcile(o.parts.map((k, i) => [k, parts[i]]), [o.total, total], "a bill part");
    if (o.requireNames)
        checkNames(set, [...o.parts, o.total], "BillAnatomy");
    const keys = [...o.parts, o.total];
    const caption = set.caption(keys);
    const fr = frame({ ...o, set }, caption, 0, "billAnatomy", keys.map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    const names = parts.map((f) => f.name ?? f.label);
    const shown = o.parts.map((k) => set.show(k));
    const share = parts.map((f) => formatValue((pence(f.value) / pence(total.value)) * 100, "percent", 1));
    canvas.allow(...shown, ...share, set.show(o.total));
    const largest = o.parts[parts.reduce((m, f, i) => (f.value > parts[m].value ? i : m), 0)];
    const highlight = o.highlight ?? largest;
    if (!o.parts.includes(highlight))
        throw new Error(`${highlight}: the highlight is not one of the parts`);
    const colours = parts.length <= SERIES.length
        ? SERIES.slice(0, parts.length)
        : o.parts.map((k, i) => (k === highlight ? "accent" : i % 2 ? "series-neutral-soft" : "series-neutral"));
    for (const c of new Set(colours))
        canvas.mark(`bill part ${c}`, c, [bg]);
    if (parts.length <= SERIES.length)
        canvas.series("BillAnatomy parts", colours);
    // The bar: the whole bill from zero, one segment per part.
    const P = fr.plot;
    const barH = tpl.thumb ? P.h - 12 : Math.max(font.value * 1.6, 40);
    const barY = tpl.thumb ? P.y + 6 : P.y;
    const gap = 2;
    const totalW = P.w;
    let x = P.x;
    canvas.add(`<g class="ek-bill" data-ek-total="${total.value}">`);
    parts.forEach((f, i) => {
        const w = (pence(f.value) / pence(total.value)) * totalW;
        const drawW = Math.max(0, w - (i < parts.length - 1 ? gap : 0));
        canvas.add(`<g class="ek-bill-part"><title>${esc(`${names[i]}: ${shown[i]}, ${share[i]} of the bill`)}</title><rect x="${n2(x)}" y="${n2(barY)}" width="${n2(drawW)}" height="${n2(barH)}" ${canvas.paint({ fill: colours[i] })} data-ek-part="${esc(o.parts[i])}"${o.parts[i] === highlight ? ` data-ek-focus="${esc(highlight)}"` : ""} data-value="${f.value}" data-x="${n2(x)}" data-w="${n2(w)}"/></g>`);
        canvas.obstacle(`the bar part for ${names[i]}`, { x, y: barY, w: drawW, h: barH });
        x += w;
    });
    canvas.add(`</g>`);
    canvas.line(P.x, barY - 4, P.x, barY + barH + 4, "border-strong", 1.5, `data-ek-zero="${n2(P.x)}"`);
    if (tpl.thumb) {
        fr.close(barY + barH);
        return { svg: canvas.finish(`BillAnatomy ${o.total} thumb`, ""), table: "", alt: "", caption, width: canvas.W, height: canvas.H };
    }
    // The key: one row per part, then the published total.
    const rowH = font.label * 1.6;
    const shareW = textWidth("100.0%", font.label, "sans", 600) + 8;
    const sw = font.label * 0.75;
    let y = P.y + barH + 18;
    parts.forEach((_, i) => {
        canvas.add(`<rect x="${n2(P.x)}" y="${n2(y + (rowH - sw) / 2)}" width="${n2(sw)}" height="${n2(sw)}" rx="2" ${canvas.paint({ fill: colours[i] })}/>`);
        canvas.obstacle(`the key swatch for ${names[i]}`, { x: P.x, y: y + (rowH - sw) / 2, w: sw, h: sw });
        canvas.text(P.x + sw + 10, y + rowH / 2, names[i], { size: font.label, fill: "text", bg, baseline: "middle" });
        canvas.text(P.x + P.w - shareW, y + rowH / 2, shown[i], { size: font.label, weight: 600, fill: "text", bg, baseline: "middle", anchor: "end", tabular: true, role: "value" });
        canvas.text(P.x + P.w, y + rowH / 2, share[i], { size: font.label, fill: "text-muted", bg, baseline: "middle", anchor: "end", tabular: true, role: "value" });
        y += rowH;
    });
    canvas.line(P.x, y + 4, P.x + P.w, y + 4, "border-strong", 1);
    y += 8;
    canvas.text(P.x + sw + 10, y + rowH / 2, total.name ?? total.label, { size: font.label, weight: 600, fill: "text", bg, baseline: "middle" });
    canvas.text(P.x + P.w - shareW, y + rowH / 2, set.show(o.total), { size: font.label, weight: 600, fill: "text", bg, baseline: "middle", anchor: "end", tabular: true, role: "value" });
    y += rowH;
    fr.close(y);
    const alt = o.alt ?? `A bar from zero splitting ${(total.name ?? total.label).toLowerCase()}, ${set.show(o.total)}, into ${parts.length} parts: ${names.map((n, i) => `${n} ${shown[i]} (${share[i]})`).join(", ")}.${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`BillAnatomy ${o.total} ${tpl.key}`, alt);
    const table = tableTwin({
        caption: fr.title ?? total.label,
        head: ["", "Charge", "Share of the bill"],
        rows: [...names.map((n, i) => [n, shown[i], share[i]]), [total.name ?? total.label, set.show(o.total), "100%"]],
        source: caption
    });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
