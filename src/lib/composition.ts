import {loadComposition, compositionFor as readComposition, COLUMN_LABELS} from '../../scripts/lib/composition-data.mjs';
import {longDate, type SourceRef} from './sources';
export {COLUMN_LABELS};
export const composition = loadComposition();
export interface CompositionView {sourceId: string; columns: Record<string, number>; control: string | null}
export const compositionFor = (gss: string): CompositionView | null => readComposition(gss);
export const snapshotDate = longDate(composition.source.retrieved)!;
export function compositionSource(): SourceRef {
  return {publisher: composition.source.publisher, title: composition.source.title, url: composition.source.url,
    table: `snapshot retrieved ${snapshotDate}; compiled by a third party, not an official council return`};
}
