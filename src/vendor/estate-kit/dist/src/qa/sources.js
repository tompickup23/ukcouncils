/** A dist check over one complete HTML page, in document reading order. */
import { JSDOM } from "jsdom";
export function sourceErrors(html) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const errors = [];
    const nodes = [...document.querySelectorAll("[data-ek-source]")].filter(n => !n.closest('[hidden], [aria-hidden="true"], template'));
    const entries = nodes.filter(n => n.dataset.ekSource === "full");
    const full = new Map();
    for (const entry of entries) {
        const id = entry.id;
        if (!id || full.has(id) || [...document.querySelectorAll("[id]")].filter(n => n.id === id).length !== 1)
            errors.push(`${id || "source"}: full entry needs a unique id`);
        else
            full.set(id, entry);
        for (const field of ["publisher", "title", "locator", "date", "url"]) {
            if (!entry.querySelector(`[data-ek-source-field="${field}"]`)?.textContent?.trim())
                errors.push(`${id}: full entry has no ${field}`);
        }
    }
    const used = new Set();
    for (const node of nodes) {
        const kind = node.dataset.ekSource;
        const id = kind === "full" ? node.id : node.dataset.ekSourceId ?? "";
        if (kind !== "full" && kind !== "short") {
            errors.push("unknown source format");
            continue;
        }
        if (kind === "short") {
            if (!full.has(id))
                errors.push(`${id}: short source has no matching full entry on this page`);
            if (!used.has(id))
                errors.push(`${id}: first use of a source must be in full`);
            if (node.querySelector("a")?.getAttribute("href") !== `#${id}`)
                errors.push(`${id}: short source must link to its full entry`);
        }
        used.add(id);
    }
    dom.window.close();
    return errors;
}
/** Throws on a page with a missing entry or a short first use. Call for each dist HTML file. */
export function checkSources(html, page = "page") {
    const errors = sourceErrors(html);
    if (errors.length)
        throw new Error(`${page}: source check failed:\n  ${errors.join("\n  ")}`);
}
