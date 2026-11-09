import { readFileSync } from "node:fs";
import { join } from "node:path";

export type EfsRole = "stated" | "prior_year" | "later_year" | "revision_note" | "superseded" | "covering_total" | "withdrawn";
export type EfsTable = "main" | "hra" | "police" | "later" | "birmingham_revised";
export interface EfsFigure {
  supportYear: string;
  amountGbpM: string | null;
  marking: string | null;
  role: EfsRole;
  note?: string;
}
export interface EfsPage {
  title: string;
  url: string;
  contentApi: string;
  firstPublished: string;
  updated: string;
  changeHistory: { date: string; note: string }[];
  bodySha256: string;
  proseCount: string | null;
  rawFile: string;
}
export interface EfsAuthority {
  gss: string | null;
  slug: string | null;
  type: string;
  name: string;
}
export interface EfsStatement {
  page: string;
  table: EfsTable;
  authorityAsPrinted: string;
  cellSha256: string;
  figures: EfsFigure[];
  authority: string;
}
export interface EfsMultipleFigures {
  authority: string;
  account: "general" | "hra";
  supportYear: string;
  byPage: Record<string, string[]>;
  relation: string;
}
export interface EfsData {
  schema: string;
  curated: string;
  curatedBy: string;
  publisher: string;
  collection: string;
  licence: string;
  units: string;
  pages: Record<string, EfsPage>;
  authorities: Record<string, EfsAuthority>;
  statements: EfsStatement[];
  multipleFigures: EfsMultipleFigures[];
}

// The curated strings retain the precision MHCLG printed. No money arithmetic.
export const efs: EfsData = JSON.parse(readFileSync(join(process.cwd(), "data/efs/statements.json"), "utf8"));
export const { pages, authorities, statements, multipleFigures } = efs;
export type EfsFigureEntry = { statement: EfsStatement; figure: EfsFigure };

function groupFigures(key: "page" | "authority"): Map<string, EfsFigureEntry[]> {
  const groups = new Map<string, EfsFigureEntry[]>();
  for (const statement of statements) {
    const entries = groups.get(statement[key]) ?? [];
    for (const figure of statement.figures) entries.push({ statement, figure });
    groups.set(statement[key], entries);
  }
  return groups;
}

export const figuresByPage = () => groupFigures("page");
export const figuresByAuthority = () => groupFigures("authority");
