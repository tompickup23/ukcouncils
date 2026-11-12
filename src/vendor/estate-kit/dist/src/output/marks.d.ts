/**
 * The site marks for the card lockup, drawn on a 64 unit grid with solid fills. Copied from
 * clawd briefings/uk-network-brand/brand-system/marks/ at origin/main 07c1dd8ec, with the
 * second and third accents from that folder's build.mjs SITES list. The first accent is the
 * site's accent-bright token, as the build uses it. AI DOGE has no mark in that set, so its
 * lockup is the wordmark alone.
 */
import { type SiteKey } from "../../generated/tokens.js";
export declare const hasMark: (site: SiteKey) => boolean;
/** The mark as an SVG group, `size` units square with its top left at x, y, or "" when the site has none. */
export declare function markSvg(site: SiteKey, x: number, y: number, size: number, ground: string): string;
