import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { cardPalette } from "../styles/palette";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "./site";

/**
 * The 1200x630 share card, on the estate grammar: the dark ground, an accent
 * top rule, the lockup top left, one message, and a footer rule with the domain
 * in accent on the left and the source and date on the right. A card carrying
 * a figure carries its caveat and its source on the card, because a card is
 * posted without the page that explained it. No card names a person.
 *
 * Satori cannot read the variable woff2 files, so the faces are the static
 * weight woff files fontsource ships beside them, read from node_modules at
 * the version package.json pins. Every OG route gates its getStaticPaths on
 * BUILD_OG=1, so an iteration build never loads Satori.
 */

const FONT_ROOT = join(process.cwd(), "node_modules", "@fontsource");

type Font = { name: string; data: Buffer; weight: 400 | 600; style: "normal" };
let fontCache: Font[] | null = null;

function fonts(): Font[] {
  fontCache ??= [
    { name: "Source Serif 4", data: readFileSync(join(FONT_ROOT, "source-serif-4", "files", "source-serif-4-latin-600-normal.woff")), weight: 600, style: "normal" },
    { name: "Source Sans 3", data: readFileSync(join(FONT_ROOT, "source-sans-3", "files", "source-sans-3-latin-400-normal.woff")), weight: 400, style: "normal" },
    { name: "Source Sans 3", data: readFileSync(join(FONT_ROOT, "source-sans-3", "files", "source-sans-3-latin-600-normal.woff")), weight: 600, style: "normal" },
  ];
  return fontCache;
}

export interface OgCard {
  /** One line above the heading. */
  eyebrow: string;
  heading: string;
  /** The one figure a card may carry, and the line under it. */
  figure?: { value: string; label: string; change?: string };
  /** What qualifies the figure, printed with it. Required when there is a figure. */
  caveat?: string;
  /** "<source>, <date>", right of the footer rule. */
  source: string;
}

const { ground, groundInk, groundMuted, accentBright, accentDeep, accentWash } = cardPalette;

function h(type: string, style: Record<string, unknown>, ...children: unknown[]) {
  return { type, props: { style: { display: "flex", ...style }, children: children.length === 1 ? children[0] : children } };
}

function layout(card: OgCard) {
  const host = new URL(SITE_URL).host;
  return h(
    "div",
    {
      width: "1200px",
      height: "630px",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "56px 64px 44px",
      background: ground,
      borderTop: `8px solid ${accentBright}`,
      color: groundInk,
      fontFamily: "Source Sans 3",
    },
    h(
      "div",
      { alignItems: "center", gap: "16px" },
      {
        // The house mark, the same path as public/favicon.svg.
        type: "svg",
        props: {
          width: 44,
          height: 44,
          viewBox: "0 0 64 64",
          children: [
            { type: "rect", props: { width: 64, height: 64, rx: 12, fill: accentDeep } },
            { type: "path", props: { d: "M14 50V28L32 16l18 12v22H38V36H26v14z", fill: accentWash } },
          ],
        },
      },
      h(
        "div",
        { flexDirection: "column" },
        h("div", { fontFamily: "Source Serif 4", fontWeight: 600, fontSize: "26px" }, SITE_NAME),
        h("div", { fontSize: "17px", color: groundMuted }, SITE_TAGLINE),
      ),
    ),
    h(
      "div",
      { flexDirection: "column", gap: "14px" },
      h("div", { fontSize: "26px", color: accentBright, fontWeight: 600 }, card.eyebrow),
      h(
        "div",
        { fontFamily: "Source Serif 4", fontWeight: 600, fontSize: card.heading.length > 34 ? "50px" : card.heading.length > 24 ? "60px" : "72px", lineHeight: 1.05, maxWidth: "1070px" },
        card.heading,
      ),
      card.figure
        ? h(
            "div",
            { alignItems: "baseline", gap: "22px", marginTop: "10px", flexWrap: "wrap" },
            h("div", { fontFamily: "Source Serif 4", fontWeight: 600, fontSize: "84px", color: groundInk }, card.figure.value),
            h(
              "div",
              { flexDirection: "column" },
              h("div", { fontSize: "26px", color: groundInk }, card.figure.label),
              card.figure.change ? h("div", { fontSize: "26px", color: accentBright, fontWeight: 600 }, card.figure.change) : h("div", {}),
            ),
          )
        : h("div", {}),
      card.caveat ? h("div", { fontSize: "19px", color: groundMuted, maxWidth: "1000px", lineHeight: 1.35 }, card.caveat) : h("div", {}),
    ),
    h(
      "div",
      { justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${groundMuted}`, paddingTop: "16px", fontSize: "19px" },
      h("div", { color: accentBright, fontWeight: 600 }, host),
      h("div", { color: groundMuted }, card.source),
    ),
  );
}

export async function renderOgCard(card: OgCard): Promise<Uint8Array<ArrayBuffer>> {
  if (card.figure && !card.caveat) throw new Error(`card "${card.heading}" carries a figure with no caveat`);
  const svg = await satori(layout(card) as never, { width: 1200, height: 630, fonts: fonts() });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  // Astro rejects a Buffer in a Response body; copy into a fresh array.
  const out = new Uint8Array(new ArrayBuffer(png.byteLength));
  out.set(png);
  return out;
}

/** True only when the build asked for cards. Every OG route checks this. */
export const buildOg = process.env.BUILD_OG === "1";

export const HUB_CARDS = ["home", "councils", "council-tax", "rises", "exceptional-financial-support"] as const;
export type HubCard = (typeof HUB_CARDS)[number];

export const hubCardPath = (card: HubCard) => `/og/${card}.png`;
export const councilCardPath = (slug: string) => `/og/councils/${slug}.png`;
