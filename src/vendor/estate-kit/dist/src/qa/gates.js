/**
 * The QA gates every kit output passes before it is returned. They are the gates of the
 * UK Demographics map renderer (ukdemographics src/lib/map/render.ts), lifted so every
 * chart runs them: text contrast at WCAG 2 AA (4.5:1, or 3:1 for large text), marks at
 * 3:1 against their ground (WCAG 1.4.11), series pairs apart under the three colour vision
 * simulations, and no dash in any visible text. A failure throws, so an unreadable chart
 * cannot be built.
 *
 * Kit 0.3.0 adds the rest of that renderer's qa() (render.ts lines 503 to 573 at 733eb02):
 * every drawn value must be in the chart's manifest character for character; no two text
 * boxes may overlap, measured from the fonts' own advance widths; and no ranking or loaded
 * word in a title or the alt text. Scale labels ("lowest", "highest") label a scale, not an
 * area, so the alt text may name them.
 *
 * Kit 0.4.0 adds text against marks: a chart registers the boxes its marks fill, and no
 * text box may overlap one. UK Council Tax's band bars shipped a Band D label with its last
 * digit under the next bar, which the text against text check could not see.
 */
import { contrast, seenDistance, VISIONS } from "./colour.js";
/** The dash pattern of the map renderer: em dash, en dash, a spaced hyphen, the entities. */
export const DASHES = /[\u2013\u2014]| - |&mdash;|&ndash;/; // dash-ok: the pattern itself
/** No ranking language in a title or the alt text: areas are never ordered by a value. */
export const RANKING_WORDS = /\b(highest|lowest|fastest|slowest|most|least|top|bottom|largest|smallest|biggest|ranked|ranking|rank|league)\b/i;
/** Neutral verbs: a share "fell" or "rose", nothing more. */
export const LOADED_WORDS = /\b(spread|spreading|replaced|replacement|influx|flood|swamp\w*|invasion|takeover|overrun|surge|plummet\w*|soar\w*)\b/i;
/** OKLab distance two series must keep under every vision (ukdemographics tests/ethnic-palette.test.ts). */
export const MIN_SERIES_DISTANCE = 0.09;
export const MIN_MARK_CONTRAST = 3;
export const emptyChecks = () => ({ texts: [], marks: [], series: [], obstacles: [], manifest: new Set(), scale: new Set() });
const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
/** Ranking or loaded words in a string, with the given scale labels taken out first. */
export function wordErrors(text, where, scale = []) {
    let t = text;
    for (const l of [...scale].sort((a, b) => b.length - a.length))
        t = t.split(l).join(" ");
    const errs = [];
    if (RANKING_WORDS.test(t))
        errs.push(`ranking word "${t.match(RANKING_WORDS)[0]}" in ${where}: "${text}"`);
    if (LOADED_WORDS.test(t))
        errs.push(`loaded word "${t.match(LOADED_WORDS)[0]}" in ${where}: "${text}"`);
    return errs;
}
/**
 * The checks that do not depend on the palette: values in the manifest, overlapping text,
 * and the words of titles and alt text.
 */
export function layoutErrors(checks) {
    const errs = [];
    for (const t of checks.texts) {
        if (t.role === "value" && !checks.manifest.has(t.content))
            errs.push(`value "${t.content}" not in the manifest`);
    }
    const titles = new Map();
    for (const t of checks.texts.filter((x) => x.role === "title")) {
        const k = t.group ?? t.content;
        titles.set(k, [...(titles.get(k) ?? []), t.content]);
    }
    for (const lines of titles.values())
        errs.push(...wordErrors(lines.join(" "), "the title"));
    if (checks.alt)
        errs.push(...wordErrors(checks.alt, "the alt text", checks.scale));
    const boxed = checks.texts.filter((t) => t.box && t.content.trim());
    for (let i = 0; i < boxed.length; i++)
        for (let j = i + 1; j < boxed.length; j++) {
            const a = boxed[i], b = boxed[j];
            if (a.group && a.group === b.group)
                continue;
            if (overlap(a.box, b.box))
                errs.push(`text overlaps: "${a.content}" and "${b.content}"`);
        }
    // A label under a mark is drawn over and read short: "£2,549.42" under the next bar
    // reads "£2,549.4". Text against text was the only overlap checked before kit 0.4.0.
    for (const a of boxed)
        for (const m of checks.obstacles ?? []) {
            if (overlap(a.box, m.box))
                errs.push(`text over a mark: "${a.content}" and ${m.what}`);
        }
    return errs;
}
export const resolve = (c, pal) => {
    if (c.startsWith("#"))
        return c;
    const hex = pal[c];
    if (!hex)
        throw new Error(`no token "${c}" in the palette`);
    return hex;
};
/** The contrast a piece of text needs: large text (24 units, or 18.66 at 600) needs 3. */
export const textNeed = (size, weight) => (size >= 24 || (size >= 18.66 && weight >= 600) ? 3 : 4.5);
/** Every failure for one palette. `name` says which theme and site, for the message. */
export function gateErrors(checks, pal, name) {
    const errs = [];
    for (const t of checks.texts) {
        if (DASHES.test(t.content))
            errs.push(`dash in "${t.content}"`);
        const fg = resolve(t.fill, pal), bg = resolve(t.bg, pal);
        const c = contrast(fg, bg), need = textNeed(t.size, t.weight);
        if (c < need)
            errs.push(`${name}: text contrast ${c.toFixed(2)} < ${need} for "${t.content}" (${fg} on ${bg})`);
    }
    for (const m of checks.marks) {
        const fg = resolve(m.fill, pal);
        for (const a of m.against) {
            const bg = resolve(a, pal), c = contrast(fg, bg);
            if (c < MIN_MARK_CONTRAST)
                errs.push(`${name}: ${m.what} contrast ${c.toFixed(2)} < ${MIN_MARK_CONTRAST} (${fg} on ${bg})`);
        }
    }
    for (const s of checks.series) {
        const hex = s.colours.map((c) => resolve(c, pal));
        for (const v of VISIONS)
            for (let i = 0; i < hex.length; i++)
                for (let j = i + 1; j < hex.length; j++) {
                    const d = seenDistance(hex[i], hex[j], v);
                    if (d < MIN_SERIES_DISTANCE)
                        errs.push(`${name}: ${s.what} ${s.colours[i]} and ${s.colours[j]} are ${d.toFixed(3)} apart under ${v} vision, below ${MIN_SERIES_DISTANCE}`);
                }
    }
    return [...new Set(errs)];
}
/** Runs the gates against every palette and throws with every failure listed. */
export function assertGates(checks, palettes, what) {
    const errs = [...new Set([...layoutErrors(checks), ...palettes.flatMap((p) => gateErrors(checks, p.pal, p.name))])];
    if (errs.length)
        throw new Error(`QA failed for ${what}:\n  ${errs.join("\n  ")}`);
}
