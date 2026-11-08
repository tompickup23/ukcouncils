import { readFileSync } from "node:fs";
import { join } from "node:path";
import { compareRows, extractRows, unlistedYearPages } from "./lib/efs-source.mjs";

const data = JSON.parse(readFileSync(join(process.cwd(), "data/efs/statements.json"), "utf8"));
async function fetchContent(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(30000), headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

const reports = [];
try {
  const collectionUrl = new URL(data.collection);
  collectionUrl.pathname = `/api/content${collectionUrl.pathname}`;
  const collection = await fetchContent(collectionUrl);
  for (const path of unlistedYearPages(collection, data.pages)) reports.push(`Collection lists an uncurated year page: ${path}`);
} catch (error) { reports.push(`Collection could not be checked: ${error.message}`); }

for (const [year, page] of Object.entries(data.pages)) {
  try {
    const current = await fetchContent(page.contentApi);
    if (typeof current.details?.body !== "string") throw new Error("Content API has no details.body string");
    const rows = extractRows(current.details.body);
    const changes = compareRows(year, rows, data.statements.filter((statement) => statement.page === year));
    reports.push(...changes);
    if (!changes.length) console.log(`${year}: ${rows.length} table rows unchanged`);
  } catch (error) { reports.push(`${year}: could not check cells: ${error.message}`); }
}

if (reports.length) {
  console.error("EFS source check requires human review:");
  for (const report of reports) console.error(report);
  console.error("Re-curate changed sources by hand. No files have been written.");
  process.exitCode = 1;
} else {
  console.log(`EFS source check passed: collection and ${Object.keys(data.pages).length} year pages; ${data.statements.length} rows unchanged. No files written.`);
}
