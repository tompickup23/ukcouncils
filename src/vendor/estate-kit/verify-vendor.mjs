#!/usr/bin/env node
// Checks a vendored copy of the kit against the VERSION file beside it, written by the
// kit's scripts/vendor.mjs: every recorded file present and unchanged, and no stray file.
// A site runs this in its build, so a hand edit to the copy fails there and is made in
// the kit instead. The kit copies this file to the root of the vendored folder.
//
//   node src/vendor/estate-kit/verify-vendor.mjs
//
// It has no imports beyond Node, so it runs before the site has installed anything.
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Files a site may keep in the folder that the kit did not put there. */
export const UNRECORDED = ["VERSION", "README.md"];

const walk = (root, dir = root) => readdirSync(dir).filter((name) => name !== ".DS_Store").flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(root, path) : [relative(root, path).split("\\").join("/")];
});

export const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");

/** The files a VERSION file records, as a map from path to hash. */
export function recordedIn(version) {
  return new Map([...version.matchAll(/^sha256 ([0-9a-f]{64}) (.+)$/gm)].map((m) => [m[2], m[1]]));
}

/** Every way the folder differs from its VERSION file. Empty when the copy is intact. */
export function problemsIn(root) {
  if (!existsSync(join(root, "VERSION"))) return ["VERSION is missing"];
  const version = readFileSync(join(root, "VERSION"), "utf8");
  const recorded = recordedIn(version);
  const problems = [];
  if (!/^commit [0-9a-f]{40}$/m.test(version)) problems.push("VERSION names no commit");
  if (!recorded.size) problems.push("VERSION records no files");
  const present = walk(root);
  for (const file of present) if (!recorded.has(file) && !UNRECORDED.includes(file)) problems.push(`${file}: not recorded in VERSION`);
  for (const [file, hash] of recorded) {
    if (!present.includes(file)) { problems.push(`${file}: recorded but missing`); continue; }
    if (sha256(join(root, file)) !== hash) problems.push(`${file}: changed since it was vendored`);
  }
  return problems;
}

const self = fileURLToPath(import.meta.url);
if (process.argv[1] && realpathSync(resolve(process.argv[1])) === realpathSync(self)) {
  const root = process.argv[2] ? resolve(process.argv[2]) : dirname(self);
  const problems = problemsIn(root);
  if (problems.length) {
    console.error(`estate-kit vendored copy: ${problems.length} problem(s)\n${problems.join("\n")}\nChange the kit and vendor again; do not edit the copy.`);
    process.exit(1);
  }
  const version = readFileSync(join(root, "VERSION"), "utf8");
  const line = (key) => version.match(new RegExp(`^${key} (.+)$`, "m"))?.[1] ?? "none";
  console.log(`estate-kit vendored copy: ${recordedIn(version).size} files match VERSION (parts ${line("parts")}, version ${line("version")}, tag ${line("tag")})`);
}
