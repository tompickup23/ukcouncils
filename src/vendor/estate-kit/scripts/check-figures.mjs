#!/usr/bin/env node
// Fails when a file types a figure instead of taking it by key, or names a key the figure
// set does not hold. Generalised from the Burnley film's scripts/check-figures.mjs to read
// Astro, MDX and TypeScript, and to know the kit's component props.
//
// Usage: estate-kit-check-figures --figures <figures.json> <dir or file> [...]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const args = process.argv.slice(2);
const at = args.indexOf("--figures");
if (at === -1 || !args[at + 1]) {
  console.error("usage: estate-kit-check-figures --figures <figures.json> <dir or file> [...]");
  process.exit(2);
}
const figures = JSON.parse(readFileSync(args[at + 1], "utf8"));
const roots = args.filter((_, i) => i !== at && i !== at + 1);

const FIGURE_LIKE = [/£\s?\d/, /\d[\d,.]*\s?%/, /\b\d+p\b/, /\b\d+ in \d+\b/, /\d[\d,.]*\s?(m|bn|million|billion)\b/];
// fig("k"), show("k"), figure="k", figure={"k"}, figures={["a", "b"]}, keys: ["a"], and {k} slots in titles.
const KEY_CALL = /\b(?:fig|show|value|series|caption)\(\s*["'`]([^"'`]+)["'`]/g;
const KEY_PROP = /\b(?:figure|whole|total|majority)=\{?\s*["'`]([^"'`]+)["'`]/g;
const KEY_LIST = /\b(?:figures|keys|series|parts|parties)=?\{?\s*:?\s*\[([^\]]*)\]/g;
// Slots are read only inside string literals, so {c.file} in a template expression is code.
const STRING = /"[^"]*"|'[^']*'|`[^`]*`/g;
const SLOT = /(?<!\$)\{([a-z0-9_]+(?:\.[a-z0-9_]+)+)(?::(?:full|round|short))?\}/g;
const EXTS = new Set([".astro", ".mdx", ".md", ".ts", ".tsx", ".js", ".jsx", ".mjs"]);

function knownKey(key) {
  if (!key.includes("${")) return key in figures;
  const re = new RegExp("^" + key.split(/\$\{[^}]*\}/).map((s) => s.replace(/[.*+?^()|[\]\\]/g, "\\$&")).join(".+") + "$");
  return Object.keys(figures).some((k) => re.test(k));
}

const files = [];
const walk = (p) => {
  if (statSync(p).isDirectory()) { for (const n of readdirSync(p)) if (!["node_modules", "dist", ".astro"].includes(n)) walk(join(p, n)); }
  else if (EXTS.has(extname(p))) files.push(p);
};
roots.forEach(walk);

const problems = [];
for (const f of files) {
  let inStyle = false;
  readFileSync(f, "utf8").split("\n").forEach((line, i) => {
    // Style blocks hold widths and percentages that are layout, not figures.
    if (/<style\b/.test(line)) inStyle = true;
    if (inStyle) { if (/<\/style>/.test(line)) inStyle = false; return; }
    if (line.includes("figure-ok")) return;
    const code = line.replace(/\/\/.*$/, "").replace(/<!--.*?-->/g, "");
    for (const re of FIGURE_LIKE) if (re.test(code)) problems.push(`${f}:${i + 1} typed figure: ${line.trim()}`);
    const keys = [
      ...[...code.matchAll(KEY_CALL)].map((m) => m[1]),
      ...[...code.matchAll(KEY_PROP)].map((m) => m[1]),
      ...[...code.matchAll(KEY_LIST)].flatMap((m) => [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1])),
      ...(code.match(STRING) ?? []).flatMap((str) => [...str.matchAll(SLOT)].map((m) => m[1]))
    ];
    for (const key of keys) if (!knownKey(key)) problems.push(`${f}:${i + 1} unknown figure key "${key}"`);
  });
}
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }
console.log(`check-figures: ${files.length} files clean, ${Object.keys(figures).filter((k) => !k.startsWith("$")).length} figures available`);
