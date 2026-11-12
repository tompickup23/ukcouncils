/** Colour arithmetic for the kit QA gates. Ported unchanged from ukdemographics src/lib/map/colour.ts (origin/main, 4 November 2026). Hex colours only (#rrggbb). */
/** Straight sRGB blend: `t` of the way from `a` to `b`. */
export declare function mix(a: string, b: string, t: number): string;
/** WCAG 2 relative luminance. */
export declare function luminance(h: string): number;
/** WCAG 2 contrast ratio between two colours. */
export declare function contrast(a: string, b: string): number;
/** OKLab lightness, 0 to 1: the check that a sequential ramp gets steadily lighter. */
export declare function oklabLightness(h: string): number;
declare const CVD: Record<"protan" | "deutan" | "tritan", number[][]>;
export type Vision = "normal" | keyof typeof CVD;
export declare const VISIONS: Vision[];
/** OKLab distance between two colours as seen with the given colour vision. */
export declare function seenDistance(a: string, b: string, vision?: Vision): number;
export {};
