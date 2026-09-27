import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
export const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
export function validateFeed(manifest, bytes) {
 if(manifest.schemaVersion !== 1 || sha256(bytes) !== manifest.sha256 || bytes.length !== manifest.bytes) throw Error('Calendar snapshot integrity failed');
 const feed = JSON.parse(bytes);
 if(feed.schemaVersion !== 1 || !feed.currentYear || !feed.inputSha256 || !feed.authorities) throw Error('Unsupported calendar contract');
 for(const [gss,row] of Object.entries(feed.authorities)) {
  if(gss !== row.gss || !/^[ENSW][0-9]{8}$/.test(gss)) throw Error('Invalid authority identity');
  if(new URL(row.url).origin !== 'https://ukschoolholidaydates.co.uk') throw Error('Unapproved calendar destination');
  for(const [ay,y] of Object.entries(row.years)) {
   if(row.scope !== 'authority' || !['current','future_only'].includes(row.status)) throw Error('Unpublished calendar');
   if(row.publicationHolds.some(h => h.academic_year === ay)) throw Error('Held calendar');
   if(ay !== y.academicYear || !y.evidenceSha256.length || y.evidenceSha256.some(h=>!/^[a-f0-9]{64}$/.test(h))) throw Error('Missing calendar evidence');
   if(!/^https?:$/.test(new URL(y.sourceUrl).protocol)) throw Error('Invalid source URL');
   for(const e of y.breaks) if(!/^\d{4}-\d{2}-\d{2}$/.test(e.start) || !/^\d{4}-\d{2}-\d{2}$/.test(e.end) || e.start>e.end) throw Error('Invalid break range');
  }
 }
 return feed;
}
export function readFeed(directory) {
 const manifest=JSON.parse(fs.readFileSync(path.join(directory,'manifest.json'),'utf8'));
 if(manifest.file !== `calendar-${manifest.sha256}.json`) throw Error('Invalid snapshot filename');
 const bytes=fs.readFileSync(path.join(directory,manifest.file));
 return {manifest,bytes,feed:validateFeed(manifest,bytes)};
}
export function selectCalendar(feed, place) {
 // A district uses its explicit education parent, never a name or proximity join.
 const row=feed.authorities[place.parentGss || place.gss];
 if(!row || row.scope !== 'authority') return null;
 const year=row.years[feed.currentYear];
 if(!year) return null;
 return {authority:row,year,snapshotDate:feed.snapshotDate};
}
