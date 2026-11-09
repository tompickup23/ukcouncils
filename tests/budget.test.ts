import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {buildBudget,validateBudget,SERVICE_IDS,FINANCING_IDS,MISSING,parseWorkbook,readCell,labelText} from '../scripts/import-ra-budget.mjs';
import {readOds} from '../scripts/lib/ods.mjs';
import fixture from './fixtures/budget-ct-reconciliation.json';

interface CouncilBudget {
 name:string;
 class:string;
 status:string;
 countyCode:string|null;
 notes:Record<string,string>;
 values:Record<string,number|null>;
}
interface BudgetData {
 councils:Record<string,CouncilBudget>;
 groups:{id:string;subLines:string[]}[];
 notes:{gss:string;service:string;difference:number}[];
}
// Read the pinned workbooks independently of the committed snapshot.
const data=buildBudget() as BudgetData;
const entries=Object.entries(data.councils);
const available=entries.filter(([,c])=>c.status==='available');
const components=JSON.parse(readFileSync('data/budget/table-10-2026-27.json','utf8')).components;
const sources=JSON.parse(readFileSync('data/budget/sources.json','utf8'));
const value=(c:CouncilBudget,id:string)=>{expect(c.values[id],`${c.name} ${id}`).not.toBeNull();return c.values[id] as number;};

describe('MHCLG RA 2026/27 phase 0 source contract',()=>{
 it('keeps each pinned source hash before reading its figures',()=>{
  for(const key of ['raPart1','raPart2','raGrants']){
   const source=sources[key];
   expect(createHash('sha256').update(readFileSync(`data/raw/${source.file}`)).digest('hex')).toBe(source.sha256);
   expect(source.published).toBe('2026-06-11');
  }
 });
 it('keeps the phase 0 council counts and named missing returns',()=>{
  expect(entries).toHaveLength(317);
  expect(available).toHaveLength(308);
  expect(entries.filter(([,c])=>c.status==='no return').map(([gss])=>gss).sort()).toEqual([...MISSING].sort());
  expect(entries.filter(([,c])=>c.status==='no return').map(([,c])=>c.name).sort()).toEqual(['Castle Point','Coventry','Cumberland','Dudley','Epping Forest','Greenwich','Guildford','South Gloucestershire','Warwick'].sort());
  for(const [,c] of entries.filter(([,c])=>c.status==='no return'))expect(Object.values(c.values).every(v=>v===null)).toBe(true);
  expect(Object.keys(components).every(gss=>data.councils[gss])).toBe(true);
 });
 it('reconciles the service totals to RA line 799 within printed rounding',()=>{
  for(const [,c] of available){
   const sum=SERVICE_IDS.reduce((total:number,id:string)=>total+value(c,id),0);
   expect(Math.abs(sum-value(c,'servicetot')),c.name).toBeLessThanOrEqual(2);
  }
 });
 it('reconciles RA line 900 and all financing lines exactly to line 990',()=>{
  for(const [,c] of available){
   const financing=FINANCING_IDS.reduce((total:number,id:string)=>total+value(c,id),0);
   expect(value(c,'revenuetot')+financing,c.name).toBe(value(c,'ctrtot'));
  }
 });
 it('matches the reviewed Table 10 discrepancy fixture without adjusting either source',()=>{
  let checked=0,withinTight=0,withinWide=0;
  for(const [gss,c] of available){
   const t=components[gss];if(!t)continue;checked++;
   const difference=(value(c,'ctrtot')*1000/(t.ownWithParishPence/100*t.taxBase)-1)*100;
   const reviewed=fixture.rows.find(r=>r.gss===gss);
   if(Math.abs(difference)<=0.05)withinTight++;
   if(Math.abs(difference)<=0.5)withinWide++;
   expect(reviewed?Math.abs(difference-reviewed.differencePercent):Math.abs(difference),gss).toBeLessThanOrEqual(reviewed?fixture.fixtureTolerancePercentagePoints:fixture.tolerancePercent);
   expect(c.notes.raPart1.includes('[note 4]'),gss).toBe(reviewed?.note4??false);
  }
  // Counts recorded in source notes section 4, using MHCLG RA and Table 10.
  expect([checked,withinTight,withinWide]).toEqual([287,271,275]);
 });
 it('keeps every phase 0 anchor exactly as printed by MHCLG',()=>{
  const ids=['servicetot','revenuetot','ctrtot','edutot','eduspc','asctot','csctot','transtot','grantindsg','resoth_strt','resoth_end','resunall_strt','resunall_end'];
  const anchors:Record<string,number[]>={
   E07000117:[17246,25831,8832,0,0,2,0,-343,0,19978,17829,1379,1379],
   E08000025:[2700482,2970775,560016,1117292,268053,573142,410088,161402,884812,574278,531445,156722,157323],
   E09000033:[552973,525414,83475,147311,7946,113839,55445,-63028,116704,255423,235416,59671,49831],
   E10000017:[2759432,2826392,717078,1409030,221200,683126,325214,57581,1174566,245022,229961,66250,66250],
  };
  for(const [gss,expected] of Object.entries(anchors))expect(ids.map(id=>data.councils[gss].values[id]),gss).toEqual(expected);
  const burnley=data.councils.E07000117.values;
  expect(['cultot','envtot','centot','housgfcftot','plantot','parishaggprecept','grantrsg','retainnndr','grantinaef','appresoth','colfunct'].map(id=>burnley[id])).toEqual([5287,5681,4809,2236,-426,222,-6908,-4787,-3150,-2149,-5]);
 });
 it('joins each district to exactly one county and every county to districts',()=>{
  const counties=entries.filter(([,c])=>c.class==='SC');expect(counties).toHaveLength(21);
  for(const [gss,c] of entries.filter(([,c])=>c.class==='SD')){
   const parts=components[gss].parts.filter((p:{kind:string;code:string|null})=>p.kind==='county'&&p.code?.startsWith('E10'));
   expect(parts,c.name).toHaveLength(1);
   expect(c.countyCode).toBe(parts[0].code);
   expect(data.councils[c.countyCode!].class).toBe('SC');
  }
  for(const [gss] of counties)expect(entries.some(([,c])=>c.countyCode===gss)).toBe(true);
 });
 it('preserves every Part 2 ODF error as its displayed marker, never zero',()=>{
  const path=`data/raw/${sources.raPart2.file}`;
  const xml=execFileSync('unzip',['-p',path,'content.xml'],{encoding:'utf8',maxBuffer:256*1024*1024});
  const errors=[...xml.matchAll(/<table:table-cell\b[^>]*office:value-type="error"[^>]*>([\s\S]*?)<\/table:table-cell>/g)];
  expect(errors.length).toBeGreaterThan(0);
  expect(errors.every(m=>m[1].includes('#REF!'))).toBe(true);
  const sheets=readOds(path) as {name:string;rows:string[][]}[];
  const markers=sheets.flatMap(s=>s.rows.flat()).filter(cell=>cell==='#REF!');
  expect(markers).toHaveLength(errors.length);
  const book=parseWorkbook(path,'RA_LA_Data_2026-27','raPart2');
  const row=book.rows.E07000117.row;
  const index=book.fields.resoth_strt.column;
  const original=row[index];
  try {row[index]='#REF!';expect(readCell(book,'E07000117','resoth_strt')).toBeNull();}
  finally {row[index]=original;}
 });
 it('reconciles every service group exactly and rejects any sub-line mismatch',()=>{
  expect(data.notes).toEqual([]);
  expect(()=>validateBudget(data)).not.toThrow();
  for(const [,c] of available)for(const group of data.groups){
   if(!group.subLines.length)continue;
   expect(group.subLines.reduce((sum,id)=>sum+value(c,id),0),`${c.name} ${group.id}`).toBe(value(c,group.id));
  }
  const changed=structuredClone(data);
  changed.councils.E07000117.values[data.groups[0].subLines[0]]!+=1;
  expect(()=>validateBudget(changed)).toThrow('sub-lines do not reconcile exactly');
 });
});

describe('printed labels in house style',()=>{
 const dash=String.fromCharCode(8211);
 it('turns a dash between numbers into a range and any other dash into a colon',()=>{
  expect(labelText(`Physical support${[' ', '-', ' '].join('')}adults (18${dash}64)`)).toBe('Physical support: adults (18 to 64)');
  expect(labelText(`Children 5${dash}19 public health programmes`)).toBe('Children 5 to 19 public health programmes');
  expect(labelText(`Traffic management and road safety: traffic management ${dash} bus lane enforcement`)).toBe('Traffic management and road safety: traffic management: bus lane enforcement');
 });
});
