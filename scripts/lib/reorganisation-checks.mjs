import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import {outsideReorganisation} from './held-wording.mjs';
const text = html => html.replace(/<[^>]*>/g,' ').replace(/&#39;|&#x27;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const panel = html => /<section\b[^>]*\bid="reorganisation"[^>]*>[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
export function reorganisationChecks(root,dist) {
  const data=JSON.parse(readFileSync(join(root,'data/reorganisation/areas.json'),'utf8'));
  const registry=JSON.parse(readFileSync(join(root,'data/registry/councils.json'),'utf8')).councils;
  const tax=JSON.parse(readFileSync(join(root,'data/council-tax/england-2026-27.json'),'utf8')).authorities;
  const failures=[];const check=(ok,message)=>{if(!ok)failures.push(message);};
  const expected=new Map(data.areas.flatMap(a=>a.councils.filter(c=>c.role!=='county').map(c=>[c.gss,a])));
  const counts={areas:data.areas.length,panels:0,absent:0,counties:0,documentsOnly:0,maps:0,status:{}};
  const built=new Map();
  for(const c of Object.values(registry).filter(c=>tax[c.gss])) {
    const html=readFileSync(join(dist,'councils',c.slug,'index.html'),'utf8');const p=panel(html);built.set(c.slug,{html,p});
    const area=expected.get(c.gss);check(Boolean(p)===Boolean(area),`Panel membership ${c.slug}`);
    if(!p){counts.absent++;continue;}
    counts.panels++;counts.status[area.status]=(counts.status[area.status]??0)+1;
    if(p.includes('data-documents-only'))counts.documentsOnly++;
    counts.maps+=(p.match(/data-area-map(?:[\s=>])/g)??[]).length;
    check((p.match(/data-step=/g)??[]).length===5,`Five rail steps ${c.slug}`);
    check(p.includes(`data-reorganisation-panel="${area.id}"`)&&p.includes(`data-reorganisation-status="${area.status}"`),`Panel identity ${c.slug}`);
    const prose=p.replace(/<p\b[^>]*class="source-line[^\"]*"[^>]*>[\s\S]*?<\/p>/g,'');
    check(!/£|%|population|saving|cost|funding|cancel|scrap|delay|chaos|blow|U-turn/i.test(text(prose)),`Restricted panel wording ${c.slug}`);
    check(!/[\u2013\u2014]|&(?:m|n)dash;|&#821[12];|\x20-\x20/.test(p),`Panel house style ${c.slug}`);
    check(!/<script|<astro-island|<details/.test(p),`Static visible panel ${c.slug}`);
    const members=[...p.matchAll(/data-member="([^"]+)"/g)].map(m=>m[1]).sort();
    check(JSON.stringify(members)===JSON.stringify(area.councils.filter(c=>c.role!=='county').map(c=>c.gss).sort()),`Map membership ${c.slug}`);
  }
  for(const a of data.areas) for(const c of a.councils.filter(c=>c.role==='county')) {
    counts.counties++;const slug=c.name.replace(/ County Council$/,'').toLowerCase().replaceAll(' ','-');
    check(!existsSync(join(dist,'councils',slug,'index.html')),`County page ${slug}`);
  }
  for(const [key,value] of Object.entries({areas:21,panels:184,absent:112,counties:21,documentsOnly:14,maps:184}))check(counts[key]===value,`Reorganisation ${key}: ${counts[key]}, expected ${value}`);
  check(JSON.stringify(Object.entries(counts.status).sort())===JSON.stringify(Object.entries({order:11,'minded-to':29,'withdrawn-2026-10':91,'withdrawn-2026-09':40,undecided:13}).sort()),'Reorganisation status totals');
  const anchors={elmbridge:['SI 2026/264','1 April 2027','Elmbridge Borough Council','East Surrey Council','wound up and dissolved'],woking:['West Surrey Council','Woking Borough Council','1 April 2027'],cheltenham:['29 October 2026','minimum of three weeks','Not yet dated by MHCLG','April 2029'],'west-berkshire':['Ridgeway','was not part of the original invitation'],lewes:['four wards'],burnley:['Not yet dated by MHCLG'],'isle-of-wight':['No changes have been proposed for the Isle of Wight'],norwich:['7 September 2026',"1 April 2029, the government's stated timetable"],shepway:['Folkestone and Hythe']};
  for(const [slug,needles] of Object.entries(anchors))for(const needle of needles)check(text(built.get(slug)?.p??'').includes(needle),`Reorganisation anchor ${slug}: ${needle}`);
  check(!built.get('birmingham')?.p,'Birmingham panel absent');
  check(!built.get('shepway')?.p.includes('Shepway'),'No registry display name in Kent panel');
  check(!outsideReorganisation(built.get('woking')?.html??'').toLowerCase().includes('abolished'),'Woking abolition outside panel');
  for(const [slug,needles] of Object.entries({elmbridge:['will be abolished on'],cheltenham:['659,000'],'west-berkshire':['265,000'],lewes:['537,000'],burnley:['<q','<blockquote','four unitary']}))for(const needle of needles)check(!built.get(slug)?.p.includes(needle),`Forbidden panel anchor ${slug}: ${needle}`);
  return {counts,failures};
}
