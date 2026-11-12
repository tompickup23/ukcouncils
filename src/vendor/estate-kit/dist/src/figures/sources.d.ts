/** Linked citations for pages. Legacy figure captions keep their original format. */
import type { Figure, Source } from "./figures.js";
export interface LinkedSource extends Source {
    id: string;
    /** Publication date, ISO calendar date. This is not the date accessed. */
    publicationDate: string;
    url: string;
}
export declare function linkedSource(source: Source): LinkedSource;
export declare function shortSourceText(source: Source): string;
/** A full first citation, with an anchor later short citations can link to. */
export declare function sourceEntryHtml(source: Source, fixture?: boolean): string;
/** A short citation. The page checker requires its full entry to precede it. */
export declare function shortSourceHtml(source: Source, fixture?: boolean): string;
export declare function sourceLinesHtml(figures: Figure[], format: "full" | "short"): string;
