/**
 * ChartActions: what a reader can take from a chart, under it. Moved in from
 * ukdemographics src/components/ChartActions.astro (733eb02), with the three changes UK
 * Council Tax A5 section 6.2 lists:
 *
 * 1. PNG. UKD painted the inline SVG onto a canvas in the browser; the kit's inline SVG
 *    paints with CSS custom properties, which an image cannot resolve, so that PNG would
 *    come out black. Instead the build renders one PNG per chart per theme (chartPngs() in
 *    the card entry, in the BUILD_OG=1 pass), and the action is a plain link to each: no
 *    canvas, no script, and the source line is inside the drawing, so it travels with the
 *    file. No watermark: the kit's grammar already carries the domain.
 * 2. Data. A link that opens the chart's table twin, its own data as a table, with "Copy
 *    table" as the one script enhancement (the button is hidden until the script runs, so
 *    a reader without script never meets a dead control). No download control and no file:
 *    a per chart CSV is decision K2.
 * 3. Embed. Not built: it needs static embed routes and a relaxed frame-ancestors rule
 *    (decision K3).
 *
 * UKD's "Copied!" label and its fixed iframe border go; the source text stays in the
 * drawing, never repeated or restyled here.
 */
import { esc } from "../charts/canvas.js";
/** The markup of the actions row. ChartActions.astro renders it and adds the copy script. */
export function chartActionsHtml(o) {
    if (!/^[A-Za-z][\w-]*$/.test(o.twinId))
        throw new Error(`ChartActions: "${o.twinId}" is not a usable id`);
    if (!o.label.trim())
        throw new Error("ChartActions: say what the chart shows (label), for the links' names");
    const label = esc(o.label);
    const links = [];
    if (o.png) {
        for (const theme of ["light", "dark"]) {
            const href = o.png[theme];
            if (!href || /^\s*javascript:/i.test(href))
                throw new Error(`ChartActions: no usable ${theme} PNG path`);
            links.push(`<a class="ek-action" href="${esc(href)}" type="image/png" aria-label="PNG of ${label}, ${theme} theme">PNG, ${theme}</a>`);
        }
    }
    links.push(`<a class="ek-action" href="#${o.twinId}" data-ek-open-twin="${o.twinId}" aria-label="The figures in ${label} as a table">Table</a>`);
    links.push(`<button type="button" class="ek-action" data-ek-copy-table="${o.twinId}" hidden>Copy table</button>`);
    links.push(`<span class="ek-action-status" role="status" aria-live="polite"></span>`);
    return `<div class="ek-actions">${links.join("")}</div>`;
}
/** The PNG file names for a chart, one per theme: "<name>-light.png" and "<name>-dark.png". */
export function chartPngNames(name) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(name))
        throw new Error(`chartPngNames: "${name}" should be lower case letters, digits and hyphens`);
    return { light: `${name}-light.png`, dark: `${name}-dark.png` };
}
