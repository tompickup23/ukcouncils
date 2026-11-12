import { type Theme } from "../../generated/tokens.js";
import type { ChartOutput } from "../charts/frame.js";
import type { Ground } from "../charts/canvas.js";
type Draw = (o: any) => ChartOutput;
/** The charts a request may name, by the name each is exported under. */
export declare const EXPORT_CHARTS: Record<string, Draw>;
export type ExportChart = keyof typeof EXPORT_CHARTS;
export interface ChartRequest {
    /** Names the request in the output and in every error. Unique within the file. */
    id: string;
    chart: string;
    /** The figure records this request draws, by key, in the kit's figure schema. */
    figures?: Record<string, unknown>;
    /** The chart's own options: figure keys, title, labels. Never a typed number. */
    options?: Record<string, unknown>;
    site: string;
    /** "paper" (the default) or "desk". */
    ground?: string;
    /** Absent for css mode, which follows the page's theme; "light" or "dark" for plain hex. */
    theme?: string;
}
export interface RequestFile {
    /** Figure records every request may draw on; a request's own figures are added to them. */
    figures?: Record<string, unknown>;
    requests: ChartRequest[];
}
export interface ChartResult {
    id: string;
    chart: string;
    site: string;
    ground: Ground;
    mode: "css" | Theme;
    svg: string;
    table: string;
    alt: string;
    caption: string;
    title?: string;
    width: number;
    height: number;
}
/** The results, in request order. The command line adds the kit version beside them. */
export interface ResultFile {
    results: ChartResult[];
}
export interface RequestFailure {
    id: string;
    chart: string;
    errors: string[];
}
/** Thrown with every failing request. The message names each request and each reason. */
export declare class ExportError extends Error {
    failures: RequestFailure[];
    constructor(failures: RequestFailure[]);
}
/** Draws one request. Throws with every reason it fails. */
export declare function renderRequest(r: ChartRequest, shared?: Record<string, unknown>): ChartResult;
/** Draws every request, in order. Throws an ExportError naming every request that fails. */
export declare function renderRequests(input: RequestFile): ResultFile;
export {};
