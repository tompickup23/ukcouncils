/**
 * A small SVG writer that records what it draws, so the QA gates can check every piece of
 * text and every mark against the real palette values.
 *
 * Two paint modes. "css" writes colours as CSS custom properties (style="fill:var(--x)"),
 * so the same inline SVG follows the page between light and dark with no script; the gates
 * then run against both themes of every site. "hex" writes plain hex for one theme, for
 * resvg, which cannot read custom properties.
 */
import { deskPalette, palette, skinPalette, DESK_KEYS, SITE_KEYS, SKIN_KEYS } from "../../generated/tokens.js";
import { tokens } from "../../generated/tokens.js";
import { METRICS } from "../../generated/metrics.js";
import { assertGates, emptyChecks } from "../qa/gates.js";
/** True when a render draws on a desk. */
export const onDesk = (mode) => mode.ground === "desk";
export const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const n2 = (v) => (Math.round(v * 100) / 100).toString();
const FAMILY_ATTR = {
    sans: tokens.font.sans.stack.replace(/"/g, "'"),
    display: tokens.font.display.stack.replace(/"/g, "'")
};
/** The face a family and weight draw in. Display has one weight, 600. */
export function faceFor(family, weight) {
    if (family === "display")
        return "display600";
    return weight >= 600 ? "sans600" : "sans400";
}
const advanceTables = new Map();
function advances(face) {
    let t = advanceTables.get(face);
    if (!t) {
        t = new Map();
        for (const [start, run] of METRICS[face].ranges)
            run.forEach((a, i) => t.set(start + i, a));
        advanceTables.set(face, t);
    }
    return t;
}
/**
 * Drawn width in user units, measured from the TTF's own advance widths (cmap and hmtx,
 * read into generated/metrics.ts by scripts/build-metrics.mjs). A character outside the
 * table takes the width of the missing glyph, as resvg would draw it. Kerning is ignored,
 * which only ever makes the measure a little wider than the drawing.
 */
export function textWidth(s, size, family = "sans", weight = 400) {
    const face = faceFor(family, weight);
    const t = advances(face);
    const m = METRICS[face];
    let units = 0;
    for (const ch of String(s))
        units += t.get(ch.codePointAt(0)) ?? m.notdef;
    return (units / m.unitsPerEm) * size;
}
/** Greedy word wrap to a width. */
export function wrap(s, maxW, size, family = "sans", weight = 400) {
    const words = s.split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    for (const w of words) {
        const next = line ? `${line} ${w}` : w;
        if (line && textWidth(next, size, family, weight) > maxW) {
            lines.push(line);
            line = w;
        }
        else
            line = next;
    }
    if (line)
        lines.push(line);
    return lines;
}
export class Canvas {
    parts = [];
    checks = emptyChecks();
    mode;
    W;
    H;
    /** A thumb draws marks only: text draws nothing, and finish() strips titles and hides the SVG. */
    silent = false;
    paras = 0;
    // Written out rather than as parameter properties, so Node can run the kit by type
    // stripping alone (node --experimental-strip-types).
    constructor(mode, W, H) {
        this.mode = mode;
        this.W = W;
        this.H = H;
    }
    /** Paint attributes for fill and stroke in the current mode. */
    paint(p) {
        const out = [];
        const style = [];
        for (const [prop, c] of Object.entries(p)) {
            if (!c)
                continue;
            if (c === "none" || c.startsWith("#"))
                out.push(`${prop}="${c}"`);
            else if (this.mode.kind === "css")
                style.push(`${prop}:var(--${c})`);
            else
                out.push(`${prop}="${hexPalette(this.mode.theme, this.mode.site, this.mode.ground)[c] ?? fail(c)}"`);
        }
        if (style.length)
            out.push(`style="${style.join(";")}"`);
        return out.join(" ");
    }
    add(svg) { this.parts.push(svg); }
    rect(x, y, w, h, fill, extra = "") {
        this.add(`<rect x="${n2(x)}" y="${n2(y)}" width="${n2(w)}" height="${n2(h)}" ${this.paint({ fill })}${extra ? " " + extra : ""}/>`);
    }
    line(x1, y1, x2, y2, stroke, width = 1, extra = "") {
        this.add(`<line x1="${n2(x1)}" y1="${n2(y1)}" x2="${n2(x2)}" y2="${n2(y2)}" ${this.paint({ stroke })} stroke-width="${n2(width)}"${extra ? " " + extra : ""}/>`);
    }
    text(x, y, content, o) {
        if (this.silent)
            return;
        const weight = o.weight ?? 400;
        const family = o.family ?? "sans";
        const anchor = o.anchor ?? "start";
        const w = textWidth(content, o.size, family, weight);
        const left = anchor === "middle" ? x - w / 2 : anchor === "end" ? x - w : x;
        const top = o.baseline === "middle" ? y - o.size * 0.49 : o.baseline === "hanging" ? y : y - o.size * 0.78;
        this.checks.texts.push({ content, size: o.size, weight, fill: o.fill, bg: o.bg, role: o.role, group: o.group, box: { x: left, y: top, w, h: o.size * 0.98 } });
        const attrs = [
            `x="${n2(x)}"`, `y="${n2(y)}"`,
            `font-family="${FAMILY_ATTR[family]}"`, `font-size="${n2(o.size)}"`, `font-weight="${weight}"`,
            o.anchor && o.anchor !== "start" ? `text-anchor="${o.anchor}"` : "",
            o.baseline && o.baseline !== "auto" ? `dominant-baseline="${o.baseline}"` : "",
            o.tabular ? `font-variant-numeric="tabular-nums"` : "",
            o.cls ? `class="${o.cls}"` : "",
            this.paint({ fill: o.fill })
        ].filter(Boolean);
        this.add(`<text ${attrs.join(" ")}>${esc(content)}</text>`);
    }
    /** Wrapped text from a top line; returns the y below the last line. */
    para(x, y, content, maxW, o) {
        const lh = o.size * (o.lineHeight ?? 1.3);
        const lines = wrap(content, maxW, o.size, o.family, o.weight);
        const group = o.group ?? `para${++this.paras}`;
        lines.forEach((l, i) => this.text(x, y + o.size + i * lh, l, { ...o, group }));
        return y + o.size + (lines.length - 1) * lh + (lh - o.size);
    }
    /**
     * Registers display forms the chart took from its figures (or computed from them and
     * says so), so every text drawn with role "value" can be checked against them.
     */
    allow(...shown) { for (const s of shown)
        this.checks.manifest.add(s); }
    /** Scale labels the alt text may use without tripping the ranking gate ("lowest", "highest"). */
    scaleLabels(...labels) { for (const l of labels)
        this.checks.scale.add(l); }
    mark(what, fill, against) { this.checks.marks.push({ what, fill, against }); }
    /** Registers the box a drawn mark fills, so the gates refuse any text that overlaps it. */
    obstacle(what, box) {
        if (this.silent || box.w <= 0 || box.h <= 0)
            return;
        (this.checks.obstacles ??= []).push({ what, box });
    }
    series(what, colours) { if (colours.length > 1)
        this.checks.series.push({ what, colours }); }
    /** Refuse clipped labels after the frame has its final height. */
    assertTextBounds() {
        for (const t of this.checks.texts) {
            const b = t.box;
            if (b && (b.x < 0 || b.y < 0 || b.x + b.w > this.W || b.y + b.h > this.H))
                throw new Error(`text outside the canvas: ${t.content}`);
        }
    }
    /** Runs the gates and returns the finished SVG. */
    finish(what, label, extraAttrs = "", role = "img") {
        if (this.silent) {
            assertGates(this.checks, gatePalettes(this.mode), what);
            const body = this.parts.join("").replace(/<title>[^<]*<\/title>/g, "");
            if (/<text[\s>]/.test(body))
                throw new Error(`${what}: a thumb draws no text`);
            const desk = onDesk(this.mode) ? ' data-ground="desk"' : "";
            return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(this.W)} ${n2(this.H)}" width="${n2(this.W)}" height="${n2(this.H)}" aria-hidden="true" focusable="false" class="ek-chart ek-thumb"${desk}${extraAttrs ? " " + extraAttrs : ""}>${body}</svg>`;
        }
        this.checks.alt = label;
        assertGates(this.checks, gatePalettes(this.mode), what);
        const H = this.H;
        // On a desk the SVG carries the marker itself, so the skin's [data-ground="desk"] rule
        // points its names at the desk wherever the string is inserted.
        const desk = onDesk(this.mode) ? ' data-ground="desk"' : "";
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n2(this.W)} ${n2(H)}" width="${n2(this.W)}" height="${n2(H)}" role="${role}" aria-label="${esc(label)}" class="ek-chart"${desk}${extraAttrs ? " " + extraAttrs : ""}>${this.parts.join("")}</svg>`;
    }
}
function fail(token) {
    throw new Error(`no token "${token}" in the palette`);
}
/**
 * The colours a hex render paints with: the site's skin palette where the site has a
 * skin. A plain record skin's palette equals its site's, so only a site whose skin holds
 * values of its own (Council Intel's paper and text) paints differently.
 */
export function hexPalette(theme, site, ground = "paper") {
    if (ground === "desk")
        return deskPalette(theme, site);
    return SKIN_KEYS.includes(site) ? skinPalette(theme, site) : palette(theme, site);
}
/** A skin whose palette differs from its site's: an editorial skin, or a record skin with values of its own. */
export function skinAddsGround(key) {
    if (!SITE_KEYS.includes(key))
        return true;
    return ["light", "dark"].some((theme) => {
        const site = palette(theme, key), mine = skinPalette(theme, key);
        return Object.entries(site).some(([k, v]) => mine[k] !== v);
    });
}
/**
 * The palettes a render must pass: both themes of every site in css mode, one in hex mode,
 * and on a desk both themes of every skin's desk.
 * Css mode also takes both themes of every skin whose palette is not its site's: the
 * editorial skins, and a record skin with its own paper (Council Intel).
 */
export function gatePalettes(mode) {
    if (mode.kind === "hex")
        return [{ name: `${mode.theme} ${mode.site}${onDesk(mode) ? " desk" : ""}`, pal: hexPalette(mode.theme, mode.site, mode.ground) }];
    // On a desk, css mode is gated against both themes of every skin that has one.
    if (onDesk(mode)) {
        if (!DESK_KEYS.length)
            throw new Error("no skin has a desk to draw on");
        return ["light", "dark"].flatMap((theme) => DESK_KEYS.map((key) => ({ name: `${theme} ${key} desk`, pal: deskPalette(theme, key) })));
    }
    return ["light", "dark"].flatMap((theme) => [
        ...SITE_KEYS.map((site) => ({ name: `${theme} ${site}`, pal: palette(theme, site) })),
        ...SKIN_KEYS.filter(skinAddsGround).map((key) => ({ name: `${theme} ${key} skin`, pal: skinPalette(theme, key) }))
    ]);
}
