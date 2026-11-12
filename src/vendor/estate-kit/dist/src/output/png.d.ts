export { CARD_PALETTE_COLOURS, palettePng, quantise } from "./pngPalette.js";
export declare const FONT_FILES: string[];
/** A truecolour PNG of a hex mode SVG. */
export declare function toPng(svg: string, width?: number): Buffer;
/**
 * A palette quantised PNG (128 colours, no dither) of a hex mode SVG, with an XMP packet
 * when given: the form every card is written in.
 */
export declare function toPalettePng(svg: string, o?: {
    width?: number;
    xmp?: string;
    colours?: number;
}): Buffer;
