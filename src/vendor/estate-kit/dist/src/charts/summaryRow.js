/** A wrapping row of facts. Each drawing runs the same gates as the charts. */
import { Canvas, esc, textWidth, wrap } from "./canvas.js";
import { statTileParts } from "./statTile.js";
import { currentFigures } from "../figures/figures.js";
import { sourceLinesHtml } from "../figures/sources.js";
/** Returns only present facts. Invalid figure keys still fail; they are not missing data. */
export function summaryRowTiles(o) {
    if (o.facts.length < 3 || o.facts.length > 6)
        throw new Error("a summary row takes three to six facts");
    const set = currentFigures(o.set);
    const present = o.facts.filter((f) => f.figure !== undefined && f.figure !== null);
    const W = 240, pad = 16, inner = W - pad * 2;
    const parts = present.map(f => statTileParts({ ...f, set }));
    // Shared label height keeps the figures aligned even when one label wraps.
    const labelHeight = Math.max(0, ...parts.map(p => wrap(p.label, inner, 18, "sans", 600).length * 23.4));
    return parts.map((p, i) => {
        const canvas = new Canvas(o.mode ?? { kind: "css" }, W, 1);
        const bg = "accent-wash";
        const mark = { x: pad, y: pad, w: 32, h: 3 };
        canvas.rect(mark.x, mark.y, mark.w, mark.h, "accent");
        canvas.mark("summary rule", "accent", [bg]);
        canvas.obstacle("summary rule", mark);
        canvas.para(pad, pad + 14, p.label, inner, { size: 18, weight: 600, fill: "text-muted", bg });
        let y = pad + 14 + labelHeight + 12;
        const size = Math.min(42, inner / textWidth(p.value, 1, "display", 600));
        canvas.allow(p.value);
        canvas.text(pad, y + size * 0.86, p.value, { size, weight: 600, family: "display", fill: "text", bg, role: "value" });
        y += size + 12;
        if (p.perspective)
            y = canvas.para(pad, y, p.perspective, inner, { size: 16, fill: "text", bg });
        // For a hex export the full source travels inside the drawing.
        if (canvas.mode.kind === "hex")
            y = canvas.para(pad, y + 8, p.caption, inner, { size: 14, fill: "text-muted", bg });
        canvas.H = y + pad;
        canvas.rect(0, 0, W, canvas.H, bg);
        canvas.parts.unshift(canvas.parts.pop());
        for (const t of canvas.checks.texts) {
            if (t.box && (t.box.x < 0 || t.box.x + t.box.w > W))
                throw new Error("summary text exceeds the tile width");
        }
        return {
            figure: present[i].figure,
            label: p.label,
            value: p.value,
            svg: canvas.finish(`Summary fact ${present[i].figure}`, `${p.label}: ${p.value}.${p.perspective ? ` ${p.perspective}` : ""}`),
            sourceHtml: canvas.mode.kind === "hex" ? "" : sourceLinesHtml(p.keys.map(k => set.get(k)), "short")
        };
    });
}
export function summaryRowHtml(o) {
    const tiles = summaryRowTiles(o);
    if (!tiles.length)
        return "";
    return `<div class="ek-summary" role="list">${tiles.map(t => `<div class="ek-summary-fact" role="listitem" data-fact data-figure="${esc(t.figure)}">${t.svg}${t.sourceHtml ? `<p class="ek-source">${t.sourceHtml}</p>` : ""}</div>`).join("")}</div>`;
}
