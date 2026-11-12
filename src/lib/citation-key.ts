import { createHash } from 'node:crypto';
import type { SourceRef } from './sources';

/** Methods belong to individual figures; bibliographic identity does not include them. */
export function citationKey(source: SourceRef): string {
  return 'citation-' + createHash('sha256').update(JSON.stringify([
    source.publisher, source.title, source.table ?? '', source.date ?? '', source.url,
  ])).digest('hex').slice(0, 16);
}
