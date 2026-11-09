/** Council tax collection rate and arrears per English billing authority from MHCLG
 * "Collection rates for Council Tax and non-domestic rates in England, 2025 to 2026",
 * Table 9a, the QRC4 return as published (revised 31 July 2026).
 * The workbook is fetched once into data/raw and must match the reviewed hash in
 * data/collection/source.json. Cells are kept as displayed: amounts in whole thousands
 * of pounds, the rate to 2 decimal places. A bracketed code ([x]) stays unknown, never zero.
 * Nothing is calculated here; every value written is a printed cell.
 */
import {readFileSync, writeFileSync, existsSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readOds, table, figure} from './lib/ods.mjs';
const source = JSON.parse(readFileSync('data/collection/source.json','utf8'));
const current = JSON.parse(readFileSync('data/council-tax/england-2026-27.json','utf8')).authorities;
const fail = message => {throw new Error(message);};

mkdirSync('data/raw',{recursive:true});
const path = `data/raw/${source.file}`;
if(!existsSync(path)){const response=await fetch(source.fileUrl);if(!response.ok)fail(`collectionRates: HTTP ${response.status}`);writeFileSync(path,Buffer.from(await response.arrayBuffer()));}
if(createHash('sha256').update(readFileSync(path)).digest('hex')!==source.sha256)fail('collectionRates: source edition changed; review before importing');
const sheets = readOds(path);
const byName = name => sheets.find(s=>s.name===name) ?? fail(`collectionRates: missing sheet ${name}`);

const sheet = byName('Table_9a_-_Council_Tax');
if(sheet.rows[0][0]!==source.tables[0])fail('collectionRates: Table 9a title changed');
const t = table(sheet,['Authority','E-Code','ONS Code','Notes']);
const y = source.year;
const [a,b] = y.split('-');
const prior = `${Number(a)-1}-${a.slice(2)}`;
// Each line is found by its full printed header, so a reworded or moved column stops the import.
const LINES = {
 collectable:`1. Estimated net collectable debit in respect of ${y} (£ thousand)`,
 collected:`4. Total ${y} receipts, net of refunds granted in respect of ${y}\n(£ thousand)`,
 rate:`5. In-year collection rate for ${y}\n(%)`,
 olderArrears:`20. Arrears relating to ${prior} and earlier years as at 31 March 20${b}\n(£ thousand)`,
 yearArrears:`23. Total arrears in respect of ${y} that were outstanding as at 31 March 20${b}\n(£ thousand)`,
 totalArrears:`24. Total Arrears outstanding as at 31 March 20${b}\n(£ thousand)`,
};
const col = {name:t.column(/^Authority$/),eCode:t.column(/^E-Code$/),ons:t.column(/^ONS Code$/),cls:t.column(/^Class$/),notes:t.column(/^Notes$/)};
for(const [key,header] of Object.entries(LINES)){
 const i=t.header.indexOf(header);
 if(i<0||t.header.indexOf(header,i+1)>=0)fail(`collectionRates: header for ${key} not found exactly once`);
 col[key]=i;
}

const noteRows = byName('Notes').rows;
const notes = Object.fromEntries(noteRows.filter(r=>/^\[(note [a-z]+|r|x)\]$/.test(r[0])).map(r=>[r[0],r[1]]));
if(!notes['[x]']||!notes['[r]'])fail('collectionRates: notes sheet changed');

/** A displayed cell as a number, or null for a bracketed code. Thousands must be whole; the rate has 2 places. */
const cell = (row,key,where) => {
 const text=row[col[key]]??'';
 const n=figure(text,`${where} ${key}`);
 if(n===null)return null;
 if(key==='rate'){if(!/^\d{1,3}\.\d{2}$/.test(text))fail(`${where}: rate not printed to 2 places: ${JSON.stringify(text)}`);}
 else if(!/^-?\d{1,3}(,\d{3})*$/.test(text))fail(`${where} ${key}: not whole thousands: ${JSON.stringify(text)}`);
 return n;
};
const record = row => {
 const where=`${row[col.ons]} ${row[col.name]}`;
 const noteText=row[col.notes]??'';
 const ids=[...new Set(noteText.match(/\[(?:note [a-z]+|r|x)\]/g)??[])];
 return {
  areaName:row[col.name],
  eCode:row[col.eCode],
  collectable:cell(row,'collectable',where),
  collected:cell(row,'collected',where),
  rate:cell(row,'rate',where),
  olderArrears:cell(row,'olderArrears',where),
  yearArrears:cell(row,'yearArrears',where),
  totalArrears:cell(row,'totalArrears',where),
  notesPrinted:noteText,
  notes:ids.map(id=>({id,text:notes[id]??fail(`${where}: unknown note ${id}`)})),
 };
};

const englandRows = t.rows.filter(r=>r[col.eCode]==='E-ENG');
if(englandRows.length!==1||englandRows[0][col.name]!=='England')fail('collectionRates: expected one England row');
const england = record(englandRows[0]);
const councils = {};
for(const row of t.rows.filter(r=>/^E0[6-9]\d{6}$/.test(r[col.ons]??''))){
 const gss=row[col.ons];
 if(!current[gss])fail(`collectionRates: ${gss} is not a current English billing authority`);
 if(councils[gss])fail(`collectionRates: duplicate ${gss}`);
 councils[gss]=record(row);
}
const unjoined = t.rows.filter(r=>!/^E-/.test(r[col.eCode]??'')&&!councils[r[col.ons]]);
if(unjoined.length)fail(`collectionRates: rows not joined: ${unjoined.map(r=>r[col.name]).join(', ')}`);
const missing=Object.keys(current).filter(gss=>!councils[gss]);
if(missing.length||Object.keys(councils).length!==296)fail(`collectionRates: coverage ${Object.keys(councils).length}, missing ${missing.join(', ')}`);

// Cells as printed in the 31 July 2026 revision. A changed edition must fail here, not publish.
const expect = (label,actual,printed) => {if(JSON.stringify(actual)!==JSON.stringify(printed))fail(`collectionRates assertion ${label}: file has ${JSON.stringify(actual)}, expected ${JSON.stringify(printed)}`);};
const pick = r => [r.areaName,r.collectable,r.collected,r.rate,r.olderArrears,r.yearArrears,r.totalArrears];
expect('England',pick(england),['England',44981384,43002543,95.6,5259524,2164414,7423938]);
expect('Adur',pick(councils.E07000223),['Adur',54224,52046,95.98,5052,2226,7278]);
expect('Burnley',pick(councils.E07000117),['Burnley',60689,57102,94.09,11411,4430,15841]);
expect('Bradford',pick(councils.E08000032),['Bradford',341368,319318,93.54,27034,23945,50979]);
expect('Kensington & Chelsea',pick(councils.E09000020),['Kensington & Chelsea',162752,148366,91.16,18960,14794,33754]);
expect('Stoke-on-Trent',pick(councils.E06000021),['Stoke-on-Trent',144750,137585,95.05,24023,11167,35190]);
expect('South Hams',pick(councils.E07000044),['South Hams',115424,113705,98.51,5514,1764,7278]);
const unknown=Object.values(councils).filter(c=>[c.rate,c.olderArrears,c.yearArrears,c.totalArrears].includes(null)).length;

const output={schemaVersion:1,source,england,councils};
writeFileSync('data/collection/collection-rates-2025-26.json',JSON.stringify(output,null,1)+'\n');
console.log(`Imported council tax collection for ${Object.keys(councils).length} councils, ${y}; England in-year rate ${england.rate.toFixed(2)}%, arrears £${england.totalArrears} thousand; ${unknown} councils with an unknown cell.`);
