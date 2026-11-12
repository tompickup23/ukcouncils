export type FaceKey = "sans400" | "sans600" | "display600";
export interface FaceMetrics {
    file: string;
    unitsPerEm: number;
    notdef: number;
    ranges: [number, number[]][];
}
export declare const METRICS: Record<FaceKey, FaceMetrics>;
