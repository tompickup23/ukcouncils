/** Ordered rows lifted from UK Elections PartyBars, on the kit's SVG grammar. */
import { DASHES } from "../qa/gates.js";
import { annotate } from "./grammar/annotation.js";
import { currentFigures } from "../figures/figures.js";
import { frame } from "./frame.js";
import { esc, textWidth } from "./canvas.js";
import { openBar, zeroDomain, zeroScale } from "./grammar/index.js";
import { tableTwin } from "./table.js";
export function rankedBars(o) {
    if (o.template && o.template !== "inline")
        throw new Error("RankedBars draws the inline template only");
    const set = currentFigures(o.set);
    if (!o.rows?.length)
        throw new Error("RankedBars needs rows in caller order");
    if (!o.classLabel?.trim() || !o.basis?.trim())
        throw new Error("RankedBars needs a classLabel and basis for one comparable group");
    if (new Set(o.rows.map(r => r.figure)).size !== o.rows.length)
        throw new Error("each row must appear once");
    const rows = o.rows.map(r => ({ ...r, f: set.valueRecord(r.figure), c: r.change ? set.valueRecord(r.change) : undefined }));
    const first = rows[0].f;
    for (const r of rows) {
        if (r.f.unit !== first.unit || r.f.source.edition !== first.source.edition)
            throw new Error("compare only one unit and edition in a group");
        if (r.c && r.c.source.edition !== first.source.edition)
            throw new Error("change figures must describe the same edition");
    }
    const changes = rows.flatMap(r => r.c ? [r.c] : []);
    if (changes.some(c => c.unit !== changes[0].unit))
        throw new Error("change figures must share one unit");
    const keys = o.rows.flatMap(r => [r.figure, ...(r.change ? [r.change] : [])]);
    for (const key of keys)
        if (!set.get(key).source.table?.trim())
            throw new Error(`${key}: RankedBars source needs table`);
    const caption = set.caption(keys);
    const fr = frame({ ...o, set }, caption, 0, undefined, keys.map(k => set.get(k)));
    const { canvas, tpl, bg, plot: P } = fr;
    const size = tpl.font.label;
    let y = canvas.para(P.x, P.y, `${o.classLabel}. Basis: ${o.basis}`, P.w, { size: tpl.font.axis, fill: "text-muted", bg }) + 14;
    const changeText = (r) => !r.c ? "" : r.c.value === null ? "Change unknown" : `${r.c.value > 0 ? "Rise" : r.c.value < 0 ? "Fall" : "No change"}: ${set.show(r.change)} (${r.c.label})`;
    const shown = rows.map(r => set.show(r.figure));
    canvas.allow(...shown, ...rows.filter(r => r.change).map(r => set.show(r.change)));
    // Names and numbers sit above the bar. Measure the remaining label column before wrapping.
    const valueW = Math.max(...shown.map(s => textWidth(s, tpl.font.value, "sans", 600)));
    const labelW = P.w - valueW - 24;
    if (labelW < size * 5)
        throw new Error("RankedBars value leaves no room for its label");
    const scale = zeroScale(zeroDomain(rows.flatMap(r => r.f.value === null ? [] : [r.f.value])), P.x, P.w, "right");
    canvas.mark("bars", "series-1", [bg]);
    const tableRows = [];
    for (const [i, r] of rows.entries()) {
        const name = r.f.name ?? r.f.label;
        const labelEnd = canvas.para(P.x, y, name, labelW, { size, fill: "text", bg });
        canvas.text(P.x + P.w, y + tpl.font.value, shown[i], { size: tpl.font.value, weight: 600, fill: "text", bg, anchor: "end", role: "value", tabular: true });
        y = Math.max(labelEnd, y + tpl.font.value * 1.25) + 8;
        const h = size * 0.55;
        canvas.add(`<g data-ek-row="${esc(r.figure)}" data-ek-zero="${scale.zero}">`);
        if (r.f.value === null) {
            // A crossed box is a missing observation, deliberately unrelated to the value scale.
            canvas.rect(P.x, y, h, h, "none", `${canvas.paint({ stroke: "text-muted" })} stroke-width="1.5" data-ek-unknown=""`);
            canvas.line(P.x, y, P.x + h, y + h, "text-muted", 1.5);
            canvas.line(P.x + h, y, P.x, y + h, "text-muted", 1.5);
            canvas.obstacle("unknown marker", { x: P.x, y, w: h, h });
            canvas.mark("unknown marker", "text-muted", [bg]);
        }
        else {
            const length = scale.extent(r.f.value);
            openBar(canvas, { orientation: "horizontal", base: scale.zero, end: scale.zero + Math.sign(r.f.value) * length, length, cross: y, thickness: h, r: 0, fill: "series-1", title: `${name}: ${shown[i]}`, what: `bar for ${name}` });
            canvas.add("</g>");
            canvas.line(scale.zero, y - 2, scale.zero, y + h + 2, "text-muted", 1);
            canvas.obstacle("zero tick", { x: scale.zero - 0.5, y: y - 2, w: 1, h: h + 4 });
        }
        canvas.add("</g>");
        y += h + 10;
        if (r.c) {
            // Direction in words survives greyscale, colour vision differences and text extraction.
            const direction = r.c.value === null ? "Change unknown" : r.c.value > 0 ? "Rise:" : r.c.value < 0 ? "Fall:" : "No change:";
            const pieces = [{ text: direction, size: tpl.font.axis, fill: "text-muted" }, ...(r.c.value === null ? [] : [{ text: set.show(r.change), size: tpl.font.axis, fill: "text-muted", role: "value", tabular: true }, { text: `(${r.c.label})`, size: tpl.font.axis, fill: "text-muted" }])];
            if (pieces.reduce((sum, p) => sum + textWidth(p.text, p.size), 6 * (pieces.length - 1)) > P.w)
                throw new Error("change marker exceeds the plot width");
            annotate(canvas, { pieces, gap: 6, x: P.x, y: y + tpl.font.axis, within: { min: P.x, max: P.x + P.w }, bg });
            y += tpl.font.axis * 1.3 + 5;
        }
        y += 12;
        tableRows.push([name, shown[i], ...(changes.length ? [changeText(r) || "Not supplied"] : [])]);
    }
    if (tpl.H && y > P.y + P.h)
        throw new Error("RankedBars rows exceed this template; use inline or fewer rows");
    fr.close(y);
    canvas.assertTextBounds();
    const alt = o.alt ?? `Bars from zero for ${o.classLabel}, in the supplied order. ${o.basis}. ${tableRows.map(r => r.join(": ")).join("; ")}.`;
    if ([alt, caption, ...tableRows.flat()].some(s => DASHES.test(s)))
        throw new Error("dash in RankedBars text");
    const svg = canvas.finish("RankedBars", alt);
    const table = tableTwin({ caption: fr.title ?? `${o.classLabel}: ${o.basis}`, head: ["Area or service", first.label, ...(changes.length ? ["Change"] : [])], rows: tableRows, source: caption });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
