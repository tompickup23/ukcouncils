/** Adapted from AI DOGE's local CouncilSearch; no network or query storage. */
export function normalise(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
export function matchesCouncil(query: string, ...names: string[]): boolean {
  const words = normalise(query).split(' ').filter(Boolean);
  const name = normalise(names.join(' '));
  return words.every(word => name.includes(word));
}

/**
 * Rank 0 for an exact name, 1 for a name that starts with the query, 2 for a
 * name with a word that starts with it, 3 for any other match.
 */
export function councilRank(query: string, name: string): number {
  const q = normalise(query); const n = normalise(name);
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.split(' ').some(word => word.startsWith(q))) return 2;
  return 3;
}

/** Order matches by rank, then A to Z by name within each rank. */
export function rankCouncils<T extends { name: string }>(query: string, rows: T[]): T[] {
  return rows.map(row => ({ row, rank: councilRank(query, row.name) }))
    .sort((a, b) => a.rank - b.rank || a.row.name.localeCompare(b.row.name, 'en-GB'))
    .map(({ row }) => row);
}

/** How many councils the site search dialog lists above the full text results. */
export const COUNCILS_SHOWN = 12;

/** An exact region name excludes similar words in a council name. */
export function matchingRegion(query: string, regions: Iterable<string>): string | undefined {
  const wanted = normalise(query);
  return wanted && [...regions].some(region => normalise(region) === wanted) ? wanted : undefined;
}

function councilPhrase(count: number, shown: number): string {
  if (count === 1) return '1 matching council';
  return count > shown ? `${count} matching councils (${shown} listed)` : `${count} matching councils`;
}

/**
 * The search dialog's status line, which accounts for both the council list and
 * the full text results. A null council count means the council index did not
 * load; a null page count means full text search did not load.
 */
export function searchStatus(councilCount: number | null, pageCount: number | null, shown = COUNCILS_SHOWN): string {
  const councils = councilCount ? councilPhrase(councilCount, shown) : '';
  if (pageCount === null) return `${councils ? `${councils}. ` : ''}Page search could not load. Retry or use the council directory below.`;
  const pages = pageCount === 1 ? '1 matching page' : `${pageCount} matching pages`;
  if (!councils) return pageCount ? `${pages}.` : 'No matching pages or councils. Try a council name or a broader topic.';
  return pageCount ? `${councils} and ${pages}.` : `${councils}. No other pages match.`;
}
