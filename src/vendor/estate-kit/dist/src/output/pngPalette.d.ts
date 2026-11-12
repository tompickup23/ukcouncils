/** Palette size for card PNGs: 128 colours keeps text edges clean on the dark ground. */
export declare const CARD_PALETTE_COLOURS = 128;
/** Splits RGBA pixels into at most `max` colours: the palette and one index per pixel. */
export declare function quantise(rgba: Uint8Array, max?: number): {
    palette: number[][];
    indices: Uint8Array;
};
/** An indexed PNG from RGBA pixels, with an XMP packet in an iTXt chunk when given. */
export declare function palettePng(rgba: Uint8Array, width: number, height: number, o?: {
    colours?: number;
    xmp?: string;
}): Buffer;
