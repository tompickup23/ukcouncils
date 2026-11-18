#!/usr/bin/env node
// Checks a pull request description before it is opened or edited, using the same parser
// the hosted number diff and design check use (.github/scripts/review-inputs.mjs). A description they cannot read costs a
// whole hosted run, and so does every edit that corrects it.
//
//   node scripts/check-pr-body.mjs body.md     a draft description in a file
//   node scripts/check-pr-body.mjs --pr 64     the description of an open pull request
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, matchesGlob, relative } from 'node:path';
import { capturePaths, fencedLines } from '../.github/scripts/review-inputs.mjs';

const ALLOW = 'Pages allowed to differ';
const CAPTURE = 'Pages to capture';

const hasHeading = (body, heading) => body.replace(/\r\n/g, '\n').split('\n')
  .some((line) => line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/\s+#+\s*$/, '').trim() === heading);

function builtFiles(dir) {
  if (!existsSync(dir)) return null;
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
    .map((entry) => relative(dir, join(entry.parentPath, entry.name)));
}

/**
 * Nothing here reads the network.
 * @param {string} body the pull request description
 * @param {string[] | null} [files] built HTML paths relative to dist, or null when there is no dist
 * @returns {{errors: string[], warnings: string[], notes: string[]}}
 */
export function checkBody(body, files = null) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const notes = [];
  /** @type {string[]} */ let globs = [];
  try {
    globs = fencedLines(body, ALLOW);
    if (!hasHeading(body, ALLOW)) notes.push(`No "${ALLOW}" heading: the number diff runs strict, with no page allowed to differ.`);
    else if (!globs.length) notes.push(`"${ALLOW}" is empty: the number diff runs strict, with no page allowed to differ.`);
    else notes.push(`${globs.length} allowed glob${globs.length === 1 ? '' : 's'} read under "${ALLOW}".`);
  } catch (error) {
    errors.push(`Number diff: ${error.message}`);
  }
  for (const glob of globs) {
    // The comparison matches built file paths such as councils/burnley/index.html, never URLs.
    const pattern = glob.replace(/^\//, '');
    if (pattern.endsWith('/') || pattern === '') {
      errors.push(`Allowed glob "${glob}" ends in a slash and can match no built file. Write "${glob}index.html" or "${glob}**".`);
    } else if (files && !files.some((file) => matchesGlob(file, pattern))) {
      warnings.push(`Allowed glob "${glob}" matches no HTML file in dist.`);
    }
  }
  try {
    const paths = capturePaths(body);
    const explicit = fencedLines(body, CAPTURE).length > 0;
    notes.push(explicit
      ? `${paths.length} capture path${paths.length === 1 ? '' : 's'} read under "${CAPTURE}".`
      : `No paths under "${CAPTURE}": the design check captures its default pages, / and /councils/burnley/.`);
    if (files && explicit) {
      for (const path of paths) {
        const file = `${path.replace(/^\//, '')}${path.endsWith('/') ? 'index.html' : ''}`;
        if (!files.includes(file)) warnings.push(`Capture path "${path}" is not a page in dist.`);
      }
    }
  } catch (error) {
    errors.push(`Design check: ${error.message}`);
  }
  return { errors, warnings, notes };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let body;
  if (args[0] === '--pr' && /^\d+$/.test(args[1] ?? '')) {
    body = execFileSync('gh', ['pr', 'view', args[1], '--json', 'body', '--jq', '.body'], { encoding: 'utf8' });
  } else if (args.length === 1 && existsSync(args[0])) {
    body = readFileSync(args[0], 'utf8');
  } else {
    console.error('Usage: node scripts/check-pr-body.mjs <file> | --pr <number>');
    process.exit(2);
  }
  const files = builtFiles('dist');
  const { errors, warnings, notes } = checkBody(body, files);
  for (const note of notes) console.log(`ok    ${note}`);
  if (!files) console.log('ok    No dist here, so globs and capture paths were not checked against built pages.');
  for (const warning of warnings) console.log(`warn  ${warning}`);
  for (const error of errors) console.log(`FAIL  ${error}`);
  process.exit(errors.length ? 1 : 0);
}
