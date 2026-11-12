/**
 * Output templates: canvas size and the type size of every text element, in SVG user
 * units. The idea is the UK Demographics map templates (ukdemographics
 * src/lib/map/templates.ts): one drawing, laid out per surface.
 *
 * inline is the site chart: a 600 unit viewBox scaled to the page column, its height
 * following its content. Values are 26 units, so they draw at about 15 CSS px in a 343 px
 * phone column; nothing that carries meaning is under 19 units (about 11 px there).
 *
 * og (1200x630) and portrait (1080x1350) are the cards, in the estate post card grammar
 * (clawd briefings/uk-network-brand/BRAND-SYSTEM-2026-08-23.md section 5b): the ground, an
 * accent rule along the top, the lockup top left, one message, and a footer rule with the
 * domain in the accent on the left and the source with its date on the right. Cards are
 * always drawn in hex for the dark theme, since the ground is dark. Portrait sizes follow
 * the brand build's postcard (build.mjs postcardTree) at 1080 wide: the lockup name at 36,
 * the footer at 30, and nothing that carries meaning under 30.
 *
 * thumb (160x64) is the task card thumbnail of the A5 front door: marks only, no text at all,
 * and aria-hidden, since the card's own words carry the meaning. Only charts with a
 * marks only form draw it (ZeroBar, Waffle, BillAnatomy, PositionStrip); the rest throw.
 * It is not in TEMPLATE_KEYS, which lists the templates every chart draws.
 *
 * Next templates (not built yet): story 1080x1920, A4 print, and the 16x9 and 9x16 film
 * frames.
 */
export type TemplateKey = "inline" | "og" | "portrait" | "thumb";
/** The templates every chart draws. The thumb is only for charts with a marks only form. */
export declare const TEMPLATE_KEYS: TemplateKey[];
/** The card templates, in the order a card set renders them. */
export declare const CARD_KEYS: TemplateKey[];
export interface Template {
    key: TemplateKey;
    W: number;
    /** Fixed height, or 0 when the height follows the content. */
    H: number;
    pad: number;
    /** Draw the brand row and footer rule, on the ground. */
    card: boolean;
    /** Marks only: no text, no title elements, aria-hidden. */
    thumb?: boolean;
    /** Cards wider than tall put a chart's key beside the plot; the rest put it below. */
    keyBeside: boolean;
    /** The smallest size any text that carries meaning may take, checked on every card. */
    minText: number;
    font: {
        brand: number;
        title: number;
        label: number;
        value: number;
        axis: number;
        source: number;
        stat: number;
        statLabel: number;
        perspective: number;
    };
    /** Natural plot height for charts that have no intrinsic height. */
    plotH: number;
}
export declare const TEMPLATES: Record<TemplateKey, Template>;
