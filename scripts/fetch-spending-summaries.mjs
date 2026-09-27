/**
 * What AI DOGE holds of each council's published spending, for the spending
 * section on a council page.
 *
 *   node scripts/fetch-spending-summaries.mjs            fetch and write
 *   node scripts/fetch-spending-summaries.mjs --offline  re-read .cache only
 *
 * It reads three published files from AI DOGE's public data host:
 *
 *   v1/summaries/index.json     every body AI DOGE has a summary for
 *   v1/summaries/<id>.json      one body's coverage and headline
 *   v1/banks.json               the bodies with a searchable transaction bank
 *
 * and fetches a summary only for a body the council registry links to an AI
 * DOGE page (data/registry/councils.json, `sisters.aidoge`), keyed by the id
 * at the end of that URL. The downloads go to .cache/aidoge-summaries/
 * (gitignored); the committed record is data/spending/aidoge-summaries.json,
 * the same split as council tax: raw files fetched again by the script,
 * derived JSON in git. The raw files sit outside data/ because AI DOGE's free
 * text carries dashes this repo's house style test would find there.
 *
 * What is kept is only what a page prints: the threshold, the years held with
 * their months and record counts, the headline year, record count and net
 * total, the generated date and whether a bank exists. Supplier names and
 * category labels are not copied: no page here prints one, and a name that is
 * never stored cannot reach a page.
 *
 * A body whose summary is missing (HTTP 404) is skipped with a log line. The
 * script refuses to write, and exits non-zero, when no body is left, when the
 * index or the bank list cannot be read, or when a summary does not carry the
 * fields a page relies on.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const BASE = "https://data.aidoge.co.uk/v1";
const RAW = join(ROOT, ".cache", "aidoge-summaries");
const OUT_DIR = join(ROOT, "data", "spending");
const OUT = join(OUT_DIR, "aidoge-summaries.json");
const REGISTRY = join(ROOT, "data", "registry", "councils.json");
const OFFLINE = process.argv.includes("--offline");

/** One published file, as parsed JSON, or null on a 404. Anything else throws. */
async function fetchJson(path) {
  const rawPath = join(RAW, path.replaceAll("/", "__"));
  if (OFFLINE) {
    if (!existsSync(rawPath)) return null;
    return JSON.parse(readFileSync(rawPath, "utf-8"));
  }
  const url = `${BASE}/${path}`;
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const text = await response.text();
  writeFileSync(rawPath, text);
  return JSON.parse(text);
}

/** "https://aidoge.co.uk/councils/burnley/" to "burnley". */
function bodyId(url) {
  const segments = new URL(url).pathname.split("/").filter(Boolean);
  return segments.at(-1) ?? null;
}

const isCount = (value) => Number.isInteger(value) && value >= 0;

/** The years held, reduced to what a page prints. Throws on a shape it cannot read. */
function yearsFrom(id, years) {
  if (!years || typeof years !== "object") throw new Error(`${id}: coverage.years is not an object`);
  const out = {};
  for (const [fy, year] of Object.entries(years)) {
    if (!/^\d{4}\/\d{2}$/.test(fy)) throw new Error(`${id}: financial year key ${fy} is not like 2025/26`);
    if (!isCount(year?.months_held) || !isCount(year?.records)) {
      throw new Error(`${id} ${fy}: months_held or records is not a count`);
    }
    out[fy] = { monthsHeld: year.months_held, records: year.records };
  }
  return out;
}

/**
 * The headline, or null. A headline with no records or a zero total is an
 * absent figure, not a published nothing, and is dropped here so no page can
 * print it.
 */
function headlineFrom(id, headline) {
  if (!headline) return null;
  const { latest_fy: year, record_count: records, total_spend_net: total } = headline;
  if (typeof year !== "string" || !/^\d{4}\/\d{2}$/.test(year)) throw new Error(`${id}: headline.latest_fy is ${year}`);
  if (!isCount(records) || typeof total !== "number" || !Number.isFinite(total)) {
    throw new Error(`${id}: headline record_count or total_spend_net is not a number`);
  }
  if (records === 0 || total === 0) return null;
  return { year, records, totalNet: total };
}

async function main() {
  mkdirSync(RAW, { recursive: true });
  const registry = JSON.parse(readFileSync(REGISTRY, "utf-8"));

  const index = await fetchJson("summaries/index.json");
  if (!index || !Array.isArray(index.councils)) throw new Error("summaries/index.json could not be read");
  const listed = new Set(index.councils.map((c) => c.id));

  const banks = await fetchJson("banks.json");
  if (!banks || !Array.isArray(banks.councils)) throw new Error("banks.json could not be read");
  const withBank = new Set(banks.councils);

  const bodies = {};
  const skipped = [];
  const mapped = Object.values(registry.councils).filter((c) => typeof c.sisters?.aidoge === "string");
  for (const council of mapped) {
    const url = council.sisters.aidoge;
    const id = bodyId(url);
    if (!id || !listed.has(id)) {
      skipped.push(`${council.gss} ${council.name}: ${id ?? url} is not in summaries/index.json`);
      continue;
    }
    const summary = await fetchJson(`summaries/${id}.json`);
    if (!summary) {
      skipped.push(`${council.gss} ${council.name}: summaries/${id}.json ${OFFLINE ? "is not in the cache" : "returned 404"}`);
      continue;
    }
    if (summary.id !== id) throw new Error(`summaries/${id}.json carries id ${summary.id}`);
    const coverage = summary.coverage;
    if (!coverage) throw new Error(`${id}: no coverage block`);
    if (typeof summary.generated !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(summary.generated)) {
      throw new Error(`${id}: generated is ${summary.generated}`);
    }
    const threshold = coverage.threshold_gbp;
    if (threshold !== null && !(typeof threshold === "number" && threshold > 0)) {
      throw new Error(`${id}: threshold_gbp is ${threshold}`);
    }
    bodies[council.gss] = {
      id,
      url,
      generated: summary.generated.slice(0, 10),
      thresholdGbp: threshold,
      bank: withBank.has(id),
      years: yearsFrom(id, coverage.years),
      headline: headlineFrom(id, summary.headline),
    };
  }

  for (const line of skipped) console.log(`skipped ${line}`);
  const count = Object.keys(bodies).length;
  if (count === 0) {
    throw new Error("refusing to write: no AI DOGE summary was read for any council in the registry");
  }

  const sorted = Object.fromEntries(Object.entries(bodies).sort(([a], [b]) => a.localeCompare(b)));
  const output = {
    generated: new Date().toISOString().slice(0, 10),
    source: {
      publisher: "AI DOGE",
      // Each "generated" sits on a line of its own, so the weekly refresh,
      // which ignores those lines, opens a pull request only on a real change.
      summaries: { url: `${BASE}/summaries/index.json`, generated: index.generated ?? null },
      banks: { url: `${BASE}/banks.json`, generated: banks.generated ?? null },
      rule: "One entry per council the registry links to an AI DOGE page and whose summary was published.",
    },
    counts: {
      mapped: mapped.length,
      held: count,
      headline: Object.values(bodies).filter((b) => b.headline).length,
      bank: Object.values(bodies).filter((b) => b.bank).length,
    },
    bodies: sorted,
  };
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    `wrote ${OUT}: ${count} of ${mapped.length} mapped councils, `
    + `${output.counts.headline} with a headline, ${output.counts.bank} with a bank, ${skipped.length} skipped`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
