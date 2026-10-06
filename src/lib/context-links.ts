import {readFileSync} from 'node:fs';
import {join} from 'node:path';
export interface CheckedLink {url: string; title: string; checked: string}
export type ContextLinks = Partial<Record<'ukplaces'|'ukelections'|'ukdemographics'|'school', CheckedLink>>;
const snapshot = JSON.parse(readFileSync(join(process.cwd(), 'data/links/contextual.json'), 'utf8')) as {checked: string; councils: Record<string, ContextLinks>};
export const linkCheckDate = snapshot.checked;
export function contextLinks(gss: string): ContextLinks {return snapshot.councils[gss] ?? {};}
