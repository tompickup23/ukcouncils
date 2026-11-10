import {existsSync} from 'node:fs';
import {it,expect} from 'vitest';
import {reorganisationChecks} from '../scripts/lib/reorganisation-checks.mjs';
it.skipIf(!existsSync('dist/councils/burnley/index.html'))('holds every built programme count and named source anchor',()=>{
  const result=reorganisationChecks(process.cwd(),'dist');
  expect(result.failures).toEqual([]);
  expect(result.counts).toEqual({areas:21,panels:184,absent:112,counties:21,documentsOnly:14,maps:184,rails:170,steps:850,status:{order:11,'minded-to':29,'withdrawn-2026-10':91,'withdrawn-2026-09':40,undecided:13}});
},30000);
