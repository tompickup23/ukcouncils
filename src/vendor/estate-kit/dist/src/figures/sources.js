import { esc } from "../charts/canvas.js";
export function linkedSource(source) {
    const s = source;
    if (!/^[A-Za-z][A-Za-z0-9_.:-]*$/.test(s.id ?? ""))
        throw new Error("source.id is required for a linked source");
    for (const key of ["publisher", "title", "url"]) {
        if (!s[key]?.trim())
            throw new Error(`source.${key} is required for a linked source`);
    }
    if (!s.table?.trim() && !s.page?.trim())
        throw new Error("a linked source needs a table or page");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s.publicationDate ?? "") || !Number.isFinite(Date.parse(s.publicationDate)) ||
        new Date(s.publicationDate).toISOString().slice(0, 10) !== s.publicationDate) {
        throw new Error("source.publicationDate must be an ISO calendar date");
    }
    if (!/^https?:\/\//i.test(s.url))
        throw new Error("source.url must be an HTTP or HTTPS URL");
    return s;
}
export function shortSourceText(source) {
    const s = linkedSource(source);
    return `${s.publisher}, ${s.table ?? s.page}, ${s.publicationDate.slice(0, 4)}`;
}
const fixtureLead = (fixture) => fixture ? "Fixture, not a published figure. " : "";
/** A full first citation, with an anchor later short citations can link to. */
export function sourceEntryHtml(source, fixture = false) {
    const s = linkedSource(source);
    const field = (name, value) => `<span data-ek-source-field="${name}">${esc(value)}</span>`;
    return `<span id="${esc(s.id)}" data-ek-source="full">${fixtureLead(fixture)}Source: ` +
        [field("publisher", s.publisher), field("title", s.title), field("locator", [s.table, s.page].filter(Boolean).join(", ")), field("date", s.publicationDate), `<a data-ek-source-field="url" href="${esc(s.url)}">${esc(s.url)}</a>`].join(", ") + ".</span>";
}
/** A short citation. The page checker requires its full entry to precede it. */
export function shortSourceHtml(source, fixture = false) {
    const s = linkedSource(source);
    return `<span data-ek-source="short" data-ek-source-id="${esc(s.id)}">${fixtureLead(fixture)}Source: <a href="#${esc(s.id)}">${esc(shortSourceText(s))}</a>.</span>`;
}
export function sourceLinesHtml(figures, format) {
    const seen = new Map();
    for (const f of figures) {
        const s = linkedSource(f.source);
        const previous = seen.get(s.id);
        if (previous && JSON.stringify(previous.source) !== JSON.stringify(s))
            throw new Error(`${s.id}: conflicting full sources`);
        seen.set(s.id, { source: s, fixture: !!f.fixture || !!previous?.fixture });
    }
    return [...seen.values()].map(({ source, fixture }) => format === "short" ? shortSourceHtml(source, fixture) : sourceEntryHtml(source, fixture)).join(" ");
}
