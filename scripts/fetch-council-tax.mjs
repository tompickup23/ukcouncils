/**
 * Council tax levels for every billing authority in England, from MHCLG.
 *
 *   node scripts/fetch-council-tax.mjs            fetch and write all years
 *   node scripts/fetch-council-tax.mjs --offline  parse data/raw only, no fetch
 *
 * For each year it asks the GOV.UK content API for the statistics page, finds
 * the spreadsheet attachments by their titles, downloads them to data/raw/
 * (gitignored) and writes data/council-tax/england-<year>.json.
 *
 * What it reads, by title and header, never by table number (the band table is
 * Table 9 in 2025-26 and 2026-27 and Table 8 in 2024-25):
 *
 *   the band table   "Area council tax for a dwelling occupied by two adults by
 *                    band": every billing authority, all eight bands as
 *                    published. Nothing is derived from Band D.
 *   the own tables   "Council tax (average Band D) ... London boroughs,
 *                    metropolitan districts and unitary authorities", "...
 *                    shire counties" and "... shire districts": the
 *                    authority's own Band D and its published change.
 *   England tables   the class averages, the Band D history and the area
 *                    averages by type, where the workbook carries them.
 *   notes            the note text every row refers to.
 *
 * It refuses to write, and exits non-zero, when any authority row is missing
 * a band, when fewer rows are found than the file for that year already holds,
 * or when a row refers to a note the workbook does not define. A figure the
 * table marks [x] or [z] is null in the output and absent on the site.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { figure, readOds, sheetByTitle, table } from "./lib/ods.mjs";

const ROOT = process.cwd();
const RAW = join(ROOT, "data", "raw");
const OUT = join(ROOT, "data", "council-tax");
const OFFLINE = process.argv.includes("--offline");

const PUBLISHER = "Ministry of Housing, Communities and Local Government";
const LICENCE = "Open Government Licence v3.0";
const LICENCE_URL = "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/";

/**
 * The years held. `attachments` picks the files off the statistics page by
 * title: one workbook for the recent years, two single-table files for
 * 2024-25, which MHCLG published table by table.
 */
const YEARS = [
  {
    year: "2026-27",
    slug: "council-tax-levels-set-by-local-authorities-in-england-2026-to-2027",
    attachments: [/^Council Tax levels set by local authorities in England 2026 to 2027: Tables 1 to 9/],
  },
  {
    year: "2025-26",
    slug: "council-tax-levels-set-by-local-authorities-in-england-2025-to-2026",
    attachments: [/^Council Tax levels set by local authorities in England 2025 to 2026: Tables 1 to 9/],
  },
  {
    year: "2024-25",
    slug: "council-tax-levels-set-by-local-authorities-in-england-2024-to-2025",
    attachments: [/^Table 8: Area council tax for a dwelling occupied by 2 adults by band/, /^Table 7: /],
  },
];

const BANDS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const REGIONS = {
  L: "London",
  NE: "North East",
  NW: "North West",
  YH: "Yorkshire and the Humber",
  EM: "East Midlands",
  WM: "West Midlands",
  E: "East of England",
  EE: "East of England",
  SE: "South East",
  SW: "South West",
};

const CLASSES = {
  ILB: "Inner London borough",
  OLB: "Outer London borough",
  LB: "London borough",
  MD: "Metropolitan district",
  UA: "Unitary authority",
  SD: "Shire district",
  SC: "Shire county",
};

/**
 * Published text normalised to house style. MHCLG writes year ranges with an
 * en dash in some notes; the site prints none, and the meaning is carried by
 * "to". Nothing else in the text is changed.
 */
function houseText(text) {
  return text.replace(/\s*[\u2013\u2014]\s*/g, " to ").replace(/\s+/g, " ").trim();
}

async function page(slug) {
  const url = `https://www.gov.uk/api/content/government/statistics/${slug}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function download(url, path) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  writeFileSync(path, bytes);
  return bytes;
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Fetches (or, offline, re-reads) one year's files and returns their descriptions. */
async function filesFor(config) {
  const manifestPath = join(RAW, `council-tax-${config.year}.manifest.json`);
  if (OFFLINE) {
    if (!existsSync(manifestPath)) throw new Error(`--offline and no ${manifestPath}`);
    return JSON.parse(readFileSync(manifestPath, "utf-8"));
  }
  const content = await page(config.slug);
  const attachments = content.details?.attachments ?? [];
  const files = config.attachments.map((pattern) => {
    const hits = attachments.filter((a) => pattern.test(a.title ?? "") && /\.ods$/i.test(a.url ?? ""));
    if (hits.length !== 1) {
      throw new Error(`${config.year}: expected one .ods attachment matching ${pattern}, found ${hits.length}`);
    }
    return hits[0];
  });
  const described = [];
  for (const attachment of files) {
    const name = attachment.url.split("/").pop();
    const path = join(RAW, `${config.year}-${name}`);
    const bytes = await download(attachment.url, path);
    described.push({
      title: houseText(attachment.title),
      url: attachment.url,
      file: name,
      path,
      sha256: sha256(bytes),
    });
  }
  const principles = await referendumPrinciples(attachments);
  const manifest = {
    principles,
    pageTitle: houseText(content.title),
    pageUrl: `https://www.gov.uk/government/statistics/${config.slug}`,
    firstPublished: content.first_published_at?.slice(0, 10) ?? null,
    updated: content.public_updated_at?.slice(0, 10) ?? null,
    files: described,
  };
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  return manifest;
}

/**
 * The referendum principles for the year, quoted from the technical notes
 * that accompany the tables: the section headed "Referendum principles", up
 * to the next numbered section. Null when the year's notes have no such
 * section; a page then states no principle rather than one from memory.
 */
async function referendumPrinciples(attachments) {
  const notes = attachments.find((a) => /technical notes/i.test(a.title ?? "") && !/\.(ods|xlsx|pdf)$/i.test(a.url ?? ""));
  if (!notes) return null;
  const url = notes.url.startsWith("http") ? notes.url : `https://www.gov.uk${notes.url}`;
  const response = await fetch(url.replace("https://www.gov.uk/", "https://www.gov.uk/api/content/"));
  if (!response.ok) return null;
  const body = (await response.json()).details?.body ?? "";
  const text = body
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ");
  // The section runs to the next numbered heading, which is "5.28 Title" or
  // "6. Title" depending on where it falls in the document.
  const match = /(\d+\.\d+) Referendum principles (.+?)(?= \d+(?:\.\d+|\.) [A-Z][a-z]+|$)/.exec(text);
  if (!match) return null;
  return { section: match[1], text: houseText(match[2]), title: houseText(notes.title), url };
}

/** Note id to text, from every Notes sheet in the files for a year. */
function notesFrom(sheets) {
  const notes = new Map();
  for (const sheet of sheets.filter((s) => /^Notes$/i.test(s.name))) {
    let t;
    try {
      t = table(sheet, ["Note"]);
    } catch {
      continue;
    }
    const textColumn = t.header.findIndex((h) => /^Note Text$/i.test(h) || /^Text$/i.test(h));
    if (textColumn === -1) continue;
    for (const row of t.rows) {
      const id = (row[0] ?? "").trim();
      if (id && row[textColumn]) notes.set(id.toLowerCase(), houseText(row[textColumn]));
    }
  }
  return notes;
}

/** The note ids a Notes cell refers to, "[note r] [note s]" to ["[note r]", "[note s]"]. */
function noteRefs(cell) {
  return [...(cell ?? "").matchAll(/\[note [a-z]+\]/gi)].map((m) => m[0].toLowerCase());
}

function resolveNotes(refs, notes, where) {
  return refs.map((ref) => {
    const text = notes.get(ref);
    if (!text) throw new Error(`${where}: refers to ${ref}, which the workbook does not define`);
    return { id: ref.replace(/^\[note |\]$/g, ""), text };
  });
}

function bandTable(sheets, notes, year) {
  const sheet = sheetByTitle(
    sheets,
    /^Table \d+: Area council tax for a dwelling occupied by (two|2) adults by band/,
    "the band table",
  );
  const t = table(sheet, ["ONS Code", "Band D"]);
  const col = {
    ecode: t.column(/^E Code$/),
    ons: t.column(/^ONS Code$/),
    name: t.column(/^Authority$/),
    region: t.column(/^Region$/),
    klass: t.column(/^Class$/),
    area: t.column(/^Area$/),
    notes: t.header.findIndex((h) => /^Notes$/.test(h)),
  };
  const bandCols = Object.fromEntries(BANDS.map((b) => [b, t.column(new RegExp(`^Band ${b}$`))]));
  const titleNotes = resolveNotes(noteRefs(sheet.rows[0][0]), notes, `${year} band table title`);

  const authorities = {};
  const missing = [];
  for (const row of t.rows) {
    const ons = (row[col.ons] ?? "").trim();
    if (!/^E0[6-9]\d{6}$/.test(ons)) continue;
    const where = `${year} band table ${ons}`;
    const bands = {};
    for (const band of BANDS) bands[band] = figure(row[bandCols[band]], `${where} Band ${band}`);
    const absent = BANDS.filter((b) => bands[b] === null);
    if (absent.length) missing.push(`${ons} ${row[col.name]} lacks band ${absent.join(", ")}`);
    if (authorities[ons]) throw new Error(`${where}: listed twice`);
    authorities[ons] = {
      ecode: row[col.ecode],
      name: houseText(row[col.name]),
      regionCode: row[col.region],
      region: REGIONS[row[col.region]] ?? null,
      classCode: row[col.klass],
      class: CLASSES[row[col.klass]] ?? null,
      // Unitaries have no county area; MHCLG marks the cell [z].
      area: /^\[[a-z]+\]$/i.test((row[col.area] ?? "").trim()) ? null : houseText(row[col.area]),
      bands,
      notes: col.notes >= 0 ? resolveNotes(noteRefs(row[col.notes]), notes, where) : [],
    };
    if (!authorities[ons].region) throw new Error(`${where}: unknown region code ${row[col.region]}`);
    if (!authorities[ons].class) throw new Error(`${where}: unknown class code ${row[col.klass]}`);
  }
  if (missing.length) {
    throw new Error(`${year}: refusing to write, rows missing a band:\n  ${missing.join("\n  ")}`);
  }
  return { sheet: sheet.name, title: houseText(sheet.rows[0][0].replace(/\s*\[note [a-z]+\]/gi, "")), titleNotes, authorities };
}

/**
 * The authority's own Band D and its published change, from the three "own"
 * tables. Column headers differ between the three and between years, so each
 * is found by what it says. A column a table does not have is null.
 */
function ownTables(sheets, notes, year) {
  const specs = [
    { key: "unitary", title: /Council tax \(average Band D\).*London boroughs, metropolitan districts and unitary authorities/i },
    { key: "county", title: /Council tax \(average Band D\).*shire counties/i },
    { key: "district", title: /Council tax \(average Band D\).*shire districts/i },
  ];
  const out = {};
  const tables = {};
  for (const spec of specs) {
    const sheet = sheetByTitle(sheets, new RegExp(`^Table \\d+[a-z]?: .*${spec.title.source}`, "i"), spec.key);
    const t = table(sheet, ["ONS Code", "Authority"]);
    // A column is found by a pattern or, where one test is not enough, a predicate.
    const find = (test) => t.header.findIndex((h) => (typeof test === "function" ? test(h) : test.test(h)));
    const need = (pattern, label) => {
      const i = find(pattern);
      if (i === -1) throw new Error(`${year} ${sheet.name}: no column for ${label}`);
      return i;
    };
    const exclParish = /excluding parish precepts|including adult social care precept \(Band D\)/i;
    const col = {
      ons: t.column(/^ONS Code$/),
      name: t.column(/^Authority$/),
      bandD: need(
        (h) => /^Average council tax for the authority/i.test(h) && exclParish.test(h) && /£$/.test(h.trim()) && !/change/i.test(h),
        "own Band D",
      ),
      changePct: need(
        (h) => /percent|% change/i.test(h) && exclParish.test(h) && !/adult social care element/i.test(h),
        "own change in percent",
      ),
      changePounds: find((h) => /£ change on/i.test(h) && /excluding parish precepts/i.test(h)),
      bandDWithParish: find((h) => /^Average council tax for the authority including (adult social care and )?parish precepts/i.test(h) && /£$/.test(h.trim())),
      ascBandD: find((h) => /^Adult social care element/i.test(h)),
      ascChangePct: find((h) => /^Percentage change of adult social care element/i.test(h)),
      notes: find((h) => /^Notes$/.test(h)),
    };
    tables[spec.key] = sheet.name;
    for (const row of t.rows) {
      const ons = (row[col.ons] ?? "").trim();
      if (!/^E\d{8}$/.test(ons)) continue;
      const where = `${year} ${sheet.name} ${ons}`;
      const get = (i, label) => (i >= 0 ? figure(row[i], `${where} ${label}`) : null);
      out[ons] = {
        table: sheet.name,
        name: houseText(row[col.name]),
        bandD: get(col.bandD, "Band D"),
        changePct: get(col.changePct, "change"),
        changePounds: get(col.changePounds, "change in pounds"),
        bandDWithParish: get(col.bandDWithParish, "Band D with parish"),
        ascBandD: get(col.ascBandD, "adult social care"),
        ascChangePct: get(col.ascChangePct, "adult social care change"),
        notes: col.notes >= 0 ? resolveNotes(noteRefs(row[col.notes]), notes, where) : [],
      };
    }
  }
  return { tables, own: out };
}

/** England level figures, where the workbook carries the summary tables. */
function englandTables(sheets, year) {
  const has = (pattern) => sheets.some((s) => pattern.test(s.rows[0]?.[0] ?? ""));
  const result = {};

  const areaPattern = /^Table \d+: Average area Band D council tax and the annual percentage change by area of authority/;
  if (has(areaPattern)) {
    const sheet = sheetByTitle(sheets, areaPattern);
    const t = table(sheet, ["Year", "England £"]);
    const label = (row) => houseText(row[0].replace(/\s*\[[^\]]+\]/g, ""));
    const wanted = year.replace(/^(\d{4})-(\d{2})$/, (_m, a, b) => `${a} to 20${b}`);
    const row = t.rows.find((r) => label(r) === wanted);
    if (!row) throw new Error(`${year} ${sheet.name}: no row for ${wanted}`);
    const pair = (name) => ({
      pounds: figure(row[t.column(new RegExp(`^${name} £$`))], `${sheet.name} ${name}`),
      changePct: figure(row[t.column(new RegExp(`^${name} change %$`))], `${sheet.name} ${name} change`),
    });
    result.areaBandD = {
      table: sheet.name,
      england: pair("England"),
      byAreaType: {
        london: pair("London area"),
        metropolitan: pair("Metropolitan areas"),
        unitary: pair("Unitary areas"),
        shire: pair("Shire areas"),
      },
    };
  }

  const historyPattern = /^Table \d+: Average Band D council tax \(including parish and adult social care precepts\) in England and the annual percentage change/;
  if (has(historyPattern)) {
    const sheet = sheetByTitle(sheets, historyPattern);
    const t = table(sheet, ["Year", "Pounds £"]);
    result.history = {
      table: sheet.name,
      rows: t.rows
        .filter((r) => /^\d{4} to \d{4}/.test(r[0] ?? ""))
        .map((r) => {
          const [, from, to] = /^(\d{4}) to (\d{4})/.exec(r[0]);
          return {
            year: `${from}-${to.slice(2)}`,
            pounds: figure(r[t.column(/^Pounds £$/)], `${sheet.name} ${r[0]}`),
            changePct: figure(r[t.column(/^Percentage Change %$/)], `${sheet.name} ${r[0]} change`),
          };
        }),
    };
  }

  const classPattern = /^Table \d+: Council tax \(average Band D\) in England .* by class of authority/;
  if (has(classPattern)) {
    const sheet = sheetByTitle(sheets, classPattern);
    const t = table(sheet, ["Class of Authority"]);
    const exclParish = (h) => /excluding parish precepts/i.test(h);
    const bandD = t.header.findIndex((h) => exclParish(h) && /£$/.test(h.trim()) && !/Percentage/i.test(h));
    const change = t.header.findIndex((h) => exclParish(h) && /Percentage/i.test(h));
    if (bandD === -1 || change === -1) throw new Error(`${year} ${sheet.name}: class columns not found`);
    result.byClass = {
      table: sheet.name,
      rows: t.rows.map((r) => ({
        class: houseText(r[0].replace(/\s*\[note [a-z]+\]/gi, "")),
        bandD: figure(r[bandD], `${sheet.name} ${r[0]}`),
        changePct: figure(r[change], `${sheet.name} ${r[0]} change`),
      })),
    };
  }
  return result;
}

async function build(config) {
  const manifest = await filesFor(config);
  const sheets = manifest.files.flatMap((f) => readOds(f.path));
  const notes = notesFrom(sheets);
  const band = bandTable(sheets, notes, config.year);
  const { tables: ownSheets, own } = ownTables(sheets, notes, config.year);
  const england = englandTables(sheets, config.year);

  const authorities = {};
  for (const [ons, entry] of Object.entries(band.authorities)) {
    const mine = own[ons] ?? null;
    authorities[ons] = { ...entry, own: mine };
  }
  const counties = Object.fromEntries(
    Object.entries(own).filter(([ons]) => /^E10\d{6}$/.test(ons)),
  );

  const outPath = join(OUT, `england-${config.year}.json`);
  const count = Object.keys(authorities).length;
  if (existsSync(outPath)) {
    const previous = Object.keys(JSON.parse(readFileSync(outPath, "utf-8")).authorities).length;
    if (count < previous) {
      throw new Error(`${config.year}: refusing to write ${count} authorities over ${previous}`);
    }
  }
  if (count < 290) throw new Error(`${config.year}: only ${count} authorities found in the band table`);

  const data = {
    generated: new Date().toISOString().slice(0, 10),
    year: config.year,
    source: {
      publisher: PUBLISHER,
      title: manifest.pageTitle,
      url: manifest.pageUrl,
      published: manifest.firstPublished,
      updated: manifest.updated,
      licence: LICENCE,
      licenceUrl: LICENCE_URL,
      files: manifest.files.map(({ title, url, file, sha256: digest }) => ({ title, url, file, sha256: digest })),
      bandTable: band.sheet,
      bandTableTitle: band.title,
      bandTableNotes: band.titleNotes,
      ownTables: ownSheets,
      // Every note the workbook defines, so a page can quote the published
      // definition of a rule (the referendum limits are notes to Table 4).
      referendumPrinciples: manifest.principles ?? null,
      notes: Object.fromEntries([...notes.entries()].map(([id, text]) => [id.replace(/^\[note |\]$/g, ""), text])),
    },
    england,
    counties,
    authorities,
  };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`);
  const withOwn = Object.values(authorities).filter((a) => a.own).length;
  console.log(
    `council tax ${config.year}: ${count} authorities, ${withOwn} with own Band D, `
      + `${Object.keys(counties).length} counties, ${band.sheet}, written ${outPath.replace(`${ROOT}/`, "")}`,
  );
}

mkdirSync(RAW, { recursive: true });
let failed = false;
for (const config of YEARS) {
  try {
    await build(config);
  } catch (error) {
    failed = true;
    console.error(`council tax ${config.year}: ${error instanceof Error ? error.message : error}`);
  }
}
if (failed) process.exit(1);
