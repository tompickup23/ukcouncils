export declare function sourceErrors(html: string): string[];
/** Throws on a page with a missing entry or a short first use. Call for each dist HTML file. */
export declare function checkSources(html: string, page?: string): void;
