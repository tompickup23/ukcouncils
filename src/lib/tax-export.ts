import {validPence, monthlyPence, type TaxBand, type TaxRow} from './tax-view';
export interface ExportSource { publisher: string; title: string; table?: string; url: string; date?: string | null; revised: string | null; licence: string; licenceUrl: string; files: {url: string; sha256: string}[] }
export const EXPORT_CAVEAT = 'Whole-area charge including average parish precepts, before discounts. Your exact bill can differ. Monthly equivalent divides the annual charge by ten and rounds to pennies; actual instalments can differ.';
/** Quote every cell and neutralise spreadsheet formula prefixes in text. */
export function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function taxCsv(rows: TaxRow[], band: TaxBand, year: string, source: ExportSource): string {
  const header = ['Council','GSS code','Council type','Region','Financial year','Band','Annual area charge GBP','Monthly equivalent GBP (ten instalments)','Basis','Publisher','Source title','Source table','Source URL','Published','Revised','Licence','Licence URL','Source files','Source SHA256','Caveat'];
  const records = rows.flatMap(row => {
    const pence = row.years[year]?.[band];
    if (!validPence(pence)) return [];
    return [[row.name,row.gss,row.classLabel,row.region,year,band,(pence / 100).toFixed(2),(monthlyPence(pence) / 100).toFixed(2),row.basis,source.publisher,source.title,source.table ?? '',source.url,source.date ?? '',source.revised ?? '',source.licence,source.licenceUrl,source.files.map(f=>f.url).join(' | '),source.files.map(f=>f.sha256).join(' | '),EXPORT_CAVEAT]];
  });
  return '\uFEFF' + [header,...records].map(cells => cells.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
export function downloadTax(rows: TaxRow[], band: TaxBand, year: string, source: ExportSource, filename: string) {
  const url = URL.createObjectURL(new Blob([taxCsv(rows,band,year,source)], {type: 'text/csv;charset=utf-8'}));
  const link = document.createElement('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
