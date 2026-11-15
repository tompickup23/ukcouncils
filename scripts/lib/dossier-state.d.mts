export type DossierState = 'built' | 'absent' | 'out-of-scope';
export type DossierItem = 'D1' | 'D3' | 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8' | 'C9';
export interface DossierPart {
  item: DossierItem;
  key: string;
  label: string;
  state: DossierState;
  markers: string[];
  sources: {path: string; sha256: string}[];
  reason: string | null;
  absenceKind: 'no-source' | 'not-published' | 'held' | null;
  decision: {key: string; authority: string; effective: string} | null;
}
export interface DossierProfile {
  gss: string;
  slug: string;
  items: Record<DossierItem, {state: DossierState; parts: string[]}>;
  parts: DossierPart[];
}
export interface DossierReport {
  date: string;
  pins: Record<string, string>;
  profiles: DossierProfile[];
}
export const ITEMS: DossierItem[];
export const STATES: DossierState[];
export const DECISIONS: Record<string, string>;
export const DECIDE_BY: string;
export const DEFAULT_AUTHORITY: string;
export function decisionState(key: string, today: string): DossierState;
export function loadDossier(root?: string, today?: string): DossierReport;
