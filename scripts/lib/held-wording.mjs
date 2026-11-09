/** The 9 November 2026 ruling permits only the verbatim RA Part 1 line 906 cell. */
export const RA_906_LABEL = 'Inter-authority transfers in respect of reorganisation';
const HELD = /re[\s\-\u2010-\u2015]*organi[sz]|aboli(?:sh|tion)|structural changes?/i;
export function heldWording(html) {
  if (!HELD.test(html)) return false;
  const masked = html.replace(/<table\b[^>]*\bdata-ra-financing(?:="[^"]*")?[^>]*>[\s\S]*?<\/table>/g, table =>
    table.replace(/<tr\b[^>]*\bdata-record-type="observation"[^>]*>[\s\S]*?<\/tr>/g, row =>
      row.replace(/(<th\b[^>]*\bscope="row"[^>]*>)Inter-authority transfers in respect of reorganisation(<\/th>\s*<td\b[^>]*>906<\/td>)/g, '$1RA source label$2')));
  // This exact label is never exempt as a document title or other citation.
  if (masked.includes(RA_906_LABEL)) return true;
  const withoutCitations = masked.replace(/<(p|li)\b[^>]*class="source-line[^\"]*"[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/<ul\b[^>]*data-profile-sources[^>]*>[\s\S]*?<\/ul>/g, '');
  // B2 quotes retain their primary document URL even when its title uses held wording.
  const withoutCitationUrls = withoutCitations.replace(/(<blockquote\b[^>]*?)\bcite="https?:\/\/[^"]*"([^>]*>)/g, '$1$2');
  return HELD.test(withoutCitationUrls);
}
