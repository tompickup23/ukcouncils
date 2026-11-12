/**
 * StatTile: one figure, what it counts, a perspective clause and its source. Lifted from
 * UK Council Tax Fact.astro and SourceLine.astro, where the source is a required prop so a
 * figure cannot be placed without one. Two things are added for the kit: the source comes
 * from the figure record, so it cannot be left off at all, and a perspective clause is
 * required on any money figure (clawd .claude/rules/dataviz.md: a headline pound figure
 * carries a per household or share of budget clause), unless the caller states why not.
 *
 * statTileParts() gives the strings for the HTML tile; statTile() draws the same tile as
 * SVG for cards and film plates.
 */
import { n2, textWidth, wrap } from "./canvas.js";
import { frame, fillSlots } from "./frame.js";
import { tableTwin } from "./table.js";
import { sourceLinesHtml } from "../figures/sources.js";
import { currentFigures } from "../figures/figures.js";
const slotKeys = (text) => [...text.matchAll(/\{([a-z0-9_.]+)(?::(?:full|round|short))?\}/gi)].map((m) => m[1]);
/** The checked strings of a tile. Throws if a money figure has no perspective and no stated reason. */
export function statTileParts(o, set = currentFigures(o.set), hasSlot = false) {
    const f = set.value(o.figure);
    if ((f.unit === "gbp" || f.unit === "pence") && !o.perspective && !hasSlot && !o.perspectiveWaived) {
        throw new Error(`${o.figure}: a money figure needs a perspective clause (per household, or share of budget), or perspectiveWaived with the reason`);
    }
    if (o.perspective && /\d/.test(o.perspective.replace(/\{[^}]*\}/g, ""))) {
        throw new Error(`${o.figure}: the perspective clause types a number; take it by key with a {figure.key} slot`);
    }
    const keys = [o.figure, ...(o.perspective ? slotKeys(o.perspective) : [])];
    return {
        label: o.label ?? f.label,
        value: set.show(o.figure),
        perspective: o.perspective ? fillSlots(o.perspective, set) : undefined,
        caption: set.caption(keys),
        captionHtml: o.sourceFormat ? sourceLinesHtml(keys.map(k => set.get(k)), o.sourceFormat) : set.captionHtml(keys),
        keys
    };
}
export function statTile(o) {
    const set = currentFigures(o.set);
    const parts = statTileParts(o, set);
    const fr = frame({ ...o, set }, parts.caption, 0, undefined, parts.keys.map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    // The figure takes the template's stat size, or less if that would run past the plot.
    const stat = Math.min(font.stat, fr.plot.w / textWidth(parts.value, 1, "display", 600));
    // On a card the tile is the one message, so the block sits in the middle of the space.
    const lines = (s, size, weight = 400) => (s ? wrap(s, fr.plot.w, size, "sans", weight).length * size * 1.3 : 0);
    const blockH = lines(parts.label, font.statLabel, 600) + 8 + stat + 6 + lines(parts.perspective, font.perspective);
    let y = tpl.card ? fr.plot.y + Math.max(0, (fr.plot.h - blockH) / 2) : fr.plot.y;
    y = canvas.para(fr.plot.x, y, parts.label, fr.plot.w, { size: font.statLabel, weight: 600, fill: "text-muted", bg });
    y += 8;
    canvas.allow(parts.value);
    canvas.text(fr.plot.x, y + stat * 0.86, parts.value, { size: stat, weight: 600, family: "display", fill: "text", bg, tabular: true, role: "value" });
    y += stat + 6;
    if (parts.perspective)
        y = canvas.para(fr.plot.x, y, parts.perspective, fr.plot.w, { size: font.perspective, fill: "text", bg });
    fr.close(y + 4);
    const alt = o.alt ?? `${parts.label}: ${parts.value}.${parts.perspective ? " " + parts.perspective + "." : ""}`;
    const svg = canvas.finish(`StatTile ${o.figure} ${tpl.key}`, alt);
    const table = tableTwin({ caption: parts.label, head: ["", "Figure"], rows: [[parts.label, parts.value]], source: parts.caption });
    return { ...fr.sourceOutput, svg, table, alt, caption: parts.caption, title: fr.title, width: canvas.W, height: canvas.H };
}
export function scoreCard(o) {
    const set = currentFigures(o.set);
    const max = o.max ?? 100;
    if (o.rows.length < 1 || o.rows.length > 8)
        throw new Error(`ScoreCard draws 1 to 8 rounds; ${o.rows.length} given`);
    const played = o.rows.filter((r) => r.figure);
    if (!played.length)
        throw new Error("ScoreCard needs at least one round played");
    const scores = o.rows.map((r) => {
        if (!r.figure)
            return null;
        const f = set.value(r.figure);
        if (f.unit !== "count" && f.unit !== "index")
            throw new Error(`${r.figure}: a score is a count or an index, and this figure is in ${f.unit}`);
        if (!Number.isInteger(f.value) || f.value < 0 || f.value > max)
            throw new Error(`${r.figure}: a score must be a whole number from 0 to ${max}`);
        return f.value;
    });
    const keys = played.map((r) => r.figure);
    const total = scores.reduce((s, v) => s + (v ?? 0), 0);
    const outOf = played.length * max;
    const skipped = o.rows.length - played.length;
    const caption = set.caption(keys);
    const fr = frame({ ...o, set }, caption, 0, undefined, keys.map(k => set.get(k)));
    const { canvas, tpl, bg } = fr;
    const font = tpl.font;
    const P = fr.plot;
    const labelH = wrap(o.label, P.w, font.statLabel, "sans", 600).length * font.statLabel * 1.3;
    // On a card the rows close up, down to 1.4 lines each, so the rounds and the smallest
    // total still fit above the footer; the overlap gate fails the card if they do not.
    const fixed = labelH + 8 + 6 + font.perspective * 1.3 + 16 + font.value * 1.6 + 8;
    const rowH = tpl.card ? Math.max(font.label * 1.4, Math.min(font.label * 2, (P.h - fixed) / o.rows.length)) : font.label * 2;
    const rowsH = o.rows.length * rowH;
    const restLine = skipped ? `${played.length} of ${o.rows.length} rounds played, ${skipped} skipped.` : `All ${o.rows.length} rounds played.`;
    const stat = tpl.card
        ? Math.max(font.value * 1.6, Math.min(font.stat * 0.75, P.h - labelH - rowsH - font.perspective * 1.6 - 40))
        : font.stat * 0.8;
    // The total is the sum of the rounds played, computed here and printed as such.
    const totalText = String(total);
    canvas.allow(totalText);
    const ofText = `of ${outOf}`;
    let y = P.y;
    y = canvas.para(P.x, y, o.label, P.w, { size: font.statLabel, weight: 600, fill: "text-muted", bg });
    y += 8;
    canvas.text(P.x, y + stat * 0.86, totalText, { size: stat, weight: 600, family: "display", fill: "text", bg, tabular: true, cls: "ek-score-total", role: "value" });
    canvas.text(P.x + textWidth(totalText, stat, "display", 600) + stat * 0.18, y + stat * 0.86, ofText, { size: Math.max(font.value, stat * 0.36), fill: "text-muted", bg, tabular: true });
    y += stat + 6;
    y = canvas.para(P.x, y, restLine, P.w, { size: font.perspective, fill: "text", bg });
    y += 16;
    // The rounds: name on the left, the bar in the middle, the score on the right.
    const nameW = Math.min(P.w * 0.42, Math.max(...o.rows.map((r) => textWidth(r.label, font.label))) + 12);
    const scoreW = textWidth("Skipped", font.label, "sans", 600) + 12;
    const x0 = P.x + nameW;
    const trackW = P.w - nameW - scoreW;
    const barH = Math.min(font.label * 0.9, rowH * 0.5);
    canvas.mark("score bar", "accent", [bg, "bg-subtle"]);
    canvas.add(`<g class="ek-scores" data-ek-total="${total}" data-ek-out-of="${outOf}">`);
    o.rows.forEach((r, i) => {
        const cy = y + i * rowH + rowH / 2;
        const name = wrap(r.label, nameW - 12, font.label)[0] + (wrap(r.label, nameW - 12, font.label).length > 1 ? "…" : "");
        canvas.text(P.x, cy, name, { size: font.label, fill: "text", bg, baseline: "middle" });
        canvas.add(`<rect x="${n2(x0)}" y="${n2(cy - barH / 2)}" width="${n2(trackW)}" height="${n2(barH)}" rx="${n2(barH / 2)}" ${canvas.paint({ fill: "bg-subtle", stroke: "border" })}/>`);
        // The track holds the score bar, so one box covers both.
        canvas.obstacle(`the score track for ${r.label}`, { x: x0, y: cy - barH / 2, w: trackW, h: barH });
        const v = scores[i];
        if (v === null) {
            canvas.text(P.x + P.w, cy, "Skipped", { size: font.label, fill: "text-muted", bg, baseline: "middle", anchor: "end" });
            return;
        }
        const end = x0 + (v / max) * trackW;
        if (v > 0)
            canvas.add(`<rect x="${n2(x0)}" y="${n2(cy - barH / 2)}" width="${n2(end - x0)}" height="${n2(barH)}" rx="${n2(barH / 2)}" ${canvas.paint({ fill: "accent" })} data-ek-score="" data-value="${v}" data-base="${n2(x0)}" data-end="${n2(end)}"/>`);
        const shown = set.show(r.figure);
        canvas.allow(shown);
        canvas.text(P.x + P.w, cy, shown, { size: font.label, weight: 600, fill: "text", bg, baseline: "middle", anchor: "end", tabular: true, role: "value" });
    });
    canvas.add(`</g>`);
    canvas.line(x0, y + 4, x0, y + rowsH - 4, "border-strong", 1.5, `data-ek-zero="${n2(x0)}"`);
    y += rowsH;
    fr.close(y);
    const alt = o.alt ?? `${o.label}: ${total} of ${outOf}. ${o.rows.map((r, i) => `${r.label} ${scores[i] === null ? "skipped" : scores[i]}`).join(", ")}.${fr.title ? " " + fr.title : ""}`;
    const svg = canvas.finish(`ScoreCard ${tpl.key}`, alt);
    const table = tableTwin({
        caption: o.label,
        head: ["Round", `Score out of ${max}`],
        rows: [...o.rows.map((r, i) => [r.label, scores[i] === null ? "Skipped" : String(scores[i])]), ["Total", `${total} of ${outOf}`]],
        source: caption
    });
    return { ...fr.sourceOutput, svg, table, alt, caption, title: fr.title, width: canvas.W, height: canvas.H };
}
