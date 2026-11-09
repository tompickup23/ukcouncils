import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import type {SourceRef} from './sources';
import {longDate} from './sources';
import {yearLabel,yearWords} from './council-tax';
/** Cells as printed by MHCLG in Table 9a: amounts in whole thousands of pounds, the rate a percentage to 2 places.
 * null is a bracketed code ([x]) or an empty cell: unknown, never zero. */
export interface CollectionRecord {
 areaName:string;eCode:string;
 collectable:number|null;collected:number|null;rate:number|null;
 olderArrears:number|null;yearArrears:number|null;totalArrears:number|null;
 notesPrinted:string;notes:{id:string;text:string}[];
}
export interface CollectionSource {publisher:string;title:string;edition:string;published:string;revised:string;year:string;url:string;fileUrl:string;file:string;sha256:string;retrieved:string;tables:string[];precision:string;licence:string}
export interface CollectionData {schemaVersion:number;source:CollectionSource;england:CollectionRecord;councils:Record<string,CollectionRecord>}
const manifest = JSON.parse(readFileSync(join(process.cwd(), 'data/collection/source.json'), 'utf8')) as CollectionSource;
export const collection=JSON.parse(readFileSync(join(process.cwd(), `data/collection/collection-rates-${manifest.year}.json`),'utf8')) as CollectionData;
/** A council's record, or null where the table holds nothing for it. */
export const collectionFor=(gss:string):CollectionRecord|null=>{
 const row=collection.councils[gss];
 if(!row)return null;
 return [row.rate,row.olderArrears,row.yearArrears,row.totalArrears].every(v=>v===null)?null:row;
};
/** The financial year the table covers, as the site prints it, read from the pinned source. */
export const collectionYear=()=>yearLabel(collection.source.year);
/** The last day of that financial year, from the same source year: "31 March 2026". */
export const collectionYearEnd=()=>`31 March 20${collection.source.year.slice(5)}`;
/** The year before the pinned source year, labelled through yearLabel, as printed in the line 20 header. */
export const collectionPriorYear=()=>{const start=Number(collection.source.year.slice(0,4));return yearLabel(`${start-1}-${String(start).slice(2)}`);};
export const collectionSource=():SourceRef=>({
 publisher:'MHCLG',
 title:collection.source.title,
 url:collection.source.url,
 table:`Table 9a (QRC4 lines 1, 4, 5, 20, 23 and 24), ${yearWords(collection.source.year)}, revised ${longDate(collection.source.revised)}`,
 date:collection.source.published,
});
const thousands=new Intl.NumberFormat('en-GB');
/** An amount as printed, in thousands of pounds: "£52,046 thousand". */
export const collectionAmount=(n:number|null)=>n===null?'n/a':`£${thousands.format(n)} thousand`;
/** The rate as printed, to 2 decimal places: "95.98%". */
export const collectionRate=(n:number|null)=>n===null?'n/a':`${n.toFixed(2)}%`;
/** MHCLG notes that bear on the lines shown: the revision note and the not available code. */
export const shownNotes=(row:CollectionRecord)=>row.notes.filter(n=>n.id==='[r]'||n.id==='[x]');
