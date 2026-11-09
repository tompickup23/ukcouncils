/** Game rules only. Observed amounts are supplied by the server-side source adapter. */
export interface GameItem {label: string; value: number; detail: string}
export interface GameSource {publisher: string; title: string; url: string; table?: string; date?: string | null}
export interface GameRound {
  kind: 'split' | 'bill' | 'funding' | 'reserves';
  title: string;
  explanation: string;
  items: GameItem[];
  source: GameSource;
  notes: string[];
  base?: number;
  context?: {text: string; source: GameSource}[];
}
export interface GameData {slug: string; year: string; rounds: GameRound[]}
export const SIZE_BANDS = ['No change', 'More than £0 and less than £1 million', '£1 million to less than £10 million', '£10 million to less than £100 million', '£100 million or more'];
/** Thresholds are game answer choices in GBP thousands, not estimates. */
export function reserveBand(change: number): number {
  const value = Math.abs(change);
  return value === 0 ? 0 : value < 1000 ? 1 : value < 10000 ? 2 : value < 100000 ? 3 : 4;
}
export function reserveDirection(change: number): string {return change < 0 ? 'draw' : change > 0 ? 'add' : 'neither';}
export function shares(items: GameItem[], base: number): number[] {
  if (!Number.isFinite(base) || base <= 0 || items.some(item => !Number.isFinite(item.value) || item.value < 0)) throw new Error('Invalid share base');
  return items.map(item => item.value / base * 100);
}
export function splitScore(guesses: number[], actual: number[]): number {
  if (guesses.length !== actual.length || guesses.some(v => !Number.isInteger(v) || v < 0 || v > 100) || guesses.reduce((a, b) => a + b, 0) !== 100) throw new Error('Share exactly 100p using whole pence.');
  return Math.max(0, Math.min(100, Math.round(100-guesses.reduce((sum, v, i) => sum + Math.abs(v-actual[i]), 0) / 2)));
}
/** Pairwise ordering accepts ties in either order and retains signed funding separately. */
export function orderScore(order: number[], items: GameItem[]): number {
  if (order.length !== items.length || new Set(order).size !== items.length || order.some(i => !Number.isInteger(i) || i < 0 || i >= items.length)) throw new Error('Order each funding item once.');
  let correct = 0, pairs = 0;
  for (let a = 0; a < order.length; a++) for (let b = a + 1; b < order.length; b++) {
    const left = Math.abs(items[order[a]].value), right = Math.abs(items[order[b]].value);
    if (left === right) continue;
    pairs++;
    if (left > right) correct++;
  }
  return pairs ? Math.round(correct / pairs * 100) : 100;
}
export function readScores(hash: string, count: number): (number | null)[] | null {
  if (!/^#scores=(?:s|\d{1,3})(?:,(?:s|\d{1,3}))*$/.test(hash)) return null;
  const scores = hash.slice(8).split(',').map(v => v === 's' ? null : Number(v));
  return scores.length === count && scores.every(v => v === null || v <= 100) ? scores : null;
}
export function scoreLink(origin: string, slug: string, scores: (number | null)[]): string {
  return new URL(`/tools/budget/${encodeURIComponent(slug)}/#scores=${scores.map(v => v === null ? 's' : v).join(',')}`, origin).href;
}
