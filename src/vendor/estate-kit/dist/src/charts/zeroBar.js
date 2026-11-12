/**
 * ZeroBar: bars from zero for one series figure. Lifted from UK Councils and UK Council
 * Tax HistoryBars.astro: one contrast checked hue, the baseline at zero and unbroken, the
 * data end rounded and the baseline end square, direct labels, a native title per bar so
 * hover needs no script, and the table twin underneath.
 *
 * There is no option to move the baseline. A bar chart with a non zero baseline does not
 * ship (clawd .claude/rules/dataviz.md, hard stops), so the kit cannot draw one.
 *
 * Diverging (kit 0.3.0, for the UK Council Tax budget game's gap bars, A6 section 4):
 * `diverging: true` draws values either side of zero, the zero line inside the plot and
 * every bar measured from it, so a gap of minus five is as long as a gap of five. Above
 * zero takes the first series and below it the second, and the sign is always in the
 * printed value, so colour never carries it alone. Without the flag a negative still
 * throws, so a chart meant to be all positive cannot quietly turn into a diverging one.
 */
import { esc, n2, textWidth, wrap } from "./canvas.js";
import { bands, firstClear, openBar, zeroDomain, zeroLine, zeroScale } from "./grammar/index.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, showPoint } from "../figures/figures.js";
export function zeroBar(o) {
    const orientation = o.orientation ?? "vertical";
    const set = currentFigures(o.set);
    const f = set.series(o.figure);
    const hasNeg = f.points.some((p) => p.value < 0);
    if (hasNeg && !o.diverging)
        throw new Error(`${o.figure}: ZeroBar draws negatives only as a diverging chart; pass diverging: true for values either side of zero`);
    if (o.highlight !== undefined && !f.points.some((p) => p.label === o.highlight))
        throw new Error(`${o.figure}: the highlight "${o.highlight}" is not one of the points`);
    const caption = set.caption(o.figure);
    const n = f.points.length;
    const fr = frame({ ...o, set }, caption, 0, "zeroBar", [o.figure].map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const thumb = !!tpl.thumb;
    const font = tpl.font;
    // No gridlines, so the longest bar may run the full length: the domain is zero to the
    // data extremes, as in HistoryBars. The baseline is what must not move.
    const domain = zeroDomain(f.points.map((p) => p.value));
    const { lo, hi } = domain;
    const colourFor = (p) => o.highlight ? (o.highlight === p.label ? "accent" : "series-neutral")
        : o.diverging ? (p.value < 0 ? "series-2" : "series-1")
            : "accent";
    const focusAttr = (label) => (label === o.highlight ? ` data-ek-focus="${esc(label)}"` : "");
    const colours = [...new Set(f.points.map(colourFor))];
    for (const c of colours)
        canvas.mark(`bar ${c}`, c, [bg]);
    if (o.diverging && !o.highlight)
        canvas.series("ZeroBar either side of zero", colours);
    const shown = f.points.map((p) => showPoint(f, p));
    canvas.allow(...shown);
    const r = 4;
    let plotBottom;
    let zero;
    if (orientation === "vertical") {
        const plotH = tpl.H ? fr.plot.h : tpl.plotH;
        const P = { x: fr.plot.x, y: fr.plot.y, w: fr.plot.w, h: plotH };
        // Room for a value label above the highest bar and, when there are negatives, below
        // the lowest; the category labels sit along the foot of the plot.
        const band = bands(n, P.x, P.w, { gapRatio: 0.12, minGap: 2 });
        const { step } = band;
        const barW = band.band;
        const showAll = n <= 6;
        // Category labels wrap to their bar's width, so long service names stack rather than
        // collide; a one line label sits where it always has.
        const lh = font.axis * 1.15;
        const catLines = f.points.map((p) => wrap(p.label, step - 6, font.axis));
        const maxLines = thumb ? 1 : Math.max(...catLines.map((l) => l.length));
        const top = thumb ? P.y : P.y + (hi > 0 ? font.value + 14 : 6);
        const bottom = thumb ? P.y + plotH : P.y + plotH - font.axis - 14 - (maxLines - 1) * lh - (lo < 0 ? font.value + 14 : 0);
        const innerH = bottom - top;
        const scale = zeroScale(domain, top, innerH, "up");
        zero = scale.zero;
        const catY = P.y + plotH - 6 - (maxLines - 1) * lh;
        // Geometry first, so a value label can be placed clear of every other bar. A label
        // centred over its bar and wider than it used to run under a taller neighbour, which
        // is drawn after it and hid its last digits (kit 0.4.0).
        const geo = f.points.map((p, i) => {
            const h = scale.extent(p.value);
            const x = band.at(i);
            const up = p.value >= 0;
            const end = up ? zero - h : zero + h;
            return { h, x, up, end, top: Math.min(zero, end), bottom: Math.max(zero, end) };
        });
        const pad = 2;
        const boxAt = (left, baseline, w) => ({ x: left - pad, y: baseline - font.value * 0.78 - pad, w: w + pad * 2, h: font.value * 0.98 + pad * 2 });
        const across = (b, g) => b.x < g.x + barW && b.x + b.w > g.x;
        // Every other bar is an obstacle to bar i's label.
        const others = (self) => geo.flatMap((g, j) => (j !== self && g.h > 0 ? [{ x: g.x, y: g.top, w: barW, h: g.h }] : []));
        /** Where bar i's value label goes: centred if clear, else against one edge, else beyond the bars it spans. */
        const place = (i) => {
            const g = geo[i];
            const w = textWidth(shown[i], font.value, "sans", 600);
            const y = g.up ? g.end - 10 : g.end + font.value + 4;
            const cx = g.x + barW / 2;
            const inside = (left) => left >= P.x && left + w <= P.x + P.w;
            const endLeft = g.x + barW - w;
            const clear = firstClear([
                { box: boxAt(cx - w / 2, y, w), at: { x: cx, y, anchor: "middle" } },
                { box: boxAt(endLeft, y, w), at: { x: g.x + barW, y, anchor: "end" }, inside: inside(endLeft) },
                { box: boxAt(g.x, y, w), at: { x: g.x, y, anchor: "start" }, inside: inside(g.x) }
            ], others(i));
            if (clear)
                return clear;
            // No clear place beside the bar's own end: keep the label over its bar, inside the
            // plot, and move it beyond every bar it spans.
            const left = Math.min(Math.max(cx - w / 2, P.x), Math.max(P.x, P.x + P.w - w));
            const spanned = geo.filter((o2) => o2.h > 0 && across({ x: left - pad, w: w + pad * 2 }, o2));
            const yClear = g.up
                ? Math.min(...spanned.map((o2) => o2.top)) - 10
                : Math.max(...spanned.map((o2) => o2.bottom)) + font.value + 4;
            return { x: left, y: yClear, anchor: "start" };
        };
        // Category labels for every bar when each fits on one line under its own bar (A to H);
        // otherwise the ends and the highlight, as before.
        const allCats = showAll || f.points.every((p, i) => catLines[i].length === 1 && textWidth(p.label, font.axis) <= step - 6);
        canvas.add(`<g class="ek-bars">`);
        f.points.forEach((p, i) => {
            const { h, x, end } = geo[i];
            const rr = Math.min(r, barW / 2, h);
            // The data end rounded, the zero end square.
            openBar(canvas, {
                orientation: "vertical", base: zero, end, length: h, cross: x, thickness: barW, r: rr, fill: colourFor(p),
                title: `${p.label}: ${shown[i]}`, what: `the bar for ${p.label}`,
                attrs: `data-ek-bar="" data-value="${p.value}" data-base="${n2(zero)}" data-end="${n2(end)}"${focusAttr(p.label)}`
            });
            const labelled = showAll || i === 0 || i === n - 1 || p.label === o.highlight;
            if (labelled) {
                const at = place(i);
                canvas.text(at.x, at.y, shown[i], { size: font.value, weight: 600, fill: "text", bg, anchor: at.anchor, tabular: true, role: "value" });
            }
            if (labelled || allCats)
                catLines[i].forEach((l, j) => canvas.text(x + barW / 2, catY + j * lh, l, { size: font.axis, fill: "text-muted", bg, anchor: "middle", group: `cat-${i}` }));
            canvas.add(`</g>`);
        });
        canvas.add(`</g>`);
        zeroLine(canvas, "vertical", zero, P.x, P.x + P.w);
        plotBottom = P.y + plotH;
    }
    else {
        const valueW = (pts) => (thumb || !pts.length ? 0 : Math.max(...pts.map((i) => textWidth(shown[i], font.value, "sans", 600))) + 12);
        const idx = f.points.map((_, i) => i);
        const labelW = thumb ? 0 : Math.max(...f.points.map((p) => textWidth(p.label, font.label))) + 14;
        const negW = valueW(idx.filter((i) => f.points[i].value < 0));
        const posW = valueW(idx.filter((i) => f.points[i].value >= 0));
        const rowH = Math.max(font.value * 1.7, 36);
        const P = { x: fr.plot.x, y: fr.plot.y, w: fr.plot.w, h: tpl.H ? fr.plot.h : rowH * n };
        const band = bands(n, P.y, P.h);
        const barH = Math.min(band.step * 0.62, font.value * 1.25);
        // The category labels take the left column; negative values print left of their bars,
        // positive values right of theirs, so each side keeps its own label room.
        const x0 = P.x + labelW + negW;
        const innerW = P.w - labelW - negW - posW;
        const scale = zeroScale(domain, x0, innerW, "right");
        zero = scale.zero;
        canvas.add(`<g class="ek-bars">`);
        f.points.forEach((p, i) => {
            const w = scale.extent(p.value);
            const y = band.centred(i, barH);
            const right = p.value >= 0;
            const end = right ? zero + w : zero - w;
            const rr = Math.min(r, barH / 2, w);
            openBar(canvas, {
                orientation: "horizontal", base: zero, end, length: w, cross: y, thickness: barH, r: rr, fill: colourFor(p),
                title: `${p.label}: ${shown[i]}`, what: `the bar for ${p.label}`,
                attrs: `data-ek-bar="" data-value="${p.value}" data-base="${n2(zero)}" data-end="${n2(end)}"${focusAttr(p.label)}`
            });
            canvas.text(P.x + labelW - 10, y + barH / 2, p.label, { size: font.label, fill: "text", bg, anchor: "end", baseline: "middle" });
            canvas.text(right ? end + 8 : end - 8, y + barH / 2, shown[i], { size: font.value, weight: 600, fill: "text", bg, baseline: "middle", tabular: true, anchor: right ? "start" : "end", role: "value" });
            canvas.add(`</g>`);
        });
        canvas.add(`</g>`);
        zeroLine(canvas, "horizontal", zero, P.y, P.y + P.h);
        plotBottom = P.y + P.h;
    }
    fr.close(plotBottom);
    if (thumb)
        return { svg: canvas.finish(`ZeroBar ${o.figure} thumb`, ""), table: "", alt: "", caption, width: canvas.W, height: canvas.H };
    const first = f.points[0], last = f.points[n - 1];
    const kind = hasNeg ? "Bar chart either side of zero" : "Bar chart from zero";
    const alt = o.alt ?? `${kind} of ${f.label.toLowerCase()}, ${n} bars from ${first.label} (${showPoint(f, first)}) to ${last.label} (${showPoint(f, last)}).${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`ZeroBar ${o.figure} ${tpl.key}`, alt);
    const table = tableTwin({ caption: fr.title ?? f.label, head: ["", f.name ?? f.label], rows: f.points.map((p, i) => [p.label, shown[i]]), source: caption });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
