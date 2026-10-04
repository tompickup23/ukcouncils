/*
 * Ported from aidoge-site src/lib/spending/redaction.ts at 16a5aa7 (4 October
 * 2026), unchanged below this header. Every supplier string or free text from
 * AI DOGE or Public Pound data passes through it before it reaches a page.
 * Keep the two copies in step: a change there is a change here.
 */

/**
 * Payments to individuals, and how they are shown.
 *
 * Councils are required to withhold the names of private individuals: foster
 * carers, care recipients, staff, members of the public owed a refund. Some
 * councils do it by writing REDACTED in the supplier column, some write NAME
 * WITHHELD or VARIOUS or SUNDRY, and some classify the row instead. Every one
 * of those is mirrored rather than defeated: the row counts in every total, and
 * the name never appears anywhere on the page.
 *
 * The rule errs towards withholding. A trading company wrongly labelled as an
 * individual loses a name from a facet; an individual wrongly labelled as a
 * company is the failure the whole project must not have. The markers are
 * matched at a word boundary, so REDACTIVE PUBLISHING LTD, a real supplier in
 * the Burnley file, is a company and REDACTED T/A JLH PLASTERING is withheld.
 */

export const INDIVIDUAL_LABEL = "Individual (name withheld)";
export const INDIVIDUAL_DETAIL_LABEL = "Details withheld";

/** The class the mapper writes on a row whose recipient it withheld. */
export const INDIVIDUAL_RECORD_CLASS = "direct_payment_individual";

/**
 * The markers councils use in the supplier column. The first five are the set
 * agreed for this lane; the rest come from the mapper's REDACTION pattern in
 * burnley-council/scripts/archive_spend_mapper.py, which is what decided
 * record_class upstream. Kept as one list so the two can never drift into
 * disagreeing about the same row.
 */
export const REDACTION_MARKERS = [
  "REDACTED",
  "NAME WITHHELD",
  "UNKNOWN",
  "VARIOUS",
  "SUNDRY",
  "WITHHELD",
  "PERSONAL DATA",
  "NOT DISCLOSED",
  "PRIVATE INDIVIDUAL",
  "INDIVIDUAL",
  "CONFIDENTIAL",
] as const;

/**
 * A supplier value reduced to what can be compared: upper case, punctuation
 * that only ever decorates a marker removed, whitespace collapsed. "redacted*"
 * and "[REDACTED]" and "Redacted " are the same value written three ways.
 */
export function normaliseSupplier(value: unknown): string {
  return String(value ?? "")
    .toUpperCase()
    .replace(/[*_[\]()"'.,:;#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const MARKER_PATTERN = new RegExp(
  `^(${REDACTION_MARKERS.map((m) => m.replace(/\s+/g, "\\s+")).join("|")})\\b`,
);

/** True when the supplier column is a redaction marker rather than a name. */
export function isRedactedSupplier(supplier: unknown): boolean {
  const value = normaliseSupplier(supplier);
  if (!value) return false;
  return MARKER_PATTERN.test(value);
}

/**
 * Words that say the supplier column holds a withholding note rather than a
 * name, wherever in the value they sit.
 *
 * The markers above are matched at the start of the value, which is right for
 * the explorer: it is what the mapper matched upstream, and the two must agree
 * about the same row. A name printed on its own, away from every other row, is
 * held to a stricter test, because the published summaries carry withholding
 * notes the start-anchored list misses: "REDACT PERSONAL INFORMATION", "PAYMENT
 * TO INDIVIDUAL", "PERSONAL REDACTION". None of those is a name, and each of
 * them has headed a council's supplier list. Still at word boundaries, so
 * REDACTIVE PUBLISHING LTD keeps its name here as it does in the explorer.
 */
const WITHHOLDING_WORDS = new RegExp(
  "\\b(REDACT(ED|ION|IONS)?|WITHHELD|WITHHOLD(ING)?|PERSONAL|INDIVIDUALS?|PRIVATE|"
    + "CONFIDENTIAL|NOT\\s+DISCLOSED|ANONYMI[SZ]ED)\\b",
);

/** An honorific opening the value: MR J SMITH, MRS SMITH, DR A PATEL. */
const HONORIFIC = /^(MR|MRS|MS|MISS|MX|DR|SIR|DAME|LADY|LORD|REV|REVD)\b/;

/**
 * Initials and one surname and nothing else: J SMITH, J A SMITH, SMITH J.
 * Run on the normalised value, so "J. Smith" is the same string.
 */
const INITIALS_AND_SURNAME = /^([A-Z] ){1,3}[A-Z][A-Z'-]+$|^[A-Z][A-Z'-]+( [A-Z]){1,3}$/;

/**
 * True when a supplier value has the shape of a person's name.
 *
 * Deliberately narrow and deliberately on the side of withholding: an
 * honorific, or initials beside a single surname. A first name and a surname
 * written out in full cannot be told from a two word company by shape alone;
 * the pipeline's personal name filter, which works from name lists, is what
 * removes those upstream, and this is the check that still holds if it misses.
 */
export function isPersonShapedSupplier(supplier: unknown): boolean {
  const value = normaliseSupplier(supplier);
  if (!value) return false;
  return HONORIFIC.test(value) || INITIALS_AND_SURNAME.test(value);
}

/**
 * The test for a supplier name printed on its own, such as the one line on a
 * share card: true when the value is a redaction marker, carries a withholding
 * word anywhere in it, has the shape of a person's name, or is blank.
 *
 * A true here means the surface prints no supplier at all, not a label in its
 * place: a line reading "Largest supplier: name withheld" still tells the
 * reader that the largest recipient was a person. A company wrongly caught by
 * it loses one line on one card, which is the direction this module errs in.
 */
export function isWithheldOrPersonShaped(supplier: unknown): boolean {
  const value = normaliseSupplier(supplier);
  if (!value) return true;
  return isRedactedSupplier(value)
    || WITHHOLDING_WORDS.test(value)
    || isPersonShapedSupplier(value);
}

export interface SupplierRow {
  supplier?: unknown;
  supplier_canonical?: unknown;
  record_class?: unknown;
}

export const INDIVIDUAL_SENSITIVE_FIELDS = new Set([
  "supplier",
  "supplier_canonical",
  "type",
  "spend_category",
  "service_division",
  "service_area",
  "department",
  "expenditure_category",
  "capital_revenue",
  "description",
  "reference",
  "transaction_number",
  "company_number",
  "company_url",
  "source_file",
]);

export function isIndividualSensitiveField(field: string): boolean {
  return INDIVIDUAL_SENSITIVE_FIELDS.has(field);
}

/**
 * True when the row is a payment to an individual, by either route: the class
 * the mapper assigned, or a redaction marker in either supplier column.
 */
export function isIndividualRow(row: SupplierRow): boolean {
  if (String(row.record_class ?? "").trim() === INDIVIDUAL_RECORD_CLASS) return true;
  return isRedactedSupplier(row.supplier) || isRedactedSupplier(row.supplier_canonical);
}

/**
 * What the supplier column shows. The only function any surface calls: the
 * table, the CSV export, the receipt card and the expanded row all go through
 * it, so there is one place a raw withheld value could leak and it does not.
 */
export function displaySupplier(row: SupplierRow): string {
  if (isIndividualRow(row)) return INDIVIDUAL_LABEL;
  const name = String(row.supplier ?? "").trim();
  return name || "Not stated";
}

/** The canonical supplier, for expert mode. Withheld rows show the label. */
export function displaySupplierCanonical(row: SupplierRow): string {
  if (isIndividualRow(row)) return INDIVIDUAL_LABEL;
  const value = String(row.supplier_canonical ?? "").trim();
  return value || "n/a";
}

/**
 * Free text attached to an individual row must not defeat supplier masking.
 * A publisher can repeat a recipient in a description or reference, and those
 * fields feed the table, expert view, CSV export and receipt card. This is the
 * one display rule all of those surfaces use as defence in depth; contracted
 * police/fire banks are also sanitised before SQLite is written.
 */
export function displayProtectedText(
  row: SupplierRow,
  field: string,
  value: unknown,
): string {
  if (isIndividualRow(row) && isIndividualSensitiveField(field)) {
    return INDIVIDUAL_DETAIL_LABEL;
  }
  if (value === null || value === undefined) return "";
  return String(value);
}

/**
 * A supplier facet with every withheld row dropped.
 *
 * The rows are still counted in the totals row above the table: they are real
 * payments and leaving them out would understate the council. What they cannot
 * be is an entry in a list of names, because that list is a list of people.
 */
export function facetSuppliers<T extends { name: unknown }>(rows: T[]): T[] {
  return rows.filter((row) => !isRedactedSupplier(row.name));
}
