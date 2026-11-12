// Existing council classifications and tax table labels are not reorganisation prose.
// Match their original element and wording, masking only the classification word.
const region = '(?:East Midlands|East of England|North East|North West|South East|South West|West Midlands|Yorkshire and [Tt]he Humber)';
const year = '\\d{4}/\\d{2}';
const rules = [
  new RegExp(`<span\\b[^>]*class="picker-meta"[^>]*>Unitary authority · Single tier · ${region}<\\/span>`, 'g'),
  /<td\b[^>]*data-cell="type"[^>]*>Unitary authority<span\b[^>]*class="picker-county"[^>]*>Single tier<\/span><\/td>/g,
  /<button\b(?=[^>]*data-chip="type")(?=[^>]*data-value="unitary-authority")[^>]*>Unitary authority<\/button>/g,
  new RegExp(`<p\\b[^>]*class="muted"[^>]*>A unitary authority in ${region}\\.<\\/p>`, 'g'),
  /<dd\b[^>]*data-council-type(?:="[^"]*")?[^>]*>Unitary authority<\/dd>/g,
  /<span\b[^>]*class="row-detail"[^>]*>Unitary authority<\/span>/g,
  new RegExp(`<span\\b[^>]*>Unitary authority · ${region}<\\/span>`, 'g'),
  /<option\b[^>]*>[^<>]* \(Unitary authority\)<\/option>/g,
  /<option\b[^>]*value="(?:UA|Unitary authority)"[^>]*>Unitary authority<\/option>/g,
  /<th\b[^>]*scope="row"[^>]*>(?:Unitary authority|Shire Unitary Authorities(?: \[r\])?)<\/th>/g,
  /<th\b[^>]*scope="colgroup"[^>]*>Unitary authority \(\d+ councils\)<\/th>/g,
  new RegExp(`<span\\b[^>]*class="fact-label"[^>]*>Average area Band D(?: for|,) unitary areas, ${year}<\\/span>`, 'g'),
  new RegExp(`<p\\b[^>]*class="muted"[^>]*>Other unitary authorities in ${region}, by council type in the UK Places register\\.<\\/p>`, 'g'),
  new RegExp(`<h3\\b[^>]*>How much did London boroughs, metropolitan districts and unitary authorities raise their share(?: in ${year})?\\?<\\/h3>`, 'g'),
  new RegExp(`<caption\\b[^>]*>London boroughs, metropolitan districts and unitary authorities, own Band D ${year}, change on ${year}, largest first<\\/caption>`, 'g'),
];
const maskWord = value => value.replace(/\bunitary\b/i, 'classification');
export function maskExistingClassifications(html) {
  for (const rule of rules) html = html.replace(rule, element => element.replace(/>([^<]*)</, (_, body) => `>${maskWord(body)}<`));
  html = html.replace(/<tr\b(?=[^>]*\bdata-row(?:\s|=|>))[^>]*>/g,
    tag => tag.replace(/data-type="unitary-authority"/g, maskWord));
  html = html.replace(/<button\b(?=[^>]*data-chip="type")[^>]*>/g,
    tag => tag.replace(/data-value="unitary-authority"/g, maskWord));
  html = html.replace(/<(?:section|h3)\b[^>]*>/g,
    tag => tag.replace(/\b(?:id|aria-labelledby)="\d{4}-\d{2}-unitary(?:-heading)?"/g, maskWord));
  html = html.replace(/<script\b[^>]*type="application\/json"[^>]*>[\s\S]*?<\/script>/g,
    script => script.replace(/"classCode":"UA","classLabel":"Unitary authority"/g, maskWord));
  return html.replace(/<figure\b[^>]*data-position-strip="(?:band-d|collection)"[^>]*>[\s\S]*?<\/figure>/g, figure => {
    // Keep all other chart prose, attributes and any extra classification occurrence checked.
    const title = /(?:Band D|Council tax collection) in [^<>"\n]+ among unitary authorities in England/;
    return figure
      .replace(/<(title|caption)\b[^>]*>[^<>]*<\/\1>/g, element => {
        const body = element.replace(/<[^>]*>/g, '');
        return new RegExp(`^${title.source}$`).test(body) ? maskWord(element) : element;
      })
      .replace(/aria-label="[^"]*"/g, attribute => new RegExp(`^aria-label="${title.source}"$`).test(attribute) ? maskWord(attribute) : attribute)
      .replace(/<desc\b[^>]*>Strip chart\. (?:Area Band D|In-year council tax collection rate), [^<>]* for the \d+ unitary authorities in England, one mark each, from [^<>]*<\/desc>/g, maskWord)
      .replace(/<figcaption\b[^>]*class="small"[^>]*>Each mark is one of the \d+ unitary authorities in England\. Lowest: [^<>]*\. Highest: [^<>]*\.<\/figcaption>/g, maskWord);
  });
}
