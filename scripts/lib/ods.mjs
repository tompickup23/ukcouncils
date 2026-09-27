/**
 * A reader for the OpenDocument spreadsheets MHCLG publishes.
 *
 * An .ods file is a zip holding content.xml. The zip is opened with the
 * system `unzip`, present on macOS and on the GitHub Ubuntu runners, so the
 * site carries no archive dependency. The XML is read with a tokenizer that
 * knows the handful of elements a spreadsheet table uses, which is all a
 * published statistical table contains.
 *
 * Every cell is kept as the text the publisher displays, not the underlying
 * office:value, because the displayed text is the published figure: a stored
 * value can carry precision the table rounds away.
 *
 * Sheets are found by their title row and columns by their header text, never
 * by position. The same series is Table 8 one year and Table 9 the next, and
 * Home Office tables have swapped columns between vintages; a positional read
 * produces a plausible wrong answer rather than an error.
 */
import { execFileSync } from "node:child_process";

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decode(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/g, (m, name) => ENTITIES[name] ?? m);
}

function attr(tag, name) {
  const match = new RegExp(`${name}="([^"]*)"`).exec(tag);
  return match ? decode(match[1]) : undefined;
}

/** The text a cell displays: its paragraphs joined by a newline, spacing kept. */
function cellText(inner) {
  const paragraphs = [];
  for (const match of inner.matchAll(/<text:p\b[^>]*?(?:\/>|>([\s\S]*?)<\/text:p>)/g)) {
    const body = (match[1] ?? "")
      .replace(/<text:s\b[^>]*?text:c="(\d+)"[^>]*\/>/g, (_m, n) => " ".repeat(Number(n)))
      .replace(/<text:s\b[^>]*\/>/g, " ")
      .replace(/<text:tab\b[^>]*\/>/g, "\t")
      .replace(/<text:line-break\b[^>]*\/>/g, "\n")
      .replace(/<[^>]+>/g, "");
    paragraphs.push(decode(body));
  }
  return paragraphs.join("\n").trim();
}

/** A repeated run of empty cells is capped: a sheet pads rows to 16,384 columns. */
const MAX_REPEAT = 64;

function parseRow(rowXml) {
  const cells = [];
  const pattern = /<table:(?:covered-)?table-cell\b([^>]*?)(?:\/>|>([\s\S]*?)<\/table:(?:covered-)?table-cell>)/g;
  for (const match of rowXml.matchAll(pattern)) {
    const repeat = Number(attr(match[1], "table:number-columns-repeated") ?? 1);
    const text = match[2] ? cellText(match[2]) : "";
    for (let i = 0; i < Math.min(repeat, MAX_REPEAT); i += 1) cells.push(text);
  }
  while (cells.length && cells[cells.length - 1] === "") cells.pop();
  return cells;
}

/** Every sheet in the workbook as { name, rows }, blank rows dropped. */
export function readOds(path) {
  const xml = execFileSync("unzip", ["-p", path, "content.xml"], {
    encoding: "utf-8",
    maxBuffer: 256 * 1024 * 1024,
  });
  const sheets = [];
  for (const table of xml.matchAll(/<table:table\b([^>]*)>([\s\S]*?)<\/table:table>/g)) {
    const name = attr(table[1], "table:name") ?? "";
    const rows = [];
    for (const row of table[2].matchAll(/<table:table-row\b[^>]*?(?:\/>|>([\s\S]*?)<\/table:table-row>)/g)) {
      const cells = parseRow(row[1] ?? "");
      if (cells.some((c) => c !== "")) rows.push(cells);
    }
    sheets.push({ name, rows });
  }
  return sheets;
}

/** The one sheet whose title row matches, or an error naming what was looked for. */
export function sheetByTitle(sheets, pattern, label = String(pattern)) {
  const found = sheets.filter((s) => pattern.test(s.rows[0]?.[0] ?? ""));
  if (found.length !== 1) {
    throw new Error(`expected one sheet titled ${label}, found ${found.length}: ${found.map((s) => s.name).join(", ")}`);
  }
  return found[0];
}

/**
 * The header row of a sheet and its data rows as objects keyed by header, with
 * a column resolver that takes a pattern and fails loudly on zero or two hits.
 * The header row is the first row whose cells include every `mustInclude`.
 */
export function table(sheet, mustInclude) {
  const headerIndex = sheet.rows.findIndex((row) => mustInclude.every((h) => row.includes(h)));
  if (headerIndex === -1) {
    throw new Error(`${sheet.name}: no header row carrying ${mustInclude.join(", ")}`);
  }
  const header = sheet.rows[headerIndex];
  const column = (pattern) => {
    const hits = header.map((h, i) => (pattern.test(h) ? i : -1)).filter((i) => i >= 0);
    if (hits.length !== 1) {
      throw new Error(`${sheet.name}: column ${pattern} matched ${hits.length} headers`);
    }
    return hits[0];
  };
  return { header, rows: sheet.rows.slice(headerIndex + 1), column };
}

/**
 * A published money or percentage cell as a number, or null where the table
 * holds no figure. MHCLG marks those with a bracketed code ([x], [z], [c]).
 * Anything else that does not parse is an error, not a null: a changed format
 * must stop the script rather than blank a figure.
 */
export function figure(text, where) {
  const value = (text ?? "").trim();
  if (value === "" || /^\[[a-z]+\]$/i.test(value)) return null;
  const cleaned = value.replace(/,/g, "").replace(/^£/, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) throw new Error(`${where}: not a figure: ${JSON.stringify(value)}`);
  return Number(cleaned);
}
