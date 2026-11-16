/**
 * Copies the list of councils with a "Set the budget" page on UK Council Tax.
 *
 * UK Council Tax owns set mode and decides which councils have it. Its
 * eligibility file is read from that repository's origin/main (never imported
 * at build time), checked against the live UK Council Tax sitemap, and saved
 * here with the source file's SHA256 pinned. Builds only read the saved copy.
 *
 *   node scripts/copy-ukcounciltax-set.mjs           write the copy
 *   node scripts/copy-ukcounciltax-set.mjs --check   fail if the copy has drifted
 *
 * UKCT_DIR names the UK Council Tax checkout (default ~/ukcounciltax).
 * --check --offline compares with origin/main only, without the live sitemap.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { eligibleDigest, SET_MANIFEST_PATH } from "./lib/ukcounciltax-set.mjs";

const SOURCE_PATH = "data/pilots/budget-freeze-eligibility.json";
const SITEMAP = "https://ukcounciltax.co.uk/sitemap.xml";
const HUB = "https://ukcounciltax.co.uk/tools/budget/";
const check = process.argv.includes("--check");
const offline = process.argv.includes("--offline");
const repo = process.env.UKCT_DIR ?? join(homedir(), "ukcounciltax");

const git = (...args) => execFileSync("git", ["-C", repo, ...args], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
if (!check || !offline) git("fetch", "-q", "origin");
const commit = git("rev-parse", "origin/main").trim();
const raw = git("show", `origin/main:${SOURCE_PATH}`);
const sha256 = (await import("node:crypto")).createHash("sha256").update(raw).digest("hex");
const source = JSON.parse(raw);

const eligible = source.councils
  .filter((council) => council.eligible === true)
  .map(({ gss, slug, name }) => ({ gss, slug, name }))
  .sort((a, b) => a.gss.localeCompare(b.gss));
if (eligible.length !== source.eligible) throw new Error(`Eligibility file says ${source.eligible}, lists ${eligible.length}`);

let live = null;
if (!offline) {
  const response = await fetch(SITEMAP);
  if (!response.ok) throw new Error(`Sitemap HTTP ${response.status}`);
  const urls = new Set([...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
  if (!urls.has(HUB)) throw new Error(`${HUB} is not in the live sitemap`);
  const listed = [...urls].filter((url) => /^https:\/\/ukcounciltax\.co\.uk\/tools\/budget\/[^/]+\/set\/$/.test(url));
  const wanted = new Set(eligible.map(({ slug }) => `https://ukcounciltax.co.uk/tools/budget/${slug}/set/`));
  const missing = [...wanted].filter((url) => !urls.has(url));
  const extra = listed.filter((url) => !wanted.has(url));
  if (missing.length || extra.length) throw new Error(`Live sitemap and eligibility file differ: missing ${missing.join(", ") || "none"}; extra ${extra.join(", ") || "none"}`);
  live = { source: SITEMAP, fetched: new Date().toISOString(), setPagesListed: listed.length };
}

const manifest = {
  note: "Copied from UK Council Tax by scripts/copy-ukcounciltax-set.mjs. Do not edit by hand.",
  copiedFrom: {
    repository: "tompickup23/ukcounciltax",
    path: SOURCE_PATH,
    commit,
    sha256,
    edition: source.edition,
    model: source.model,
    reviewedOn: source.reviewedOn,
  },
  hub: HUB,
  verifiedLive: live,
  eligibleSha256: eligibleDigest(eligible),
  eligible,
};

if (check) {
  const saved = JSON.parse(readFileSync(SET_MANIFEST_PATH, "utf8"));
  const drift = [];
  if (saved.copiedFrom.sha256 !== sha256) drift.push(`source SHA256 ${saved.copiedFrom.sha256} pinned, ${sha256} on origin/main (${commit})`);
  if (saved.eligibleSha256 !== manifest.eligibleSha256) drift.push("the eligible list differs");
  if (drift.length) {
    console.error(`UK Council Tax set eligibility has drifted:\n  ${drift.join("\n  ")}\nRun node scripts/copy-ukcounciltax-set.mjs and review the diff.`);
    process.exit(1);
  }
  console.log(`No drift: ${eligible.length} councils, source ${sha256.slice(0, 12)} at ${commit.slice(0, 12)}${live ? `, ${live.setPagesListed} live set pages` : ""}`);
} else {
  if (!live) throw new Error("Writing the copy needs the live sitemap check; drop --offline");
  writeFileSync(SET_MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Copied ${eligible.length} councils from ${SOURCE_PATH} at ${commit.slice(0, 12)}`);
}
