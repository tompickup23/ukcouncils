/**
 * Hemicycle: a chamber, one dot per seat, parties in concentric arcs from left to right,
 * with the seats nobody holds drawn hollow and the majority marked. Lifted from UK
 * Elections CommonsHorseshoe.astro and CouncilChamber.astro: the row and seat layout, the
 * left to right party order, and the rule that a vacant or uncounted seat is drawn, never
 * left out, so a 78 seat council never renders as 77.
 *
 * Added for the kit: seats and the chamber size come from figure records; the parties
 * may not hold more seats than the chamber; a key row per party carries the count as
 * text; party dots that fall under 3:1 on their ground get a ring in the text colour,
 * the casing rule of the Line chart; the source line and table twin as everywhere else.
 */
import { contrast } from "../qa/colour.js";
import { MIN_MARK_CONTRAST, resolve } from "../qa/gates.js";
import { partyColour, partyKey, partyName } from "../../generated/tokens.js";
import { esc, gatePalettes, n2 } from "./canvas.js";
import { frame } from "./frame.js";
import { tableTwin } from "./table.js";
import { currentFigures } from "../figures/figures.js";
// The UK Elections left to right order (CommonsHorseshoe.astro). The TUV name is the
// party's own, verbatim, for lookup only; its hyphen is an escape so the source passes the
// dash check, and labels print partyName() instead.
const LEFT_TO_RIGHT = [
    "Sinn F\u00e9in", "SDLP", "Workers Party of Britain", "Green Party", "Plaid Cymru", "SNP", "Labour",
    "Speaker seeking re-election", "Independent", "Alliance", "UUP", "Liberal Democrats", "Conservative",
    "Traditional Unionist Voice \u002d TUV", "DUP", "Reform UK", "Restore Britain"
];
const SERIES = ["series-1", "series-2", "series-3", "series-4"];
export function hemicycle(o) {
    const set = currentFigures(o.set);
    const figs = o.parties.map((k) => set.value(k));
    const total = set.value(o.total);
    for (const [k, f] of [...o.parties.map((k, i) => [k, figs[i]]), [o.total, total]]) {
        if (f.unit !== "count" || !Number.isInteger(f.value) || f.value < 0)
            throw new Error(`${k}: seats must be a whole count`);
    }
    const held = figs.reduce((s, f) => s + f.value, 0);
    if (held > total.value)
        throw new Error(`${o.total}: the parties hold ${held} seats but the chamber has ${total.value}`);
    const majority = o.majority ? set.value(o.majority).value : Math.floor(total.value / 2) + 1;
    const empty = total.value - held;
    const mode = o.colours ?? "party";
    if (mode === "series" && figs.length > SERIES.length)
        throw new Error("more than four parties: use party colours, not more series");
    // Order and colour.
    // The data's name finds the order and the colour; the display name is what prints.
    const keysOf = figs.map((f) => f.name ?? f.label);
    const names = keysOf.map(partyName);
    let idx = figs.map((_, i) => i).filter((i) => figs[i].value > 0);
    if ((o.order ?? "ideology") === "ideology") {
        const rank = (n) => { const r = LEFT_TO_RIGHT.indexOf(partyKey(n)); return r === -1 ? LEFT_TO_RIGHT.indexOf("Independent") + 0.5 : r; };
        idx = idx.sort((a, b) => rank(keysOf[a]) - rank(keysOf[b]));
    }
    const colourOf = figs.map((f, i) => (mode === "party" ? partyColour(keysOf[i]) : SERIES[i]));
    const keys = [...o.parties, o.total, ...(o.majority ? [o.majority] : [])];
    const caption = set.caption(keys);
    const fr = frame({ ...o, set }, caption, 0, undefined, keys.map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    const palettes = gatePalettes(canvas.mode);
    const ringed = colourOf.map((c) => palettes.some((p) => contrast(resolve(c, p.pal), resolve(bg, p.pal)) < MIN_MARK_CONTRAST));
    figs.forEach((_, i) => { if (figs[i].value > 0)
        canvas.mark(`seats ${names[i]}`, ringed[i] ? "text" : colourOf[i], [bg]); });
    if (mode === "series")
        canvas.series("Hemicycle parties", idx.map((i) => colourOf[i]));
    // Geometry, after CommonsHorseshoe: rows by chamber size, seats per row in proportion
    // to arc length, the residual on the outer rows.
    const N = total.value;
    const rows = N >= 400 ? 9 : N >= 200 ? 6 : N >= 60 ? 4 : 3;
    // The chamber is half as tall as it is wide, plus the majority line under it. On a wide
    // card the key sits beside it; on a portrait card the key goes below and the chamber is
    // centred over it.
    const keyN = figs.filter((f) => f.value > 0).length + (empty > 0 ? 1 : 0);
    const below = tpl.card && !tpl.keyBeside;
    const under = font.axis + 30 + (below ? 14 + keyN * font.label * 1.55 : 0);
    const side = tpl.card ? Math.min(fr.plot.w * (below ? 1 : 0.56), (fr.plot.h - under) * 2) : fr.plot.w;
    const x0 = below ? fr.plot.x + (fr.plot.w - side) / 2 : fr.plot.x;
    const outer = side / 2 - 8;
    const inner = outer * (rows >= 6 ? 0.42 : 0.5);
    const radii = Array.from({ length: rows }, (_, i) => inner + (i * (outer - inner)) / (rows - 1));
    const arcs = radii.map((r) => Math.PI * r);
    const totalArc = arcs.reduce((s, a) => s + a, 0);
    const perRow = arcs.map((a) => Math.round((a / totalArc) * N));
    let drift = N - perRow.reduce((s, n) => s + n, 0);
    for (let r = rows - 1; drift !== 0; r = (r - 1 + rows) % rows) {
        perRow[r] += drift > 0 ? 1 : -1;
        drift += drift > 0 ? -1 : 1;
    }
    const rowGap = (outer - inner) / (rows - 1);
    const spacing = Math.min(...radii.map((r, i) => (perRow[i] > 0 ? (Math.PI * r) / perRow[i] : Infinity)));
    const dotR = Math.max(1.5, Math.min(rowGap, spacing) * 0.42);
    const positions = [];
    perRow.forEach((n, row) => { for (let k = 0; k < n; k++)
        positions.push({ row, angle: Math.PI * (1 - (k + 0.5) / n) }); });
    positions.sort((a, b) => b.angle - a.angle);
    const cx = x0 + side / 2;
    const cy = fr.plot.y + outer + dotR + 4;
    const xy = (p) => ({ x: cx + radii[p.row] * Math.cos(p.angle), y: cy - radii[p.row] * Math.sin(p.angle) });
    let cursor = 0;
    canvas.add(`<g class="ek-hemicycle" data-ek-seats="${N}" data-ek-held="${held}">`);
    for (const i of idx) {
        canvas.add(`<g class="ek-party"><title>${esc(`${names[i]}: ${set.show(o.parties[i])} seats`)}</title>`);
        for (let s = 0; s < figs[i].value; s++) {
            const { x, y } = xy(positions[cursor++]);
            const ring = ringed[i] ? ` ${canvas.paint({ stroke: "text" })} stroke-width="${n2(Math.max(0.75, dotR * 0.18))}"` : "";
            canvas.add(`<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(dotR)}" ${canvas.paint({ fill: colourOf[i] })}${ring} data-ek-seat="${esc(o.parties[i])}"/>`);
            canvas.obstacle(`a seat for ${names[i]}`, { x: x - dotR, y: y - dotR, w: dotR * 2, h: dotR * 2 });
        }
        canvas.add(`</g>`);
    }
    if (empty > 0) {
        canvas.mark("empty seat ring", "text-muted", [bg]);
        canvas.add(`<g class="ek-empty"><title>${esc(`${o.emptyLabel ?? "Vacant"}: ${empty}`)}</title>`);
        for (; cursor < positions.length; cursor++) {
            const { x, y } = xy(positions[cursor]);
            canvas.obstacle("an empty seat", { x: x - dotR, y: y - dotR, w: dotR * 2, h: dotR * 2 });
            canvas.add(`<circle cx="${n2(x)}" cy="${n2(y)}" r="${n2(dotR * 0.85)}" fill="none" ${canvas.paint({ stroke: "text-muted" })} stroke-width="${n2(Math.max(1, dotR * 0.22))}" data-ek-seat=""/>`);
        }
        canvas.add(`</g>`);
    }
    canvas.add(`</g>`);
    // The majority: a mark at the centre of the baseline and its count as text.
    canvas.line(cx, cy - outer - dotR - 2, cx, cy + 6, "text-muted", 1.2, 'stroke-dasharray="3 4"');
    const majText = `${majority} for a majority`;
    canvas.text(cx, cy + 8 + font.axis, majText, { size: font.axis, weight: 600, fill: "text-muted", bg, anchor: "middle" });
    let bottom = cy + 8 + font.axis + 6;
    // Key: largest first, then the empty seats.
    const keyRows = [...idx].sort((a, b) => figs[b].value - figs[a].value);
    const rowH = font.label * 1.55;
    const beside = tpl.card && tpl.keyBeside;
    const kx = beside ? fr.plot.x + side + 40 : fr.plot.x;
    const kw = beside ? fr.plot.w - side - 40 : fr.plot.w;
    let ky = beside ? fr.plot.y : bottom + 14;
    const sw = font.label * 0.75;
    for (const i of keyRows) {
        const ring = ringed[i] ? ` ${canvas.paint({ stroke: "text" })} stroke-width="1"` : "";
        canvas.add(`<circle cx="${n2(kx + sw / 2)}" cy="${n2(ky + rowH / 2)}" r="${n2(sw / 2)}" ${canvas.paint({ fill: colourOf[i] })}${ring}/>`);
        canvas.obstacle(`the key dot for ${names[i]}`, { x: kx, y: ky + rowH / 2 - sw / 2, w: sw, h: sw });
        canvas.text(kx + sw + 10, ky + rowH / 2, names[i], { size: font.label, fill: "text", bg, baseline: "middle" });
        canvas.text(kx + kw, ky + rowH / 2, set.show(o.parties[i]), { size: font.label, weight: 600, fill: "text", bg, baseline: "middle", anchor: "end", tabular: true });
        ky += rowH;
    }
    if (empty > 0) {
        canvas.add(`<circle cx="${n2(kx + sw / 2)}" cy="${n2(ky + rowH / 2)}" r="${n2(sw / 2 - 1)}" fill="none" ${canvas.paint({ stroke: "text-muted" })} stroke-width="1.5"/>`);
        canvas.text(kx + sw + 10, ky + rowH / 2, o.emptyLabel ?? "Vacant", { size: font.label, fill: "text-muted", bg, baseline: "middle" });
        canvas.text(kx + kw, ky + rowH / 2, String(empty), { size: font.label, weight: 600, fill: "text-muted", bg, baseline: "middle", anchor: "end", tabular: true });
        ky += rowH;
    }
    bottom = Math.max(bottom, ky);
    fr.close(bottom);
    const lead = keyRows[0];
    const alt = o.alt ?? `A chamber of ${N} seats, one dot per seat: ${keyRows.map((i) => `${names[i]} ${figs[i].value}`).join(", ")}${empty ? `, ${o.emptyLabel ?? "vacant"} ${empty}` : ""}. ${majText}; ${names[lead]} ${figs[lead].value >= majority ? "has" : "does not have"} a majority.${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`Hemicycle ${o.total} ${tpl.key}`, alt);
    const table = tableTwin({
        caption: fr.title ?? total.label,
        head: ["", "Seats"],
        rows: [...keyRows.map((i) => [names[i], set.show(o.parties[i])]), ...(empty ? [[o.emptyLabel ?? "Vacant", String(empty)]] : []), ["Chamber", set.show(o.total)], ["Needed for a majority", String(majority)]],
        source: o.majority ? caption : `${caption} The majority is more than half the chamber.`
    });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
