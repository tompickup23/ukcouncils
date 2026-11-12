/**
 * The card package (R566): any kit chart as a 1200x630 and a 1080x1350 card in the estate
 * post card grammar (clawd briefings/uk-network-brand/BRAND-SYSTEM-2026-08-23.md section
 * 5b). The chart draws its own card through the og and portrait templates, so the brand
 * row, the one message and the footer come from one frame; this module renders each format
 * to PNG and checks the grammar on the result before it hands anything back.
 *
 * The grammar, fixed across every brand: the accent rule along the top, the lockup top
 * left, ONE message (the chart's takeaway title), and the footer rule with the domain in
 * the accent on the left and the source on the right. The source names its edition or
 * date, which the figure record requires, so the data date is always on the card.
 *
 * Kit 0.3.0 takes the rest of UKD's card pass (ukdemographics src/lib/map/cards.ts and
 * card-licence.ts at 733eb02): every PNG is palette quantised to 128 colours with no
 * dither (UKD issue I7), and carries an XMP packet with the card's title, the site as
 * creator and credit (never a person), the source in the rights line and the reuse terms,
 * so a reposted download still credits its source. A card can also name its focus element
 * (the highlighted bar, the place on a map or a strip); if the chart did not draw it, the
 * card throws (UKD issue I6).
 */
import { tokens } from "../../generated/tokens.js";
import { DASHES } from "../qa/gates.js";
import { esc } from "../charts/canvas.js";
import { toPalettePng } from "./png.js";
import { CARD_KEYS, TEMPLATES } from "./templates.js";
export const CARD_FORMATS = CARD_KEYS;
const xmlEsc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** The default reuse terms for a site's cards. */
export const cardTerms = (domain) => `This card may be shared and reposted unaltered, with the credit ${domain} kept visible. Please do not crop the source line or alter the figures.`;
/**
 * Rights metadata for a card (IPTC Core in XMP), after UKD's cardXmp(): the title, the site
 * as creator and credit, the source caption in the rights line and the reuse terms. No
 * digital source type is claimed.
 */
export function cardXmp(o) {
    const domain = tokens.sites[o.site ?? "ukdemographics"].domain;
    const year = o.year ?? new Date().getFullYear();
    const rights = `© ${domain} ${year}. ${o.caption}`;
    const terms = o.licence?.terms ?? cardTerms(domain);
    return `<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>` +
        `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
        `<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">` +
        `<dc:title><rdf:Alt><rdf:li xml:lang="x-default">${xmlEsc(o.title)}</rdf:li></rdf:Alt></dc:title>` +
        `<dc:creator><rdf:Seq><rdf:li>${xmlEsc(domain)}</rdf:li></rdf:Seq></dc:creator>` +
        `<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${xmlEsc(rights)}</rdf:li></rdf:Alt></dc:rights>` +
        `<photoshop:Credit>${xmlEsc(domain)}</photoshop:Credit>` +
        (o.licence?.url ? `<xmpRights:WebStatement>${xmlEsc(o.licence.url)}</xmpRights:WebStatement>` : "") +
        `<xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">${xmlEsc(terms)}</rdf:li></rdf:Alt></xmpRights:UsageTerms>` +
        `</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>`;
}
const attr = (tag, name) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
const unescape = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
/** Every way a card SVG breaks the grammar, as plain sentences. Empty when it is sound. */
export function cardErrors(svg, format, site = "ukdemographics") {
    const tpl = TEMPLATES[format];
    const s = tokens.sites[site];
    const errs = [];
    const root = svg.match(/^<svg[^>]*>/)?.[0] ?? "";
    if (attr(root, "width") !== String(tpl.W) || attr(root, "height") !== String(tpl.H))
        errs.push(`${format}: the card is not ${tpl.W}x${tpl.H}`);
    const rule = svg.match(/<rect[^>]*data-ek-card="rule"[^>]*>/)?.[0];
    if (!rule || attr(rule, "y") !== "0" || attr(rule, "width") !== String(tpl.W) || attr(rule, "fill")?.toLowerCase() !== s.bright.toLowerCase())
        errs.push(`${format}: no accent rule along the top`);
    const texts = [...svg.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((m) => ({ a: m[1], text: unescape(m[2]), size: Number(attr(m[1], "font-size")), x: Number(attr(m[1], "x")), y: Number(attr(m[1], "y")) }));
    const lockup = texts.find((t) => /class="ek-lockup"/.test(t.a));
    if (!lockup || lockup.text !== s.name || lockup.y > tpl.H * 0.2)
        errs.push(`${format}: no lockup with "${s.name}" top left`);
    const domain = texts.find((t) => /class="ek-domain"/.test(t.a));
    if (!domain || domain.text !== s.domain || domain.x !== tpl.pad || attr(domain.a, "fill")?.toLowerCase() !== s.bright.toLowerCase())
        errs.push(`${format}: the domain is not on the left of the footer in the accent`);
    const source = texts.filter((t) => /class="ek-source"/.test(t.a));
    if (!source.length || !/^(Fixture, not a published figure\. )?Sources?: /.test(source.map((t) => t.text).join(" ")) || source.some((t) => !/text-anchor="end"/.test(t.a)))
        errs.push(`${format}: the source is not on the right of the footer`);
    const footer = svg.match(/<line[^>]*data-ek-card="footer"[^>]*>/)?.[0];
    if (!footer || !domain || Number(attr(footer, "y1")) > domain.y)
        errs.push(`${format}: no footer rule above the domain and source`);
    for (const t of texts) {
        if (t.size < tpl.minText)
            errs.push(`${format}: "${t.text}" is ${t.size} units, under the ${tpl.minText} floor`);
        if (DASHES.test(t.text))
            errs.push(`${format}: dash in "${t.text}"`);
    }
    return errs;
}
/**
 * One chart as one card: the chart drawn in the format's template, gated, then rasterised
 * to a palette quantised PNG carrying its licence metadata.
 */
export function card(chart, o, format = "og", extras = {}) {
    if (!o.title?.trim())
        throw new Error("a card carries one message: pass the takeaway as title");
    const out = chart({ ...o, sourcePlacement: "drawing", template: format });
    const errs = cardErrors(out.svg, format, o.site);
    if (extras.focus !== undefined && !out.svg.includes(`data-ek-focus="${esc(extras.focus)}"`))
        errs.push(`${format}: the focus "${extras.focus}" is not drawn`);
    if (errs.length)
        throw new Error(`card failed the post card grammar:\n  ${errs.join("\n  ")}`);
    const xmp = cardXmp({ title: out.title, caption: out.caption, site: o.site, licence: extras.licence, year: extras.year });
    return { format, svg: out.svg, png: toPalettePng(out.svg, { xmp }), width: out.width, height: out.height, title: out.title, alt: out.alt, caption: out.caption, table: out.table, xmp };
}
/**
 * One chart as a PNG per theme, for ChartActions: the inline template in hex mode, on its
 * own ground, the source line inside the drawing, palette quantised with the licence
 * metadata. Render these in the build pass and link to them; nothing is drawn in the
 * browser. Write each under chartPngNames(name) from the actions module.
 */
export function chartPngs(chart, o, extras = {}) {
    if (o.template && o.template !== "inline")
        throw new Error("chartPngs draws the inline chart; use card() for a card");
    const site = o.site ?? "ukdemographics";
    const one = (theme) => {
        const out = chart({ ...o, sourcePlacement: "drawing", template: "inline", mode: { kind: "hex", theme, site } });
        const xmp = cardXmp({ title: out.title ?? out.alt, caption: out.caption, site, licence: extras.licence, year: extras.year });
        return { png: toPalettePng(out.svg, { xmp }), svg: out.svg, width: out.width, height: out.height };
    };
    return { light: one("light"), dark: one("dark") };
}
/** The same chart in every card format: 1200x630 for links, 1080x1350 for feeds. */
export function cardSet(chart, o, formats = CARD_FORMATS, extras = {}) {
    return Object.fromEntries(formats.map((f) => [f, card(chart, o, f, extras)]));
}
