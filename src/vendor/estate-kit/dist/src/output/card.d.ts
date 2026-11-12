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
import { type SiteKey } from "../../generated/tokens.js";
import type { ChartOptions, ChartOutput } from "../charts/frame.js";
export type CardFormat = "og" | "portrait";
export declare const CARD_FORMATS: CardFormat[];
export interface Card {
    format: CardFormat;
    svg: string;
    png: Buffer;
    width: number;
    height: number;
    /** The one message on the card. */
    title: string;
    alt: string;
    caption: string;
    /** The table twin, for the page or post the card goes with. */
    table: string;
    /** The XMP packet embedded in the PNG. */
    xmp: string;
}
export interface CardLicence {
    /** The page that states the card reuse terms. Written as the web statement when given; never invented. */
    url?: string;
    /** The reuse terms. Defaults to sharing unaltered with the credit and the source line kept. */
    terms?: string;
}
export interface CardExtras {
    /**
     * The focus element the card must draw: the value of a data-ek-focus attribute (a
     * highlighted bar's label, a bill part's key, a map's focus code, a strip's place).
     * The card throws if the chart did not draw it.
     */
    focus?: string;
    licence?: CardLicence;
    /** The year in the rights line. Defaults to the current year. */
    year?: number;
}
/** The default reuse terms for a site's cards. */
export declare const cardTerms: (domain: string) => string;
/**
 * Rights metadata for a card (IPTC Core in XMP), after UKD's cardXmp(): the title, the site
 * as creator and credit, the source caption in the rights line and the reuse terms. No
 * digital source type is claimed.
 */
export declare function cardXmp(o: {
    title: string;
    caption: string;
    site?: SiteKey;
    licence?: CardLicence;
    year?: number;
}): string;
/** Every way a card SVG breaks the grammar, as plain sentences. Empty when it is sound. */
export declare function cardErrors(svg: string, format: CardFormat, site?: SiteKey): string[];
/**
 * One chart as one card: the chart drawn in the format's template, gated, then rasterised
 * to a palette quantised PNG carrying its licence metadata.
 */
export declare function card<O extends ChartOptions>(chart: (o: O) => ChartOutput, o: O, format?: CardFormat, extras?: CardExtras): Card;
/**
 * One chart as a PNG per theme, for ChartActions: the inline template in hex mode, on its
 * own ground, the source line inside the drawing, palette quantised with the licence
 * metadata. Render these in the build pass and link to them; nothing is drawn in the
 * browser. Write each under chartPngNames(name) from the actions module.
 */
export declare function chartPngs<O extends ChartOptions>(chart: (o: O) => ChartOutput, o: O, extras?: Omit<CardExtras, "focus">): Record<"light" | "dark", {
    png: Buffer;
    svg: string;
    width: number;
    height: number;
}>;
/** The same chart in every card format: 1200x630 for links, 1080x1350 for feeds. */
export declare function cardSet<O extends ChartOptions>(chart: (o: O) => ChartOutput, o: O, formats?: CardFormat[], extras?: CardExtras): Record<CardFormat, Card>;
