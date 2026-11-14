/**
 * LocatorMap: a place and its neighbours, each shaded by a rate in fixed classes, the
 * place outlined, the values printed on plates. Lifted from the UK Demographics map system
 * (ukdemographics src/lib/map/): the estate ground behind every map in every theme, the
 * sequential ramp, hatched areas with no figure so they never read as the lowest class,
 * the focus outline in the text colour over a ground gap, Mercator fitted to the place
 * with its neighbours cut at the panel edge, plates at each area's pole of inaccessibility
 * placed without collisions (the place first, then the largest), every neighbour without a
 * plate named with its value under the key, and rings rewound for d3-geo's spherical paths.
 *
 * The kit ships no boundaries. A site passes its own features with their licence line,
 * which is printed with the source (ONS boundaries carry an OS Crown copyright notice).
 *
 * Rules from clawd .claude/rules/dataviz.md: rates, never counts; 5 plus or minus 2
 * classes; a quantity ramp is one hue ordered by lightness. Classes are fixed by the
 * caller's breaks, so a colour means the same value on every map that shares them.
 */
import { geoMercator, geoPath } from "d3-geo";
import { tokens } from "../../generated/tokens.js";
import { esc, n2, textWidth } from "./canvas.js";
import { frame } from "./frame.js";
import { gutterLabels, leaderAnchor, lockedWidth, placePlates, polylineObstacles, segmentHitsBox, segmentsCross } from "./grammar/index.js";
import { tableTwin } from "./table.js";
import { currentFigures, formatValue } from "../figures/figures.js";
import { rewind, pole } from "./grammar/geo.js";
const R = tokens.ramp;
const RATE_UNITS = new Set(["percent", "rate", "index", "gbp", "pence"]);
/** The ramp steps for a number of classes, spread across the seven so the ends always show. */
export function rampFor(classes) {
    const all = R.sequential;
    if (classes < 4 || classes > all.length)
        throw new Error(`a map takes 4 to ${all.length} classes, not ${classes}`);
    return Array.from({ length: classes }, (_, i) => all[Math.round((i * (all.length - 1)) / (classes - 1))]);
}
export function locatorMap(o) {
    const set = currentFigures(o.set);
    if (!o.boundaryCredit)
        throw new Error("a map needs the boundary licence line in boundaryCredit");
    const areas = o.areas.map(rewind);
    const focus = areas.find((a) => a.properties.code === o.focus);
    if (!focus)
        throw new Error(`${o.focus}: the focus is not among the areas`);
    const breaks = o.breaks;
    if (breaks.some((b, i) => i > 0 && b <= breaks[i - 1]))
        throw new Error("breaks must rise");
    const ramp = rampFor(breaks.length + 1);
    const keys = Object.values(o.values);
    const figs = Object.fromEntries(Object.entries(o.values).map(([code, k]) => [code, set.value(k)]));
    const unit = figs[o.focus]?.unit ?? Object.values(figs)[0]?.unit;
    for (const [code, f] of Object.entries(figs)) {
        if (!RATE_UNITS.has(f.unit))
            throw new Error(`${o.values[code]}: a map shades rates, never counts; this figure is a ${f.unit}`);
        if (f.unit !== unit)
            throw new Error(`${o.values[code]}: every area on one map must share a unit`);
        if (!areas.some((a) => a.properties.code === code))
            throw new Error(`${o.values[code]}: area ${code} is not among the areas`);
    }
    const classOf = (v) => breaks.filter((b) => v >= b).length;
    for (const other of o.lockAcross ?? [])
        for (const [code, k] of Object.entries(other)) {
            const f = set.value(k);
            if (f.unit !== unit)
                throw new Error(`${k}: every edition a map is locked across must share its unit`);
            if (!areas.some((a) => a.properties.code === code))
                throw new Error(`${k}: area ${code} is not among the areas`);
        }
    const caption = `${set.caption(keys)} ${o.boundaryCredit}`;
    const fr = frame({ ...o, set }, caption, 0, undefined, keys.map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    const fmt = (v) => formatValue(v, unit ?? "rate", Number.isInteger(v) ? 0 : 1);
    const labels = ramp.map((_, i) => (i === 0 ? `under ${fmt(breaks[0])}` : i === ramp.length - 1 ? `${fmt(breaks[i - 1])} and over` : `${fmt(breaks[i - 1])} to under ${fmt(breaks[i])}`));
    const hasNa = areas.some((a) => !figs[a.properties.code]);
    const keyRows = ramp.length + (hasNa ? 1 : 0) + 1;
    // The key goes beside the map on a wide card and below it otherwise, in two columns on
    // a portrait card. Its rows are compact: a swatch and its range.
    const beside = tpl.card && tpl.keyBeside;
    const rowH = font.label * 1.35, sw = font.label * 0.85;
    const keyCols = tpl.card ? 2 : 1;
    const keyH = font.axis + 10 + Math.ceil(keyRows / keyCols) * rowH;
    const keyW = beside ? Math.min(460, fr.plot.w * 0.42) : 0;
    // Room under the key for the neighbours that get no plate: a line or two of names.
    const restH = font.label * 1.3 * 2 + 12;
    const P = {
        x: fr.plot.x, y: fr.plot.y,
        w: fr.plot.w - (keyW ? keyW + 24 : 0),
        h: tpl.H ? fr.plot.h - (beside ? 0 : keyH + 20 + restH) : Math.round(fr.plot.w * 0.8)
    };
    // The map panel: always the estate ground, as UKD draws every map. The projection fits the
    // place itself with a margin, as UKD's focus frames do, so a large neighbour cannot shrink
    // it to a corner; neighbours run to the panel edge and are cut there.
    canvas.rect(P.x, P.y, P.w, P.h, R.ground, `rx="${tokens.radius["radius-sm"].replace("px", "")}"`);
    // Plate sizes depend on text only, so they are known before the projection. Locked
    // across editions: a plate is as wide as the widest value it holds in any of them.
    const valueOf = (code) => (figs[code] ? set.show(o.values[code]) : "no figure");
    const valuesIn = (code) => [valueOf(code), ...(o.lockAcross ?? []).map((m) => (m[code] ? set.show(m[code]) : "no figure"))];
    const plate = (a) => {
        const code = a.properties.code, isFocus = code === o.focus;
        const ns = isFocus ? font.label : font.axis, vs = isFocus ? font.value : font.label;
        const nameFamily = isFocus ? "display" : "sans";
        const pad = Math.round(ns * 0.4);
        const w = Math.max(textWidth(a.properties.name, ns, nameFamily, 600), lockedWidth(valuesIn(code), (s) => textWidth(s, vs, "sans", 600))) + 2 * pad;
        const h = ns + vs + pad * 2 + 4;
        return { a, code, isFocus, ns, vs, nameFamily, pad, w, h };
    };
    const gap = 6;
    /** The projection, the plates and any gutter labels for a map fitted inside M. Draws nothing. */
    const layoutIn = (M, sides) => {
        // All the areas fill the panel, unless that leaves the place under a third of it either
        // way; then the projection fits the place with UKD's margins and the neighbours are cut.
        const pad = Math.max(12, M.w * 0.03);
        let proj = geoMercator().fitExtent([[M.x + pad, M.y + pad], [M.x + M.w - pad, M.y + M.h - pad]], { type: "FeatureCollection", features: areas });
        const [[fx0, fy0], [fx1, fy1]] = geoPath(proj).bounds(focus);
        if ((fx1 - fx0) / M.w < 1 / 3 && (fy1 - fy0) / M.h < 1 / 3) {
            const inset = tpl.key === "inline" ? [0.2, 0.17] : [0.26, 0.2];
            proj = geoMercator().fitExtent([[M.x + M.w * inset[0], M.y + M.h * inset[1]], [M.x + M.w * (1 - inset[0]), M.y + M.h * (1 - inset[1])]], focus);
        }
        const cands = areas.map((a) => ({ ...plate(a), pole: pole(a, proj, P) }));
        cands.sort((p, q) => Number(q.isFocus) - Number(p.isFocus) || q.pole.r - p.pole.r);
        const { placed, unplaced: missed } = placePlates(cands.map((c) => ({
            item: c, w: c.w, h: c.h, anchor: { x: c.pole.x, y: c.pole.y }, r: c.pole.r,
            eligible: c.isFocus || c.pole.r >= Math.min(c.w, c.h) * 0.3,
            always: c.isFocus,
            // A plate may cross a boundary, never leave its own area: its centre stays inside.
            fits: (x, y) => c.pole.inside(x + c.w / 2, y + c.h / 2)
        })), { panel: M, gap, inset: 6 });
        const gutter = [];
        if (sides && missed.length) {
            // Each neighbour with no plate goes to the gutter on its side, its leader starting on
            // a part of its area no plate covers. A leader may cross areas, never a plate or
            // another leader: a label whose leader would is named under the key instead.
            const covered = (x, y) => placed.some((q) => x + 6 > q.x && x < q.x + q.w + 6 && y + 6 > q.y && y < q.y + q.h + 6);
            const items = missed.map((c) => ({ item: c, w: c.w, h: c.h, anchor: leaderAnchor({ x: c.pole.x, y: c.pole.y }, c.pole.bounds, c.pole.inside, covered) }));
            const laid = gutterLabels(items, { panel: P, gap, minY: P.y + 6, maxY: P.y + P.h - 6, inset: 8, only: sides === 1 ? "R" : undefined });
            const boxes = placed.map((q) => ({ x: q.x, y: q.y, w: q.w, h: q.h }));
            const hit = (b) => b.x < P.x + 6 || b.y < P.y + 6 || b.x + b.w > P.x + P.w - 6 || b.y + b.h > P.y + P.h - 6 ||
                boxes.some((q) => b.x < q.x + q.w + gap && b.x + b.w + gap > q.x && b.y < q.y + q.h + gap && b.y + b.h + gap > q.y);
            for (const g of laid) {
                const box = { x: g.x - g.w / 2, y: g.y - g.h / 2, w: g.w, h: g.h };
                const a = g.anchor, b = { x: g.side === "L" ? box.x + box.w : box.x, y: g.y };
                if (hit(box) || boxes.some((q) => segmentHitsBox(a, b, q, 2)) || gutter.some((l) => segmentsCross(a, b, l.a, l.b)))
                    continue;
                boxes.push(box);
                gutter.push({ item: g.item, side: g.side, box, a, b });
            }
        }
        const inGutter = new Set(gutter.map((g) => g.item.code));
        return { proj, placed, gutter, unplaced: missed.map((c) => c.code).filter((code) => !inGutter.has(code)) };
    };
    // Gutter mode keeps a gutter either side for the labels, as UKD's group maps do, and fits
    // the map between them; where two would leave the map under half the panel, one gutter
    // on the right. It is used only when it names more areas on the map than the plain
    // layout, which is otherwise drawn exactly as without the option.
    const plain = layoutIn(P, 0);
    let L = plain;
    if (o.neighbourLabels === "gutter" && plain.unplaced.length) {
        // As wide as the widest plate that missed the map, and a margin either side.
        const gutterW = Math.max(0, ...areas.filter((a) => plain.unplaced.includes(a.properties.code)).map((a) => plate(a).w)) + 16;
        const sides = P.w - 2 * gutterW >= P.w * 0.5 ? 2 : P.w - gutterW >= P.w * 0.5 ? 1 : 0;
        if (sides) {
            const M = sides === 2 ? { x: P.x + gutterW, y: P.y, w: P.w - 2 * gutterW, h: P.h } : { x: P.x, y: P.y, w: P.w - gutterW, h: P.h };
            const withGutters = layoutIn(M, sides);
            if (withGutters.unplaced.length < plain.unplaced.length)
                L = withGutters;
        }
    }
    const path = geoPath(L.proj);
    const clipId = `ek-clip-${esc(o.focus)}-${tpl.key}`;
    canvas.mark("focus outline", R.ink, [R.ground]);
    canvas.add(`<defs><pattern id="ek-na-${esc(o.focus)}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${R.na}"/><rect width="2.5" height="8" fill="${R.naStripe}"/></pattern><clipPath id="${clipId}"><rect x="${n2(P.x)}" y="${n2(P.y)}" width="${n2(P.w)}" height="${n2(P.h)}" rx="${tokens.radius["radius-sm"].replace("px", "")}"/></clipPath></defs>`);
    canvas.add(`<g class="ek-map" clip-path="url(#${clipId})">`);
    for (const a of areas) {
        const code = a.properties.code;
        const f = figs[code];
        const fill = f ? ramp[classOf(f.value)] : `url(#ek-na-${esc(o.focus)})`;
        const d = path(a) ?? "";
        canvas.add(`<path d="${d}" fill="${fill}" stroke="${R.ground}" stroke-width="2" stroke-linejoin="round" data-ek-area="${esc(code)}"${f ? ` data-ek-class="${classOf(f.value)}"` : ' data-ek-na=""'}><title>${esc(`${a.properties.name}: ${f ? set.show(o.values[code]) : "no figure"}`)}</title></path>`);
    }
    const fd = path(focus) ?? "";
    canvas.add(`<path d="${fd}" fill="none" stroke="${R.ground}" stroke-width="7" stroke-linejoin="round"/><path d="${fd}" fill="none" stroke="${R.ink}" stroke-width="3.5" stroke-linejoin="round" data-ek-focus="${esc(o.focus)}"/>`);
    canvas.add(`</g>`);
    const drawPlate = (c, x, y, extra = "") => {
        canvas.add(`<rect x="${n2(x)}" y="${n2(y)}" width="${n2(c.w)}" height="${n2(c.h)}" rx="4" fill="${R.ground}" fill-opacity="0.92"${c.isFocus ? ` stroke="${R.ink}" stroke-width="1.5"` : ""} data-ek-plate="${esc(c.code)}"${extra}/>`);
        canvas.text(x + c.pad, y + c.pad + c.ns * 0.85, c.a.properties.name, { size: c.ns, weight: 600, family: c.nameFamily, fill: R.ink, bg: R.ground });
        canvas.text(x + c.pad, y + c.pad + 4 + c.ns + c.vs * 0.85, valueOf(c.code), { size: c.vs, weight: 600, fill: c.isFocus ? R.ink : R.muted, bg: R.ground, tabular: true });
    };
    for (const p of L.placed)
        drawPlate(p.item, p.x, p.y);
    if (L.gutter.length)
        canvas.mark("gutter leader", R.muted, [R.ground]);
    for (const g of L.gutter) {
        // The leader registers its segment, so no text may sit across it.
        polylineObstacles(canvas, `the leader for ${g.item.a.properties.name}`, [g.a, g.b], 1.25);
        canvas.add(`<g class="ek-gutter" data-ek-side="${g.side}"><line x1="${n2(g.a.x)}" y1="${n2(g.a.y)}" x2="${n2(g.b.x)}" y2="${n2(g.b.y)}" stroke="${R.muted}" stroke-width="1.25" data-ek-leader="${esc(g.item.code)}"/><circle cx="${n2(g.a.x)}" cy="${n2(g.a.y)}" r="2.5" fill="${R.ink}"/>`);
        drawPlate(g.item, g.box.x, g.box.y, ` data-ek-gutter="${g.side}"`);
        canvas.add(`</g>`);
    }
    const unplaced = L.unplaced;
    // The key: one swatch per class with its range, then no figure, then the place.
    const keyX0 = beside ? P.x + P.w + 24 : P.x;
    const keyY0 = beside ? P.y : P.y + P.h + 20;
    const colW = (beside ? keyW : fr.plot.w) / keyCols;
    // Swatches carry a thin edge, so the darkest class still shows as a square on a dark page.
    const edge = ` ${canvas.paint({ stroke: "border-strong" })} stroke-width="1"`;
    const firstFig = figs[o.focus] ?? Object.values(figs)[0];
    canvas.text(keyX0, keyY0 + font.axis, (firstFig?.name ?? firstFig?.label ?? "").trim(), { size: font.axis, weight: 600, fill: "text-muted", bg });
    const rowsIn = [
        ...[...ramp].reverse().map((c, i) => [c, labels[ramp.length - 1 - i], edge]),
        ...(hasNa ? [[`url(#ek-na-${esc(o.focus)})`, "No figure", edge]] : []),
        ["none", focus.properties.name, ` ${canvas.paint({ stroke: "text" })} stroke-width="2.5"`]
    ];
    const perCol = Math.ceil(rowsIn.length / keyCols);
    rowsIn.forEach(([fill, text, stroke], i) => {
        const kx = keyX0 + Math.floor(i / perCol) * colW, ky = keyY0 + font.axis + 10 + (i % perCol) * rowH;
        canvas.add(`<rect x="${n2(kx)}" y="${n2(ky + (rowH - sw) / 2)}" width="${n2(sw)}" height="${n2(sw)}" rx="2" fill="${fill}"${stroke}/>`);
        canvas.obstacle(`the key swatch for ${text}`, { x: kx, y: ky + (rowH - sw) / 2, w: sw, h: sw });
        canvas.text(kx + sw + 10, ky + rowH / 2, text, { size: font.label, fill: "text", bg, baseline: "middle" });
    });
    let ky = keyY0 + keyH;
    // Neighbours with no plate, by name and value, so none is left unnamed.
    const rest = unplaced.map((c) => areas.find((a) => a.properties.code === c)).sort((p, q) => p.properties.name.localeCompare(q.properties.name));
    if (rest.length) {
        const line = `Not labelled on the map: ${rest.map((a) => `${a.properties.name} ${figs[a.properties.code] ? valueOf(a.properties.code) : "(no figure)"}`).join(", ")}.`;
        ky = canvas.para(keyX0, ky + 6, line, beside ? keyW : fr.plot.w, { size: font.label, fill: "text-muted", bg, lineHeight: 1.3, cls: "ek-unlabelled" });
    }
    if (tpl.H && ky > fr.plot.y + fr.plot.h + 4)
        throw new Error(`${o.focus}/${tpl.key}: the key and the unlabelled neighbours run past the map's space`);
    fr.close(Math.max(P.y + P.h, ky));
    const fv = figs[o.focus];
    const alt = o.alt ?? `Map of ${focus.properties.name} and ${areas.length - 1} neighbouring areas, shaded by ${(fv?.label ?? "the figure").toLowerCase()} in ${ramp.length} classes. ${focus.properties.name}: ${fv ? set.show(o.values[o.focus]) : "no figure"}.${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`LocatorMap ${o.focus} ${tpl.key}`, alt);
    const rows = areas
        .map((a) => ({ a, f: figs[a.properties.code] }))
        .sort((p, q) => (q.f?.value ?? -Infinity) - (p.f?.value ?? -Infinity))
        .map(({ a, f }) => [a.properties.name + (a.properties.code === o.focus ? " (this place)" : ""), f ? set.show(o.values[a.properties.code]) : "no figure"]);
    const table = tableTwin({ caption: fr.title ?? (fv?.label ?? "Map"), head: ["Area", fv?.name ?? "Figure"], rows, source: caption });
    if (fr.sourceOutput && o.sourceFormat)
        fr.sourceOutput.sourceHtml += ` ${esc(o.boundaryCredit)}`;
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
