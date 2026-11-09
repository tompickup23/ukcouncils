import { createHash } from "node:crypto";
import sax from "sax";

export const sha256 = (text) => createHash("sha256").update(text).digest("hex");

// Only the table fragments are read. Source HTML never becomes page content.
export function cellText(html) {
  return html.replace(/<[^>]*>/g, " ").replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (match, entity) => {
    if (entity.startsWith("#x")) return String.fromCodePoint(parseInt(entity.slice(2), 16));
    if (entity.startsWith("#")) return String.fromCodePoint(Number(entity.slice(1)));
    return sax.ENTITIES[entity] ?? match;
  }).replace(/\s+/g, " ").trim();
}

export function extractRows(body) {
  const rows = [];
  let heading = "";
  let tableIndex = 0;
  for (const match of body.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>|<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    if (match[1] !== undefined) { heading = cellText(match[1]); continue; }
    const table = tableIndex++ === 0 ? "main"
      : heading === "Housing Revenue Account" ? "hra"
      : heading === "Police Force" ? "police"
      : heading.startsWith("Capitalisation support for ") ? "later"
      : heading.startsWith("Birmingham") && heading.includes("Revised Exceptional Financial Support") ? "birmingham_revised"
      : null;
    if (!table) throw new Error(`Unrecognised table heading: ${heading}`);
    for (const row of match[2].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      if (/<th\b/i.test(row[1])) continue;
      const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map((cell) => cellText(cell[1]));
      if (cells.length !== 2) throw new Error(`${heading || "Main table"}: expected two cells, found ${cells.length}`);
      const revised = table === "birmingham_revised";
      if (revised && !/^\d{4}-\d{2}$/.test(cells[0])) throw new Error(`Unrecognised revised profile year: ${cells[0]}`);
      rows.push({ table, authorityAsPrinted: revised ? "Birmingham" : cells[0], supportYear: revised ? cells[0] : null, text: cells[1], cellSha256: sha256(revised ? `${cells[0]} | ${cells[1]}` : cells[1]) });
    }
  }
  return rows;
}

export function compareRows(year, rows, statements) {
  const messages = [];
  if (rows.length !== statements.length) messages.push(`${year}: row count changed from ${statements.length} to ${rows.length}`);
  for (let i = 0; i < Math.max(rows.length, statements.length); i++) {
    const actual = rows[i];
    const expected = statements[i];
    const label = `${year}, row ${i + 1}, ${expected?.table ?? actual?.table}, ${expected?.authorityAsPrinted ?? actual?.authorityAsPrinted}`;
    if (!actual) messages.push(`${label}: removed`);
    else if (!expected) messages.push(`${label}: added`);
    else {
      if (actual.table !== expected.table || actual.authorityAsPrinted !== expected.authorityAsPrinted) messages.push(`${label}: row identity changed`);
      if (actual.cellSha256 !== expected.cellSha256) messages.push(`${label}: cell changed (${expected.cellSha256} to ${actual.cellSha256})`);
      if (actual.supportYear && expected.figures.some((figure) => figure.supportYear !== actual.supportYear)) messages.push(`${label}: revised profile year changed`);
    }
  }
  return messages;
}

export function unlistedYearPages(collection, pages) {
  const known = new Set(Object.values(pages).map((page) => new URL(page.url).pathname));
  const paths = new Set([...JSON.stringify(collection).matchAll(/\/guidance\/exceptional-financial-support-for-local-authorities-for-\d{4}-(?:\d{2}|\d{4})(?!\d)/g)].map((match) => match[0]));
  return [...paths].filter((path) => !known.has(path));
}
