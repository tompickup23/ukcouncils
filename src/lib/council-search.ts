/** Adapted from AI DOGE's local CouncilSearch; no network or query storage. */
export function normalise(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
export function matchesCouncil(query: string, ...names: string[]): boolean {
  const words = normalise(query).split(' ').filter(Boolean);
  const name = normalise(names.join(' '));
  return words.every(word => name.includes(word));
}

/** How many councils the site search dialog lists above the full text results. */
export const COUNCILS_SHOWN = 5;

function councilPhrase(count: number): string {
  if (count === 1) return '1 matching council';
  return count > COUNCILS_SHOWN ? `${count} matching councils (the first five listed)` : `${count} matching councils`;
}

/**
 * The search dialog's status line, which accounts for both the council list and
 * the full text results. A null council count means the council index did not
 * load; a null page count means full text search did not load.
 */
export function searchStatus(councilCount: number | null, pageCount: number | null): string {
  const councils = councilCount ? councilPhrase(councilCount) : '';
  if (pageCount === null) return `${councils ? `${councils}. ` : ''}Page search could not load. Retry or use the council directory below.`;
  const pages = pageCount === 1 ? '1 matching page' : `${pageCount} matching pages`;
  if (!councils) return pageCount ? `${pages}.` : 'No matching pages or councils. Try a council name or a broader topic.';
  return pageCount ? `${councils} and ${pages}.` : `${councils}. No other pages match.`;
}
