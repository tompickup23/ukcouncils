import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { cardPalette, cardPaletteTokens } from "../src/styles/palette";

describe("the share card palette", () => {
  it("matches the light root tokens in global.css value for value", () => {
    const css = readFileSync(join(resolve(import.meta.dirname, ".."), "src", "styles", "global.css"), "utf-8");
    // The first :root block is the light theme, and the card's ground tokens are
    // defined only there; the dark block does not redefine --ground-ink or
    // --ground-muted, and redefines --ground for the page, not the card.
    const root = css.slice(css.indexOf(":root {"), css.indexOf("\n}", css.indexOf(":root {")));
    for (const [key, token] of Object.entries(cardPaletteTokens)) {
      const match = new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`).exec(root);
      expect(match?.[1]?.toLowerCase(), `${token}`).toBe(cardPalette[key as keyof typeof cardPalette]);
    }
  });
});
