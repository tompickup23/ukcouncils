/**
 * The few token values the share card needs, as literals. Satori renders
 * outside a browser and cannot read a custom property, so this is the one
 * file outside global.css allowed to hold a colour; tests/palette.test.ts
 * holds every value here equal to its token in global.css.
 */
export const cardPalette = {
  ground: "#0f1317",
  groundInk: "#f4f6f7",
  groundMuted: "#98a3ac",
  accentBright: "#8cc4ed",
  accentDeep: "#245b87",
  accentWash: "#eef5fb",
} as const;

/** The global.css token each value mirrors. */
export const cardPaletteTokens: Record<keyof typeof cardPalette, string> = {
  ground: "--ground",
  groundInk: "--ground-ink",
  groundMuted: "--ground-muted",
  accentBright: "--accent-bright",
  accentDeep: "--accent",
  accentWash: "--accent-wash",
};
