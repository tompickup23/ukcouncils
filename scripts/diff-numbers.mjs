#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, matchesGlob } from 'node:path';
import sax from 'sax';

const usage = 'Usage: node scripts/diff-numbers.mjs <baseline dist dir> <candidate dist dir> [--allow <glob>]...';
const dropped = new Set(['head', 'script', 'style', 'template']);
const raw = new Set(['script', 'style']);
const voids = new Set('area base br col embed hr img input link meta param source track wbr'.split(' '));
const breaks = new Set('address article aside blockquote br dd div dl dt fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p pre section table tbody td th thead tr ul text'.split(' '));

function decode(text) {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z][\da-z]+);/gi, (whole, entity) => {
    if (!entity.startsWith('#')) return sax.ENTITIES[entity] ?? whole;
    const value = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff)
      ? String.fromCodePoint(value) : '\ufffd';
  });
}

// A static text walk, not a browser layout calculation. Inline text stays joined
// so a pound sign or decimal split across spans still belongs to its figure.
function visibleText(html) {
  const text = { body: '', svg: '' };
  const stack = [];
  const markup = /<!--[\s\S]*?(?:-->|$)|<![^>]*>|<\?[\s\S]*?\?>|<\/?[a-zA-Z][^>"']*(?:(?:"[^"]*"|'[^']*')[^>"']*)*>/g;
  const append = (value) => {
    if (stack.some((node) => node.skip)) return;
    const svg = stack.some((node) => node.name === 'svg');
    if (svg && !stack.some((node) => node.name === 'text')) return;
    text[svg ? 'svg' : 'body'] += value;
  };
  let position = 0;
  let match;
  while ((match = markup.exec(html))) {
    append(decode(html.slice(position, match.index)));
    const tag = match[0];
    position = markup.lastIndex;
    if (!/^<\/?[a-z]/i.test(tag)) continue;
    const name = /^<\/?([^\s/>]+)/.exec(tag)[1].toLowerCase();
    if (breaks.has(name) || name === 'svg') append('\n');
    if (tag.startsWith('</')) {
      const index = stack.findLastIndex((node) => node.name === name);
      if (index >= 0) stack.length = index;
    } else {
      const attributes = [...tag.matchAll(/([^\s=<>/'"]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)]
        .slice(1).map((m) => [m[1].toLowerCase(), decode(m[2] ?? m[3] ?? m[4] ?? '')]);
      const attrs = Object.fromEntries(attributes);
      const skip = dropped.has(name) || Object.hasOwn(attrs, 'hidden')
        || /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\s*(?:!important\s*)?(?:;|$)/i.test(attrs.style ?? '');
      if (!voids.has(name) && !(tag.endsWith('/>') && (name === 'svg' || stack.some((node) => node.name === 'svg')))) {
        stack.push({ name, skip });
      }
      // Raw script and style contents can contain fake closing tags and markup.
      if (raw.has(name)) {
        const closing = new RegExp(`</${name}\\s*>`, 'ig');
        closing.lastIndex = position;
        const end = closing.exec(html);
        position = end ? end.index : html.length;
        markup.lastIndex = position;
      }
    }
    if (breaks.has(name) || name === 'svg') append('\n');
  }
  append(decode(html.slice(position)));
  return text;
}

function tokens(text) {
  const pattern = /£?[ \t\u00a0\u202f]*\d{4}\/\d{2}(?:\d{2})?|£?[ \t\u00a0\u202f]*(?:\d{1,3}(?:[,\u00a0\u202f\u2009 ]\d{3})+|\d+)(?:\.\d+)?(?:[ \t\u00a0\u202f]*%)?/g;
  const counts = new Map();
  for (const match of text.matchAll(pattern)) {
    const token = match[0].trim().replace(/[\u00a0\u202f\u2009]/g, ' ').replace(/^£\s+/, '£').replace(/\s+%$/, '%');
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return counts;
}

function subtract(left, right) {
  return [...left].sort(([a], [b]) => a.localeCompare(b, 'en-GB'))
    .flatMap(([token, count]) => Array(Math.max(0, count - (right.get(token) ?? 0))).fill(token));
}

function pages(root) {
  if (!statSync(root).isDirectory()) throw new Error('Both build paths must be directories.');
  const found = new Map();
  function walk(directory, prefix = '') {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const relative = prefix + entry.name;
      if (entry.isDirectory()) walk(join(directory, entry.name), `${relative}/`);
      else if (entry.isFile() && entry.name.endsWith('.html')) found.set(relative, join(directory, entry.name));
    }
  }
  walk(root);
  return found;
}

function main(args) {
  if (args.length < 2 || args[0].startsWith('--') || args[1].startsWith('--')) throw new Error(usage);
  const [baseline, candidate, ...options] = args;
  const allowed = [];
  for (let i = 0; i < options.length; i += 2) {
    if (options[i] !== '--allow' || !options[i + 1] || options[i + 1].startsWith('--')) throw new Error(usage);
    allowed.push(options[i + 1].replace(/^\//, ''));
  }
  const before = pages(baseline);
  const after = pages(candidate);
  let differing = 0, added = 0, removed = 0, unallowed = 0;
  console.log('Path\tStatus\tBody only in baseline\tBody only in candidate\tSVG only in baseline\tSVG only in candidate\tLocation\tAllowed');
  for (const path of [...new Set([...before.keys(), ...after.keys()])].sort()) {
    const left = before.has(path) ? visibleText(readFileSync(before.get(path), 'utf8')) : { body: '', svg: '' };
    const right = after.has(path) ? visibleText(readFileSync(after.get(path), 'utf8')) : { body: '', svg: '' };
    const columns = ['body', 'svg'].flatMap((kind) => {
      const a = tokens(left[kind]), b = tokens(right[kind]);
      return [subtract(a, b), subtract(b, a)];
    });
    const body = columns[0].length + columns[1].length > 0;
    const svg = columns[2].length + columns[3].length > 0;
    const status = !before.has(path) ? 'added' : !after.has(path) ? 'removed' : 'changed';
    if (status === 'changed' && !body && !svg) continue;
    if (status === 'added') added++;
    else if (status === 'removed') removed++;
    else differing++;
    const allow = allowed.some((glob) => matchesGlob(path, glob));
    if (!allow) unallowed++;
    console.log([JSON.stringify(path), status, ...columns.map((column) => JSON.stringify(column)), body && svg ? 'both' : svg ? 'SVG text' : body ? 'body text' : 'no number tokens', allow ? 'yes' : 'no'].join('\t'));
  }
  console.log(`Summary: ${differing} pages differing; ${added} pages added; ${removed} pages removed; ${unallowed} pages outside allowed globs.`);
  return unallowed ? 1 : 0;
}

try {
  process.exitCode = main(process.argv.slice(2));
} catch (error) {
  console.error(`Number comparison could not run: ${error.message}`);
  process.exitCode = 2;
}
