import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {readFeed, selectCalendar} from './calendar-contract.mjs';
const registry = JSON.parse(readFileSync('data/registry/councils.json','utf8'));
const tax = JSON.parse(readFileSync('data/council-tax/england-2026-27.json','utf8'));
const {feed} = readFeed('data/school-holidays');
const checked = new Date().toISOString();
const sitemap = await (await fetch('https://ukplaces.co.uk/sitemap.xml')).text();
const places = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
const normal = s => s.replace(/&#(?:39|x27);|&apos;/gi,"'").replace(/&amp;/g,'and').normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const queue = [];
for (const council of Object.values(registry.councils)) {
 if (!tax.authorities[council.gss]) continue;
 const calendar = selectCalendar(feed,council);
 const place = [...places].find(url=>new URL(url).pathname === `/places/${council.slug}/`);
 for (const [site,url,identity] of [
  ['ukplaces',place,council], ['ukelections',council.sisters.ukelections,council], ['ukdemographics',council.sisters.ukdemographics,council], ['school',calendar?.authority.url,calendar?.authority]
 ]) if(url) queue.push({gss:council.gss,site,url,identity:{gss:identity.gss,names:[identity.name,identity.officialName,tax.authorities[identity.gss]?.name].filter(Boolean)}});
}
const results = []; const cache = new Map();
async function read(url) {
 if(!cache.has(url)) cache.set(url,(async()=>{try {
  const response = await fetch(url,{signal:AbortSignal.timeout(30000)});
  const html = await response.text();
  return {status:response.status, finalUrl:response.url, html, title:html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]??''};
 } catch(e) {return {status:0,error:e.message,html:'',title:''};}})());
 return cache.get(url);
}
await Promise.all(Array.from({length:6},async()=>{
 while(queue.length) {
  const candidate=queue.shift(); const response=await read(candidate.url);
  const identity = candidate.identity.names.some(name=>(' '+normal(response.title)+' ').includes(' '+normal(name)+' '));
  const ok = response.status===200 && new URL(response.finalUrl).hostname===new URL(candidate.url).hostname && identity;
  results.push({...candidate,status:response.status,title:normal(response.title),verified:ok});
  if(results.length%100===0) console.log(`${results.length} contextual links checked`);
 }
}));
const councils={};
for(const r of results) if(r.verified) (councils[r.gss]??={})[r.site]={url:r.url,title:r.title,checked};
mkdirSync('data/links',{recursive:true});
writeFileSync('data/links/contextual.json',JSON.stringify({checked,councils},null,2)+'\n');
writeFileSync('data/links/checks.json',JSON.stringify({checked,results:results.sort((a,b)=>a.gss.localeCompare(b.gss)||a.site.localeCompare(b.site))},null,2)+'\n');
console.log(JSON.stringify({checked:results.length,verified:results.filter(r=>r.verified).length,withheld:results.filter(r=>!r.verified).map(r=>({gss:r.gss,site:r.site,status:r.status,title:r.title}))}));
