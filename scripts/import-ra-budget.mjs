/** MHCLG RA 2026/27, pinned to the edition reviewed in the phase 0 source notes. */
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readOds, figure} from './lib/ods.mjs';

export const SERVICE_IDS = ['edutot','transtot','csctot','asctot','phtot','housgfcftot','cultot','envtot','plantot','poltot','frstot','centot','othtot'];
export const FINANCING_IDS = ['grantinaef','trnsreorg','appressch','appresdsg','appresph','appresoth','appresunall','grantrsg','grantpol','retainnndr','colfunct','othinc'];
export const MISSING = ['E07000069','E08000026','E06000063','E08000027','E07000072','E09000011','E07000209','E06000025','E07000222'];
const sourceKeys = ['raPart1','raPart2','raGrants'];
const fail = message => { throw new Error(`RA budget: ${message}`); };
const json = path => JSON.parse(readFileSync(resolve(process.cwd(),path),'utf8'));
// Only punctuation changes to meet house style. The source file, asset ID and line retain the exact locator.
// A dash between two numbers is a range ("18 to 64"); any other dash separates words and becomes a colon.
const DASH = `[${String.fromCharCode(8211,8212)}]`;
export const labelText = text => text.replace(new RegExp(`(\\d)\\s*${DASH}\\s*(\\d)`,'g'),'$1 to $2').replace(new RegExp(`\\s*${DASH}\\s*`,'g'),': ').replaceAll([' ','-',' '].join(''),': ').replace(/\s+/g,' ').trim();

export function parseWorkbook(path, sheetName, sourceKey) {
  const sheets = readOds(path);
  const sheet = sheets.find(s => s.name===sheetName) ?? fail(`missing sheet ${sheetName}`);
  const headerIndex = sheet.rows.findIndex(r => r.includes('E-code'));
  if(headerIndex<0)fail(`missing E-code header in ${sheetName}`);
  const header = sheet.rows[headerIndex];
  const assets = sheet.rows.find(r => r[0]?.includes('Asset ID')) ?? fail('missing asset IDs');
  const lines = sheet.rows.find(r => r[0]?.includes("'line number'")) ?? fail('missing line numbers');
  const sections = sheet.rows.find(r => r[0]?.includes('section headings')) ?? fail('missing section headings');
  const column = title => {const i=header.indexOf(title);if(i<0)fail(`missing ${title}`);return i;};
  /** @type {Record<string, {line:number,label:string,heading:string,source:string,column:number}>} */
  const fields = {};
  let heading='';
  for(let i=6;i<assets.length;i++) {
    if(sections[i])heading=sections[i];
    const id=assets[i];
    if(!id||fields[id])fail(`missing or duplicate asset ID at column ${i}`);
    fields[id]={line:Number(lines[i]),label:labelText(header[i]),heading:labelText(heading),source:sourceKey,column:i};
  }
  /** @type {Record<string, {name:string,class:string,notes:string,row:string[]}>} */
  const rows={};
  for(const row of sheet.rows.slice(headerIndex+1)) {
    const gss=row[column('ONS Code')];
    if(!/^E(?:0[6-9]|10)\d{6}$/.test(gss??''))continue;
    if(rows[gss])fail(`duplicate ${gss}`);
    rows[gss]={name:row[column('Local authority')],class:row[column('Class')],notes:row[column('Notes')]??'',row};
  }
  const notes=Object.fromEntries((sheets.find(s=>s.name==='Notes')?.rows??[]).filter(r=>/^\[|^M$|^-$/.test(r[0])).map(r=>[r[0],labelText(r[1]??'')]));
  return {fields,rows,notes};
}

export function readCell(workbook,gss,id) {
  const field=workbook.fields[id]??fail(`missing asset ${id}`);
  const row=workbook.rows[gss]??fail(`missing ${gss} in joined workbook`);
  const printed=row.row[field.column]??'';
  const value=printed==='-'||printed.startsWith('#')?null:figure(printed,`${gss} ${id}`);
  if(value!==null&&!Number.isSafeInteger(value))fail(`non-integer GBP thousands ${gss} ${id}`);
  return value;
}

export function buildBudget(root=process.cwd()) {
  const sources=json('data/budget/sources.json');
  const books=Object.fromEntries(sourceKeys.map(key=>[key,parseWorkbook(resolve(root,'data/raw',sources[key].file),sources[key].tables[0],key)]));
  const part1=books.raPart1;
  const components=json('data/budget/table-10-2026-27.json').components;
  const fields={};
  const groups=[];
  const part1Ids=Object.keys(part1.fields);
  let start=0;
  for(const id of SERVICE_IDS) {
    const end=part1Ids.indexOf(id);
    if(end<start)fail(`service order ${id}`);
    groups.push({id,label:part1.fields[id].heading,subLines:part1Ids.slice(start,end)});
    start=end+1;
  }
  const reserveIds=['ressch','resdsgadj','resdsg','resph','resoth','resunall'].flatMap(id=>[`${id}_strt`,`${id}_end`]);
  const selections={raPart1:[...part1Ids.slice(0,start),'servicetot','revenuetot',...FINANCING_IDS,'ctrtot','parishaggprecept'],raPart2:reserveIds,raGrants:['grantindsg']};
  for(const [key,ids] of Object.entries(selections))for(const id of ids) {
    const {column,...field}=books[key].fields[id]??fail(`missing ${id}`);
    fields[id]={...field,unit:'GBP thousand',recordType:'observation'};
  }
  /** @type {Record<string, {name:string,class:string,status:string,countyCode:string|null,notes:Record<string,string>,values:Record<string,number|null>}>} */
  const councils={};
  const notes=[];
  for(const [gss,row] of Object.entries(part1.rows)) {
    const values={};
    for(const [key,ids] of Object.entries(selections))for(const id of ids)values[id]=readCell(books[key],gss,id);
    const countyParts=(components[gss]?.parts??[]).filter(p=>p.kind==='county'&&p.code?.startsWith('E10'));
    if(countyParts.length>1)fail(`multiple counties for ${gss}`);
    const status=row.notes.includes('M')?'no return':'available';
    councils[gss]={name:row.name,class:row.class,status,countyCode:countyParts[0]?.code??null,notes:Object.fromEntries(sourceKeys.map(key=>[key,books[key].rows[gss]?.notes??fail(`missing notes row ${gss}`)])),values};
    if(status==='available')for(const group of groups) {
      if(!group.subLines.length)continue;
      const difference=group.subLines.reduce((sum,id)=>sum+values[id],0)-values[group.id];
      if(difference!==0)notes.push({gss,service:group.id,difference,unit:'GBP thousand',recordType:'calculation',source:'raPart1',method:'Sum of printed service sub-lines less printed total; retained without adjustment. Every sub-line must sum exactly to its service total.'});
    }
  }
  return {schemaVersion:1,year:'2026-27',unit:'GBP thousand',recordType:'observation',sources:Object.fromEntries(sourceKeys.map(key=>[key,sources[key]])),fields,groups,councils,sourceNotes:Object.fromEntries(sourceKeys.map(key=>[key,books[key].notes])),notes,labelPolicy:'Source wording retained with dash punctuation expanded to words or a colon to meet house style. Asset IDs and line numbers locate the printed labels.'};
}

export function validateBudget(data) {
  const fixture=json('tests/fixtures/budget-ct-reconciliation.json');
  const components=json('data/budget/table-10-2026-27.json').components;
  const entries=Object.entries(data.councils);
  if(entries.length!==317||entries.filter(([,c])=>c.status==='available').length!==308)fail('phase 0 council counts differ');
  if(JSON.stringify(entries.filter(([,c])=>c.status==='no return').map(([gss])=>gss).sort())!==JSON.stringify([...MISSING].sort()))fail('missing return identities differ');
  for(const [gss,c] of entries) {
    if(c.status==='no return') {
      if(Object.values(c.values).some(v=>v!==null))fail(`${gss}: missing return has numeric cells`);
      continue;
    }
    const v=c.values;
    if(Object.values(v).some(value=>value===null))fail(`${gss}: unexpected unknown required cell`);
    if(Math.abs(SERVICE_IDS.reduce((sum,id)=>sum+v[id],0)-v.servicetot)>2)fail(`${gss}: service totals do not reconcile`);
    for(const group of data.groups) {
      if(group.subLines.length&&group.subLines.reduce((sum,id)=>sum+v[id],0)!==v[group.id])fail(`${gss} ${group.id}: sub-lines do not reconcile exactly`);
    }
    if(v.revenuetot+FINANCING_IDS.reduce((sum,id)=>sum+v[id],0)!==v.ctrtot)fail(`${gss}: financing identity does not reconcile`);
    if(components[gss]) {
      const t=components[gss];
      const difference=(v.ctrtot*1000/(t.ownWithParishPence/100*t.taxBase)-1)*100;
      const reviewed=fixture.rows.find(r=>r.gss===gss);
      if(reviewed?Math.abs(difference-reviewed.differencePercent)>fixture.fixtureTolerancePercentagePoints:Math.abs(difference)>fixture.tolerancePercent)fail(`${gss}: Table 10 reconciliation ${difference}% is outside reviewed fixture`);
      if(Boolean(reviewed?.note4)!==c.notes.raPart1.includes('[note 4]'))fail(`${gss}: note 4 differs`);
    }
  }
  for(const [gss,c] of entries) {
    if(c.class==='SD'&&(!c.countyCode||data.councils[c.countyCode]?.class!=='SC'))fail(`${gss}: district has no county`);
    if(c.class==='SC'&&!entries.some(([,d])=>d.countyCode===gss))fail(`${gss}: county has no district`);
  }
  // Exact anchors transcribed from the reviewed MHCLG cells in source notes section 4.
  const anchorIds=['servicetot','revenuetot','ctrtot','edutot','eduspc','asctot','csctot','transtot','grantindsg','resoth_strt','resoth_end','resunall_strt','resunall_end'];
  const anchors={E07000117:[17246,25831,8832,0,0,2,0,-343,0,19978,17829,1379,1379],E08000025:[2700482,2970775,560016,1117292,268053,573142,410088,161402,884812,574278,531445,156722,157323],E09000033:[552973,525414,83475,147311,7946,113839,55445,-63028,116704,255423,235416,59671,49831],E10000017:[2759432,2826392,717078,1409030,221200,683126,325214,57581,1174566,245022,229961,66250,66250]};
  for(const [gss,expected] of Object.entries(anchors))anchorIds.forEach((id,i)=>{if(data.councils[gss].values[id]!==expected[i])fail(`${gss} ${id}: anchor differs`);});
  if(data.notes.length!==0)fail('sub-line mismatches must be zero');
}

export async function importBudget() {
  const sources=json('data/budget/sources.json');
  mkdirSync(resolve(process.cwd(),'data/raw'),{recursive:true});
  for(const key of sourceKeys) {
    const source=sources[key];
    const path=resolve(process.cwd(),'data/raw',source.file);
    if(!existsSync(path)) {
      const response=await fetch(source.fileUrl);
      if(!response.ok)fail(`${key}: HTTP ${response.status}`);
      writeFileSync(path,Buffer.from(await response.arrayBuffer()));
    }
    if(createHash('sha256').update(readFileSync(path)).digest('hex')!==source.sha256)fail(`${key}: pinned hash mismatch; stop for review`);
  }
  const data=buildBudget();
  validateBudget(data);
  writeFileSync(resolve(process.cwd(),'data/budget/ra-2026-27.json'),JSON.stringify(data,null,1)+'\n');
  console.log('MHCLG RA 2026/27 import passed the phase 0 counts, anchors, service totals, financing and Table 10 checks.');
  console.log(JSON.stringify(data.notes,null,2));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))await importBudget();
