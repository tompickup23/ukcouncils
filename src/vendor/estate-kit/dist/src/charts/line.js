/**
 * Line: one or more series figures over time or over categories. Lifted from UK Elections
 * PartyTrendChart.astro: Observable Plot rendered at build inside JSDOM and inlined, so
 * no script reaches the reader. Plot earns its place here for the time axis and tick
 * density. Added for the kit: the source line inside the drawing, direct labels at the end
 * of each line in place of a legend, the table twin, and the QA gates.
 *
 * The value axis starts at zero unless yFrom is "data". A tuned line frame is legitimate
 * (clawd .claude/rules/dataviz.md rule 1); a tuned bar frame is not.
 */
import * as Plot from "@observablehq/plot";
import { JSDOM } from "jsdom";
import { contrast } from "../qa/colour.js";
import { MIN_MARK_CONTRAST, resolve } from "../qa/gates.js";
import { partyColour, partyName } from "../../generated/tokens.js";
import { gatePalettes, n2, textWidth } from "./canvas.js";
import { polylineObstacles, spread } from "./grammar/index.js";
import { frame, niceMax } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures, formatValue, showPoint } from "../figures/figures.js";
const SERIES_TOKENS = ["series-1", "series-2", "series-3", "series-4"];
const monthYear = (d) => d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
export function line(o) {
    const set = currentFigures(o.set);
    const figs = o.series.map((k) => set.series(k));
    if (figs.length === 0)
        throw new Error("Line needs at least one series");
    if (figs.length > SERIES_TOKENS.length && o.colours !== "party")
        throw new Error("more than four series: use small multiples, not more hues");
    const unit = figs[0].unit, axis = figs[0].axis;
    if (figs.some((f) => f.unit !== unit || f.axis !== axis))
        throw new Error("every series on one Line must share a unit and an axis kind");
    const caption = set.caption(o.series);
    const fr = frame({ ...o, set }, caption, 0, undefined, o.series.map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    // In party mode the data's name finds the colour and the display name prints (the TUV key carries a spaced hyphen).
    const names = figs.map((f) => (o.colours === "party" ? partyName(f.name ?? f.label) : f.name ?? f.label));
    // Colours, and a casing under any line whose colour does not clear 3:1 on its ground in
    // some palette the render must pass (a yellow party line on white, say).
    const colours = figs.map((f, i) => (o.colours === "party" ? partyColour(f.name ?? f.label) : SERIES_TOKENS[i]));
    const palettes = gatePalettes(canvas.mode);
    const cased = colours.map((c) => palettes.some((p) => contrast(resolve(c, p.pal), resolve(bg, p.pal)) < MIN_MARK_CONTRAST));
    colours.forEach((c, i) => canvas.mark(`line ${names[i]}`, cased[i] ? "text" : c, [bg]));
    if (o.colours !== "party")
        canvas.series("Line series", colours);
    const label = (i) => {
        const f = figs[i], last = f.points[f.points.length - 1];
        return `${names[i]} ${showPoint(f, last, "full")}`;
    };
    const endW = Math.max(...figs.map((_, i) => textWidth(label(i), font.label, "sans", 600))) + 30;
    const plotH = tpl.H ? fr.plot.h : tpl.plotH;
    const P = { x: fr.plot.x, y: fr.plot.y, w: fr.plot.w, h: plotH };
    // Placeholder colours in css mode, swapped for custom properties after Plot has drawn.
    const placeholder = (i) => `#0000${(i + 1).toString(16).padStart(2, "0")}`;
    const strokeFor = (i) => {
        const c = colours[i];
        if (c.startsWith("#"))
            return c;
        return canvas.mode.kind === "css" ? placeholder(i) : resolve(c, gatePalettes(canvas.mode)[0].pal);
    };
    const rows = figs.flatMap((f, s) => f.points.map((p) => ({ x: axis === "time" ? new Date(p.label) : p.label, y: p.value, s })));
    const all = rows.map((r) => r.y);
    const yDomain = (o.yFrom ?? "zero") === "zero" ? [0, niceMax(Math.max(...all))] : undefined;
    const tickFmt = (v) => formatValue(v, unit, 0, Math.max(...all) >= 1e4 ? "short" : "full");
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    // Room for the widest value tick (Plot sets it 9 units off the axis) and for half the
    // first date tick, which is centred on the axis.
    const firstX = axis === "time" ? monthYear(new Date(figs[0].points[0].label)) : figs[0].points[0].label;
    const marginLeft = Math.max(Math.max(...[0, ...(yDomain ?? all)].map((v) => textWidth(tickFmt(v), font.axis) * 1.15)) + 16, textWidth(firstX, font.axis) * 0.6 + 4);
    const chart = Plot.plot({
        document: dom.window.document,
        width: P.w,
        height: P.h,
        marginTop: 12,
        marginRight: endW,
        marginBottom: font.axis + 18,
        marginLeft,
        x: axis === "time"
            ? { type: "utc", label: null, tickFormat: monthYear, ticks: Math.max(2, Math.floor((P.w - endW) / (font.axis * 6))) }
            : { type: "point", label: null, padding: 0.2 },
        y: { domain: yDomain, label: null, grid: true, tickFormat: tickFmt, ticks: 5, nice: !yDomain },
        marks: [
            Plot.ruleY([0], { strokeOpacity: 0.35 }),
            ...figs.flatMap((_, i) => {
                const data = rows.filter((r) => r.s === i);
                const casing = cased[i] ? [Plot.lineY(data, { x: "x", y: "y", stroke: canvas.mode.kind === "css" ? "#0000fe" : resolve("text", gatePalettes(canvas.mode)[0].pal), strokeWidth: 5.2, strokeLinejoin: "round", strokeLinecap: "round" })] : [];
                return [...casing, Plot.lineY(data, { x: "x", y: "y", stroke: strokeFor(i), strokeWidth: 3, strokeLinejoin: "round", strokeLinecap: "round" })];
            })
        ]
    });
    // Tick labels go through the text gate like every other piece of text.
    for (const t of chart.querySelectorAll('g[aria-label$="tick label"] text')) {
        canvas.checks.texts.push({ content: t.textContent ?? "", size: font.axis, weight: 400, fill: "text-muted", bg });
    }
    const xS = chart.scale("x"), yS = chart.scale("y");
    chart.removeAttribute("style");
    chart.setAttribute("x", n2(P.x));
    chart.setAttribute("y", n2(P.y));
    chart.setAttribute("font-family", "'Source Sans 3', sans-serif");
    chart.setAttribute("font-size", n2(font.axis));
    for (const s of chart.querySelectorAll("style"))
        s.remove();
    // Plot names each mark group with aria-label ("line", "rule", "y-grid"). An aria-label on
    // a g with no role is prohibited (axe aria-prohibited-attr, found by the catalogue), and
    // the chart already speaks through its own label, caption and table twin, so they go.
    let inner = chart.outerHTML.replace(/ class="plot-[^"]*"/g, "").replace(/ aria-label="[^"]*"/g, "");
    // Plot paints ticks and text in currentColor; give it the muted text token.
    if (canvas.mode.kind === "css") {
        colours.forEach((c, i) => { if (!c.startsWith("#"))
            inner = inner.replaceAll(`stroke="${placeholder(i)}"`, `style="stroke:var(--${c})"`); });
        inner = inner.replaceAll('stroke="#0000fe"', 'style="stroke:var(--text)"');
        inner = inner.replace("<svg ", '<svg style="color:var(--text-muted)" ');
    }
    else {
        inner = inner.replace("<svg ", `<svg color="${resolve("text-muted", gatePalettes(canvas.mode)[0].pal)}" `);
    }
    canvas.add(`<g class="ek-line">${inner}</g>`);
    // Direct labels at each line's end, pushed apart so they never overlap.
    const gapY = font.label * 1.25;
    const ends = figs.map((f, i) => {
        const last = f.points[f.points.length - 1];
        const x = axis === "time" ? new Date(last.label) : last.label;
        return { i, x: P.x + xS.apply(x), y: P.y + yS.apply(last.value) };
    }).sort((a, b) => a.y - b.y);
    spread(ends, gapY);
    // Each line registers its segments, so no label may cross a line.
    figs.forEach((f, i) => polylineObstacles(canvas, `the line for ${names[i]}`, f.points.map((p) => ({
        x: P.x + xS.apply(axis === "time" ? new Date(p.label) : p.label), y: P.y + yS.apply(p.value)
    })), cased[i] ? 5.2 : 3));
    for (const e of ends) {
        const lx = P.x + P.w - endW + 10;
        canvas.add(`<line x1="${n2(lx)}" y1="${n2(e.y)}" x2="${n2(lx + 14)}" y2="${n2(e.y)}" ${canvas.paint({ stroke: colours[e.i] })} stroke-width="4" stroke-linecap="round"/>`);
        canvas.text(lx + 20, e.y, label(e.i), { size: font.label, weight: 600, fill: "text", bg, baseline: "middle" });
    }
    fr.close(P.y + P.h);
    const span = `${figs[0].points[0].label} to ${figs[0].points[figs[0].points.length - 1].label}`;
    const alt = o.alt ?? `Line chart of ${names.join(" and ")}, ${axis === "time" ? span.replace(/\d{4}-\d{2}-\d{2}/g, (d) => monthYear(new Date(d))) : span}. Latest: ${figs.map((_, i) => label(i)).join(", ")}.${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`Line ${o.series.join("+")} ${tpl.key}`, alt);
    const xs = [...new Set(figs.flatMap((f) => f.points.map((p) => p.label)))];
    const table = tableTwin({
        caption: fr.title ?? figs.map((f) => f.label).join("; "),
        head: [axis === "time" ? "Date" : "", ...names],
        rows: xs.map((x) => [axis === "time" ? new Date(x).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : x,
            ...figs.map((f) => { const p = f.points.find((q) => q.label === x); return p ? showPoint(f, p) : "no figure"; })]),
        source: caption
    });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
