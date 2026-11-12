/**
 * The site marks for the card lockup, drawn on a 64 unit grid with solid fills. Copied from
 * clawd briefings/uk-network-brand/brand-system/marks/ at origin/main 07c1dd8ec, with the
 * second and third accents from that folder's build.mjs SITES list. The first accent is the
 * site's accent-bright token, as the build uses it. AI DOGE has no mark in that set, so its
 * lockup is the wordmark alone.
 */
import { tokens } from "../../generated/tokens.js";
const MARKS = {
    ukfoodhygiene: {
        body: `<path d="M12 48V40h8v-6h8v-6h8v-6h8v-6h8v32z" fill="ACCENT"/>`,
        accent2: "#3fb492"
    },
    ukdemographics: {
        body: [
            [24.5, 11, 6, "ACCENT"], [33.5, 11, 5, "ACCENT2"], [20.5, 20, 10, "ACCENT"], [33.5, 20, 9, "ACCENT2"],
            [16.5, 29, 14, "ACCENT"], [33.5, 29, 13, "ACCENT2"], [12.5, 38, 18, "ACCENT"], [33.5, 38, 17, "ACCENT2"],
            [9.5, 47, 21, "ACCENT"], [33.5, 47, 20, "ACCENT2"]
        ].map(([x, y, w, f]) => `<rect x="${x}" y="${y}" width="${w}" height="6.5" rx="1.2" fill="${f}"/>`).join(""),
        accent2: "#a9a5f8"
    },
    ukelections: {
        body: `<rect x="14" y="10" width="36" height="44" rx="5" fill="ACCENT"/><path d="M24 25l16 16M40 25L24 41" stroke="GROUND" stroke-width="6.5" stroke-linecap="round" fill="none"/>`,
        accent2: "#e3d9c3"
    },
    asylumstats: {
        body: `<rect x="17" y="14" width="13" height="36" rx="2" fill="ACCENT"/><rect x="34" y="27" width="13" height="23" rx="2" fill="ACCENT2"/>`,
        accent2: "#5b86a6", accent3: "#3d6480"
    },
    ukschoolholidaydates: {
        body: `<rect x="10" y="12" width="44" height="42" rx="6" fill="ACCENT"/><path d="M10 18a6 6 0 0 1 6-6h32a6 6 0 0 1 6 6v6H10z" fill="ACCENT2"/>` +
            [[16, 30, "GROUND"], [27.5, 30, "GROUND"], [39, 30, "GROUND"], [16, 41, "GROUND"], [27.5, 41, "ACCENT2"], [39, 41, "GROUND"]]
                .map(([x, y, f]) => `<rect x="${x}" y="${y}" width="9" height="8" rx="1.5" fill="${f}"/>`).join(""),
        accent2: "#c98a22", accent3: "#c98a22"
    }
};
export const hasMark = (site) => site in MARKS;
/** The mark as an SVG group, `size` units square with its top left at x, y, or "" when the site has none. */
export function markSvg(site, x, y, size, ground) {
    const m = MARKS[site];
    if (!m)
        return "";
    const body = m.body
        .replaceAll("ACCENT3", m.accent3 ?? m.accent2)
        .replaceAll("ACCENT2", m.accent2)
        .replaceAll("GROUND", ground)
        .replaceAll("ACCENT", tokens.sites[site].bright);
    return `<g class="ek-mark" transform="translate(${x} ${y}) scale(${size / 64})">${body}</g>`;
}
