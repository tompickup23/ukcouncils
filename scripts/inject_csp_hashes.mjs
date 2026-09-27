/**
 * Writes the sha256 hashes of the built tree's inline scripts into dist/_headers.
 *
 * Ported from aidoge-site. The CSP allows no inline script and no
 * 'unsafe-inline'. Astro inlines some blocks anyway: component scripts small
 * enough to cost less than a request, and the island runtime if an island is
 * ever added. No configuration turns that off, and `astro dev` and
 * `astro preview` apply no headers, so a blocked script only shows on the host.
 *
 * A hash allows exactly the bytes that were built and nothing else. Running
 * this after every build keeps the two in step: the hashes are never written by
 * hand, so they cannot go stale, and a changed script changes the header in the
 * same commit.
 *
 * public/_headers stays the template and holds no hashes. This rewrites the
 * copy of it in dist/, which is the file Cloudflare Pages reads.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = resolve(process.cwd(), "dist");
const HEADERS = join(DIST, "_headers");

/**
 * The script types a browser executes. Anything else in a <script> tag is data
 * the CSP does not govern: `application/ld+json` is the one this site ships,
 * and hashing it would put a hash in the header for bytes no engine ever runs.
 */
const EXECUTABLE = new Set(["", "module", "text/javascript", "application/javascript", "importmap"]);

const SCRIPT = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

function typeOf(attributes) {
  const match = /\btype\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes);
  if (!match) return "";
  return (match[2] ?? match[3] ?? match[4] ?? "").trim().toLowerCase();
}

export function hashOf(body) {
  return `sha256-${createHash("sha256").update(body, "utf-8").digest("base64")}`;
}

/** Every executable inline script in one HTML document, in source order. */
export function inlineScripts(html) {
  const found = [];
  for (const match of html.matchAll(SCRIPT)) {
    const [, attributes, body] = match;
    // An external script carries the code at its src and an empty body. Only a
    // body with something in it is inline script under the CSP.
    if (!body.trim()) continue;
    if (!EXECUTABLE.has(typeOf(attributes))) continue;
    found.push(body);
  }
  return found;
}

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith(".html")) yield path;
  }
}

/**
 * The set of hashes the built tree needs, with one example page per hash so a
 * failure names somewhere to look rather than a bare digest.
 */
export function hashesIn(dist = DIST) {
  const seen = new Map();
  for (const file of htmlFiles(dist)) {
    for (const body of inlineScripts(readFileSync(file, "utf-8"))) {
      const hash = hashOf(body);
      if (!seen.has(hash)) {
        seen.set(hash, { page: file.slice(dist.length) || "/", bytes: body.length });
      }
    }
  }
  return seen;
}

/** The tokens of one directive of the policy on the line, hashes and all. */
export function scriptSrcOf(headers, name = "script-src") {
  const line = headers.split("\n").find((l) => l.includes("Content-Security-Policy:")) ?? "";
  const policy = line.split("Content-Security-Policy:")[1] ?? "";
  const directive = policy.split(";").map((p) => p.trim()).find((p) => p.startsWith(name)) ?? "";
  return directive.replace(new RegExp(`^${name}`), "").trim().split(/\s+/).filter(Boolean);
}

function rewrite(headers, hashes) {
  return headers.split("\n").map((line) => {
    if (!line.includes("Content-Security-Policy:")) return line;
    return line.replace(/script-src([^;]*)/, (_all, tokens) => {
      // Re-running over an already written file must not stack a second copy of
      // the hashes, so the existing ones are dropped before the new ones go on.
      const kept = tokens.trim().split(/\s+/).filter((t) => t && !t.startsWith("'sha256-"));
      return ["script-src", ...kept, ...hashes.map((h) => `'${h}'`)].join(" ");
    });
  }).join("\n");
}

function main() {
  let headers;
  try {
    headers = readFileSync(HEADERS, "utf-8");
  } catch {
    console.error("dist/_headers is not there. Run astro build first.");
    process.exit(1);
  }

  const found = hashesIn();
  const hashes = [...found.keys()].sort();
  writeFileSync(HEADERS, rewrite(headers, hashes));

  const listed = [...found.entries()]
    .map(([hash, where]) => `  ${hash}  ${where.bytes} bytes  ${where.page}`)
    .join("\n");
  console.log(`csp: allowed ${hashes.length} inline scripts in dist/_headers\n${listed}`);
}

// Importable from a test without running the write.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
