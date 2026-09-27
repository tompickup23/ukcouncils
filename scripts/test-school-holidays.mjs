import assert from 'node:assert/strict';
import {readFeed,selectCalendar,validateFeed,sha256} from './calendar-contract.mjs';
const {feed,manifest,bytes}=readFeed('data/school-holidays');
const burnley=selectCalendar(feed,{gss:'E07000117',parentGss:'E10000017'});
assert.equal(burnley.authority.gss,'E10000017');
assert.equal(selectCalendar(feed,{gss:'N09000003',parentGss:null}),null);
assert.equal(selectCalendar(feed,{gss:'E09000010',parentGss:null}),null);
assert.equal(selectCalendar(feed,{gss:'E00000000',parentGss:null}),null);
assert.throws(()=>validateFeed(manifest,Buffer.from('changed')));
const mutated=structuredClone(feed);mutated.authorities.E10000017.publicationHolds.push({academic_year:feed.currentYear});
const raw=Buffer.from(JSON.stringify(mutated));
assert.throws(()=>validateFeed({...manifest,sha256:sha256(raw),bytes:raw.length},raw));
assert.ok(bytes.length>0);console.log('Calendar integrity, hold, advisory, unknown and parent-join tests passed');

assert.equal(feed.authorities.W06000016.url,'https://ukschoolholidaydates.co.uk/wales/rhondda-cynon-taf/');
