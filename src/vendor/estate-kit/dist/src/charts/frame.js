/**
 * The frame around every chart: title, plot area, source line, and on cards the post card
 * grammar (BRAND-SYSTEM-2026-08-23.md section 5b): the accent rule along the top, the
 * lockup top left, one message, and the footer rule with the domain in the accent on the
 * left and the source, which ends with its edition or date, on the right. Charts draw only
 * inside the plot rectangle this hands them.
 */
import { tokens } from "../../generated/tokens.js";
import { TEMPLATES } from "../output/templates.js";
import { markSvg } from "../output/marks.js";
import { Canvas, esc, hexPalette, onDesk, textWidth, wrap } from "./canvas.js";
import { sourceLinesHtml } from "../figures/sources.js";
import { currentFigures } from "../figures/figures.js";
/** Replaces {key} and {key:form} with a figure's display form, so prose never types a number. */
export function fillSlots(text, set) {
    return text.replace(/\{([a-z0-9_.]+)(?::(full|round|short))?\}/gi, (_, key, form) => set.show(key, form ?? "full"));
}
/**
 * Lays out header and footer and hands back the plot rectangle. For inline the plot
 * height is the chart's own need; for a card it is what the fixed canvas leaves.
 */
export function frame(o, caption, plotNeed, thumbForm, figures = []) {
    const tpl = TEMPLATES[o.template ?? "inline"];
    if (tpl.thumb && !thumbForm)
        throw new Error("this chart has no thumb form: only ZeroBar, Waffle, BillAnatomy and PositionStrip draw the 160 by 64 thumb");
    const set = currentFigures(o.set);
    const site = o.site ?? "ukdemographics";
    const mode = tpl.card ? { kind: "hex", theme: "dark", site } : withGround(o.mode ?? { kind: "css" }, o.ground);
    const htmlSource = !tpl.card && !tpl.thumb && mode.kind === "css" && o.sourcePlacement === "html";
    const sourceOutput = htmlSource ? { sourceHtml: o.sourceFormat ? sourceLinesHtml(figures, o.sourceFormat) : esc(caption) } : undefined;
    const title = o.title ? fillSlots(o.title, set) : undefined;
    if (tpl.card && !title)
        throw new Error("a card needs a title: the takeaway sentence");
    const canvas = new Canvas(mode, tpl.W, tpl.H || 1);
    if (tpl.thumb) {
        // Marks only: no title, no footer, the whole canvas less a hairline pad for the plot.
        canvas.silent = true;
        const plot = { x: tpl.pad, y: tpl.pad, w: tpl.W - tpl.pad * 2, h: tpl.H - tpl.pad * 2 };
        const close = () => {
            if (mode.kind === "hex" || onDesk(mode)) {
                canvas.rect(0, 0, canvas.W, canvas.H, "bg");
                canvas.parts.unshift(canvas.parts.pop());
            }
        };
        return { canvas, tpl, plot, bg: "bg", set, title: undefined, close };
    }
    const bg = "bg";
    const f = tpl.font;
    const innerW = tpl.W - tpl.pad * 2;
    let y = tpl.pad;
    if (tpl.card) {
        canvas.rect(0, 0, tpl.W, tpl.H, bg);
        canvas.rect(0, 0, tpl.W, Math.round(tpl.H * 0.013), "accent-bright", 'data-ek-card="rule"');
        // The lockup: the mark, then the name in the display face, as the brand build draws it.
        const markH = Math.round(f.brand * 1.56);
        const mark = markSvg(site, tpl.pad, y, markH, hexPalette("dark", site).bg);
        if (mark)
            canvas.add(mark);
        canvas.text(tpl.pad + (mark ? markH * 1.26 : 0), y + markH / 2 + f.brand * 0.35, tokens.sites[site].name, { size: f.brand, weight: 600, family: "display", fill: "text", bg, cls: "ek-lockup" });
        y += markH + Math.round(f.brand * 0.9);
    }
    if (title) {
        y = canvas.para(tpl.pad, y, title, innerW, { size: f.title, weight: 600, family: "display", fill: "text", bg, lineHeight: 1.2, role: "title", group: "title" });
        y += tpl.card ? 20 : 16;
    }
    // Cards: the domain takes the left of the footer and the source wraps on the right of it.
    const domain = tokens.sites[site].domain;
    const domainW = tpl.card ? textWidth(domain, f.source, "sans", 600) + f.source * 1.5 : 0;
    const footW = tpl.card ? innerW - domainW : innerW;
    const footLines = wrap(caption, footW, f.source);
    const footPad = tpl.card ? Math.round(f.source * 0.8) : 0;
    const footH = (tpl.card ? footPad + 14 : 18) + footLines.length * f.source * 1.3;
    const plotH = tpl.H ? tpl.H - y - footH - tpl.pad : plotNeed;
    const plot = { x: tpl.pad, y, w: innerW, h: plotH };
    const close = (plotBottom) => {
        let fy = (tpl.H ? tpl.H - tpl.pad - footH : plotBottom) + 14;
        if (tpl.card) {
            canvas.line(tpl.pad, fy, tpl.W - tpl.pad, fy, "border", 2, 'data-ek-card="footer"');
            fy += footPad;
            canvas.text(tpl.pad, fy + f.source, domain, { size: f.source, weight: 600, fill: "accent-bright", bg, cls: "ek-domain" });
            footLines.forEach((l, i) => canvas.text(tpl.W - tpl.pad, fy + f.source + i * f.source * 1.3, l, { size: f.source, fill: "text-muted", bg, anchor: "end", cls: "ek-source" }));
            return;
        }
        const end = htmlSource ? plotBottom : canvas.para(tpl.pad, fy, caption, footW, { size: f.source, fill: "text-muted", bg, lineHeight: 1.3 });
        if (!tpl.H)
            canvas.H = end + tpl.pad;
        // A hex render outside a card has no page behind it, so it paints its own ground;
        // otherwise a dark theme PNG would land transparent and its light text vanish.
        // So does a chart on a desk, so its light text never lands on the paper.
        if (mode.kind === "hex" || onDesk(mode)) {
            canvas.rect(0, 0, canvas.W, canvas.H, bg);
            canvas.parts.unshift(canvas.parts.pop());
        }
    };
    return { canvas, tpl, plot, bg, set, title, close, sourceOutput };
}
/** The paint mode with the chart's ground on it; a ground on the mode itself wins. */
export function withGround(mode, ground) {
    return ground && !mode.ground ? { ...mode, ground } : mode;
}
export const NICE_STEPS = [1, 2, 2.5, 5, 10];
/** A round ceiling at or above max, so the top gridline is a readable number. */
export function niceMax(max) {
    if (max <= 0)
        return 1;
    const mag = 10 ** Math.floor(Math.log10(max));
    for (const s of NICE_STEPS)
        if (s * mag >= max)
            return s * mag;
    return 10 * mag;
}
