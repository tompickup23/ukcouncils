import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { councilByGss, type Council } from "./registry";
import type { SourceRef } from "./sources";

/**
 * The Public Pound for Lancashire: where each council's payments land,
 * resolved to register identifiers and walked to ownership. DRAFT. The data
 * file is the Phase 1 waterfall's page aggregate (scripts/observatory/pound/
 * page_data.py on tompickup.co.uk branch pound/phase1-waterfall); no row in
 * it has been accepted by a named person, and nothing here is published.
 *
 * The file holds classes and sums only: no payee name, company number or
 * person. Nothing is ranked. No total across bodies is printed unless every
 * body in it states the same publication threshold and VAT basis. A county
 * figure is never apportioned to a district or a proposed unitary.
 */

export interface PoundYear {
  supplierTotalPence: number;
  resolvedPence: number;
  handVerifiedPence: number;
  thresholdPounds: number | null;
  thresholdStated: boolean | string | null;
  vatBasis: string | null;
  byClassPence: Record<string, number>;
  byReasonPence: Record<string, number>;
  rc03AccrualPayments: { rows: number; pence: number };
  withheldIndividuals: { rows: number; pence: number };
  ownershipPence: { class: string; pence: number; payeeKeys: number }[];
}

export interface PoundFile {
  $meta: {
    status: string;
    pipelineGitSha: string;
    generatedAt: string;
    years: string[];
    inputs: { file: string; sha256: string }[];
    bodsAsAt: string | null;
    notCovered: unknown;
    note: string;
  };
  bodies: Record<string, { years: Record<string, PoundYear> }>;
}

/** Pound body id to GSS code. Chorley has no bank and is not yet covered. */
export const POUND_BODIES: Record<string, string> = {
  blackburn: "E06000008",
  blackpool: "E06000009",
  burnley: "E07000117",
  fylde: "E07000119",
  hyndburn: "E07000120",
  lancashire_cc: "E10000017",
  lancaster: "E07000121",
  pendle: "E07000122",
  preston: "E07000123",
  ribble_valley: "E07000124",
  rossendale: "E07000125",
  south_ribble: "E07000126",
  west_lancashire: "E07000127",
  wyre: "E07000128",
};

export const NOT_COVERED: Record<string, string> = {
  E07000118: "Chorley is not yet covered: AI DOGE holds no spending bank for it.",
};

const LETTER: SourceRef = {
  publisher: "MHCLG",
  title: "Local government reorganisation: decision letter to Lancashire, Blackburn with Darwen and Blackpool council leaders",
  url: "https://assets.publishing.service.gov.uk/media/6a58d21c24d4d0ad06d945c0/Local_government_reorganisation_-_decision_letter_to_Lancashire__Blackburn_with_Darwen_and_Blackpool_council_leaders.pdf",
  table: "page 2",
  date: "2026-07-16",
};

export interface Unitary {
  slug: string;
  name: string;
  members: string[];
  source: SourceRef;
}

/** The four groups as the decision letter names them (p. 2), members by GSS code. */
export const UNITARIES: Unitary[] = [
  { slug: "north-lancashire", name: "North Lancashire", members: ["E07000121", "E07000123", "E07000124"], source: LETTER },
  { slug: "south-lancashire", name: "South Lancashire", members: ["E07000118", "E07000126", "E07000127"], source: LETTER },
  {
    slug: "pennine-lancashire",
    name: "Pennine Lancashire",
    members: ["E06000008", "E07000117", "E07000120", "E07000122", "E07000125"],
    source: LETTER,
  },
  { slug: "fylde-coast", name: "Fylde Coast", members: ["E06000009", "E07000119", "E07000128"], source: LETTER },
];

let cached: PoundFile | null = null;

export function poundPath(root = process.cwd()): string {
  return join(root, "data", "pound", "lancashire-draft.json");
}

export function loadPound(root = process.cwd()): PoundFile {
  if (cached && root === process.cwd()) return cached;
  const path = poundPath(root);
  if (!existsSync(path)) throw new Error(`${path} is missing. Copy pound_pages.json from the waterfall run.`);
  const data = JSON.parse(readFileSync(path, "utf-8")) as PoundFile;
  if (root === process.cwd()) cached = data;
  return data;
}

export function bodyIdFor(gss: string): string | null {
  return Object.entries(POUND_BODIES).find(([, g]) => g === gss)?.[0] ?? null;
}

export interface PoundPage {
  kind: "body" | "unitary";
  slug: string;
  name: string;
  council?: Council;
  bodyId?: string;
  unitary?: Unitary;
}

/**
 * Lancashire County Council has no council page on this site (the registry
 * holds no county councils), so its Pound page carries its own record.
 */
const COUNTY: Council = {
  gss: "E10000017",
  slug: "lancashire-county-council",
  name: "Lancashire County Council",
  officialName: "Lancashire County Council",
  type: "County council",
  country: "England",
  region: "North West",
  county: null,
  parentGss: null,
  reorganisation: null,
  sisters: {
    ukelections: null,
    ukdemographics: null,
    aidoge: "https://aidoge.co.uk/councils/lancashire_cc/",
    asylumstats: null,
    ukfoodhygiene: null,
  },
};

export function poundCouncil(gss: string): Council | undefined {
  return gss === COUNTY.gss ? COUNTY : councilByGss(gss);
}

export function poundPages(): PoundPage[] {
  const bodies: PoundPage[] = Object.entries(POUND_BODIES).map(([bodyId, gss]) => {
    const council = poundCouncil(gss);
    if (!council) throw new Error(`${bodyId}: ${gss} is not in the registry`);
    return { kind: "body", slug: council.slug, name: council.name, council, bodyId };
  });
  const unitaries: PoundPage[] = UNITARIES.map((u) => ({ kind: "unitary", slug: u.slug, name: u.name, unitary: u }));
  const slugs = new Set<string>();
  for (const page of [...bodies, ...unitaries]) {
    if (slugs.has(page.slug)) throw new Error(`pound page slug ${page.slug} is used twice`);
    slugs.add(page.slug);
  }
  return [...bodies, ...unitaries];
}

export function poundPagePath(slug: string): string {
  return `/pound/${slug}/`;
}

const GBP = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });

/** £1,234.56 from pence, exactly. */
export function penceToPounds(pence: number): string {
  return GBP.format(pence / 100);
}

/** One decimal place of the total, or n/a for a zero total. */
export function share(part: number, total: number): string {
  return total ? `${((100 * part) / total).toFixed(1)}%` : "n/a";
}

export const CLASS_LABEL: Record<string, string> = {
  supplier: "Suppliers resolved to a register entry",
  "public body": "Public bodies (transfers, counted on their own line)",
  "council company": "Council companies (more than 50% of votes held by a council)",
  "gate decision": "Bodies whose treatment is a gate decision (GP practices, academy trusts)",
};

export const REASON_LABEL: Record<string, string> = {
  "no-candidate": "No register entry found",
  ambiguous: "More than one register entry matches (queued for a person to decide)",
  "individual-payee": "Payments to individuals (name withheld)",
  redacted: "Withheld or redacted by the council",
  "payment-route": "A bank, direct debit or clearing account named as payee",
  "invalid-identifier": "Identifier in the council file is not valid",
  "out-of-scope-identifier": "Identifier from a register outside the pipeline (for example a society number)",
};

export const OWNERSHIP_LABEL: Record<string, string> = {
  individual: "An individual holds more than 50% of votes",
  "foreign entity": "Parent registered outside the UK",
  "dispersed listed": "Parent has a public listing",
  "exempt listed": "Exempt from PSC disclosure",
  "trust or trustee": "Trust or trustee",
  "no PSC filed": "Statement filed: no registrable person",
  "no unit over 50%": "No person or entity holds more than 50% of votes",
  "more than 50% of shares, voting rights not filed": "More than 50% of shares held, voting rights not filed",
  "corporate parent without a register number": "Corporate parent without a register number",
  "corporate parent, no further PSC data": "Corporate parent, no further PSC data",
  "no PSC data held": "No PSC statement in the edition read",
  cycle: "Ownership chain loops back on itself",
  "resolved, no Companies House number": "Resolved to a register without company numbers (not walked)",
  "not walked": "Not walked",
};

/** The source line for figures calculated from the spend input and the waterfall. */
export function poundSource(council: Council, meta: PoundFile["$meta"]): SourceRef {
  return {
    publisher: "AI DOGE",
    title: `${council.name} spending bank, financial years 2024/25 and 2025/26`,
    url: council.sisters.aidoge ?? "https://aidoge.co.uk/",
    table: `resolved by the Public Pound waterfall at ${meta.pipelineGitSha.slice(0, 7)}, built ${meta.generatedAt.slice(0, 10)}`,
    date: null,
    method: "Draft, calculated from the council's published payments; not verified by a person",
  };
}

export function ownershipSource(meta: PoundFile["$meta"]): SourceRef {
  return {
    publisher: "Open Ownership",
    title: "UK beneficial ownership data, BODS v0.4",
    url: "https://bods-data.openownership.org/source/uk_version_0_4/",
    table: `edition dated ${meta.bodsAsAt ?? "n/a"}, read with Companies House basic company data`,
    date: null,
    method: "Draft, walked to the unit holding more than 50% of votes (method rule 2.1)",
  };
}
