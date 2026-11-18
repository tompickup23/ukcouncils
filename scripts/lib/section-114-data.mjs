import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';

export const NOTICE_PATHS = ['data/budget/section-114-manifest.json', 'data/budget/section-114-2026-11-18.json'];
export const NOTICE_COVERAGE = 'This register lists original notices this site has inspected and is not exhaustive. No entry is not a statement that no notice was issued.';
export const NOTICE_ABSENCE = `This profile has no entry in this register. ${NOTICE_COVERAGE}`;
const IDENTITY_METHOD = 'Reviewed original council heading and council-owned host against the billing profile identity; not a GSS code printed by the publisher.';
const keys = (value, expected) => assert.deepEqual(Object.keys(value).sort(), [...expected].sort(), 'Unexpected notice fields');
const date = value => {
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10), value, 'Invalid notice date');
};
const hosts = {
  E06000018: ['www.nottinghamcity.gov.uk'], E06000034: ['www.thurrock.gov.uk'],
  E06000039: ['www.slough.gov.uk'], E06000057: ['northumberland.moderngov.co.uk'],
  E07000217: ['woking.moderngov.co.uk'], E08000025: ['www.birmingham.gov.uk'],
  E09000003: ['barnet.moderngov.co.uk'], E09000008: ['www.croydon.gov.uk', 'croydon.moderngov.co.uk'],
};

export function validateNotices(register, root = process.cwd()) {
  keys(register, ['reviewed', 'coverage', 'licence', 'records']);
  date(register.reviewed);
  assert.equal(register.coverage, 'Original notices inspected by this site; not an exhaustive register.');
  assert.equal(register.licence, 'Council copyright. Factual identification only; originals are not redistributed.');
  const registry = JSON.parse(readFileSync(resolve(root, 'data/registry/councils.json'), 'utf8')).councils;
  const tax = JSON.parse(readFileSync(resolve(root, 'data/council-tax/england-2026-27.json'), 'utf8')).authorities;
  const seen = new Set();
  const profiles = new Map();
  assert(Array.isArray(register.records) && register.records.length > 0);
  for (const row of register.records) {
    keys(row, ['id', 'council', 'gss', 'identity', 'notice_date', 'printed_date', 'act', 'provision', 'url', 'locator', 'retrieved', 'inspection', 'original_sha256']);
    keys(row.identity, ['status', 'method', 'profile_slug', 'profile_name']);
    keys(row.locator, ['pages', 'paragraphs']);
    date(row.notice_date); date(row.retrieved);
    assert(row.notice_date <= row.retrieved && row.retrieved <= register.reviewed);
    assert.equal(row.id, `${row.gss}-${row.notice_date}`);
    assert(!seen.has(row.id), 'Duplicate notice'); seen.add(row.id);
    assert(tax[row.gss] && registry[row.gss], 'Notice has no billing profile identity');
    assert.equal(row.identity.status, 'assigned');
    assert.equal(row.identity.method, IDENTITY_METHOD);
    assert.equal(row.identity.profile_slug, registry[row.gss].slug);
    assert.equal(row.identity.profile_name, registry[row.gss].officialName);
    assert.equal(row.council, row.gss === 'E09000008' ? 'Croydon Council' : row.identity.profile_name);
    assert.equal(row.act, 'Local Government Finance Act 1988');
    assert.match(row.provision, /^114 ?\([123]\)(?: ?\([a-c]\))?$/);
    assert.match(row.printed_date, /^(?:\d{2}\/\d{2}\/\d{2}|\d{1,2}(?:st|nd|rd|th)? [A-Z][a-z]+ \d{4}|[A-Z][a-z]+ \d{1,2}(?:st|nd|rd|th)?, \d{4})$/);
    const slashDate = /^(\d{2})\/(\d{2})\/(\d{2})$/.exec(row.printed_date);
    const printedIso = slashDate ? `20${slashDate[3]}-${slashDate[2]}-${slashDate[1]}`
      : new Date(`${row.printed_date.replace(/(\d)(st|nd|rd|th)/g, '$1')} 00:00:00 GMT`).toISOString().slice(0, 10);
    assert.equal(printedIso, row.notice_date, 'Printed issue date differs from notice date');
    const url = new URL(row.url);
    assert(url.protocol === 'https:' && !url.username && !url.password && hosts[row.gss]?.includes(url.hostname), 'Notice URL is not the reviewed council host');
    assert(Array.isArray(row.locator.pages) && row.locator.pages.length > 0);
    assert(row.locator.pages.every(page => Number.isSafeInteger(page) && page > 0));
    assert.equal(new Set(row.locator.pages).size, row.locator.pages.length);
    assert(Array.isArray(row.locator.paragraphs) && row.locator.paragraphs.every(p => /^\d+\.\d+$/.test(p)));
    if (row.original_sha256 === null) assert.equal(row.inspection, 'original PDF read through web reader; binary download blocked');
    else {
      assert.match(row.original_sha256, /^[a-f0-9]{64}$/);
      assert.equal(row.inspection, 'original PDF read');
    }
    profiles.set(row.gss, [...(profiles.get(row.gss) ?? []), row]);
  }
  for (const rows of profiles.values()) rows.sort((a, b) => a.notice_date.localeCompare(b.notice_date));
  return profiles;
}

export function loadNotices(root = process.cwd()) {
  const manifest = JSON.parse(readFileSync(resolve(root, NOTICE_PATHS[0]), 'utf8'));
  keys(manifest, ['files']);
  assert.equal(manifest.files.length, 1);
  const file = manifest.files[0];
  keys(file, ['path', 'sha256']);
  assert.equal(file.path, NOTICE_PATHS[1]);
  assert.match(file.sha256, /^[a-f0-9]{64}$/);
  const bytes = readFileSync(resolve(root, file.path));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, 'Unpinned notice file');
  const register = JSON.parse(bytes);
  return {register, profiles: validateNotices(register, root)};
}

export const noticeDate = iso => new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'}).format(new Date(`${iso}T00:00:00Z`));
export const noticeLocator = row => `${row.locator.pages.length === 1 ? 'Page' : 'Pages'} ${row.locator.pages.join(', ')}${row.locator.paragraphs.length ? `; ${row.locator.paragraphs.length === 1 ? 'paragraph' : 'paragraphs'} ${row.locator.paragraphs.join(', ')}` : ''}`;
export const noticeLine = row => `${noticeDate(row.notice_date)}: report under section ${row.provision} of the ${row.act}.`;
export const noticeSource = row => ({publisher: row.council, title: `report under section ${row.provision} of the ${row.act}`,
  url: row.url, table: `${noticeLocator(row)}; issued ${noticeDate(row.notice_date)}; retrieved ${noticeDate(row.retrieved)}`});
