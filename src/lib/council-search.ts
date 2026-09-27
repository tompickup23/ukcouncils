/** Adapted from AI DOGE's local CouncilSearch; no network or query storage. */
export function normalise(value: string): string {
  return value.toLowerCase().normalize('NFKD').replace(/\p{Diacritic}/gu, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
export function matchesCouncil(query: string, ...names: string[]): boolean {
  const words = normalise(query).split(' ').filter(Boolean);
  const name = normalise(names.join(' '));
  return words.every(word => name.includes(word));
}
