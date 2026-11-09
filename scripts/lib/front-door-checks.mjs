import { heldWording } from './held-wording.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const textOf = html => html.replace(/<[^>]+>/g, ' ').replace(/&#39;|&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const section = (html, id) => new RegExp(`<section\\b[^>]*\\bid="${id}"[^>]*>[\\s\\S]*?</section>`).exec(html)?.[0] ?? '';
/** Checks the built profiles against source presence, printed values and citation placement. */
export function frontDoorChecks(root, dist) {
  const json = path => JSON.parse(readFileSync(join(root, 'data', path), 'utf8'));
  const tax = json('council-tax/england-2026-27.json');
  const registry = json('registry/councils.json');
  const population = json('population/mye25-population.json');
  const collectionManifest = json('collection/source.json');
  const collection = json(`collection/collection-rates-${collectionManifest.year}.json`);
  const elections = json('elections/next-elections.json');
  const links = json('links/local-links.json');
  const efs = json('efs/statements.json');
  const pages = Object.values(registry.councils).filter(c => tax.authorities[c.gss]);
  const failures = [];
  const check = (ok, message) => { if (!ok) failures.push(message); };
  const count = {collection: 0, band: 0, strip: 0, population: 0, elections: 0, links: 0, efs: 0};
  const held = /re-?organi[sz]|unitary|abolish|structural change/i;
  const built = new Map();
  for (const council of pages) {
    const path = join(dist, 'councils', council.slug, 'index.html');
    check(existsSync(path), `Missing profile ${council.slug}`);
    if (!existsSync(path)) continue;
    const html = readFileSync(path, 'utf8');
    built.set(council.slug, html);
    const where = council.slug;
    check(!heldWording(html), `Held wording outside cited source text ${where}`);
    const about = section(html, 'about');
    const collectionSection = section(html, 'collection');
    const electionSection = section(html, 'elections');
    const own = links.councils[council.gss];
    const election = elections.councils[council.gss];
    const pop = population.areas[council.gss];
    const popBlock = /<div\b[^>]*data-profile-population[^>]*>[\s\S]*?<\/div>/.exec(about)?.[0] ?? '';
    const ownBlock = /<div\b[^>]*data-profile-own-pages[^>]*>[\s\S]*?<\/dl>\s*<p[^>]*class="source-line[\s\S]*?<\/p>/.exec(about)?.[0] ?? '';
    check(Boolean(popBlock) === Boolean(pop), `Population presence ${where}`);
    check(Boolean(ownBlock) === Boolean(own), `Service row presence ${where}`);
    check(Boolean(collectionSection) === Boolean(collection.councils[council.gss]), `Collection presence ${where}`);
    check(Boolean(electionSection) === Boolean(election), `Election presence ${where}`);
    if (popBlock) {
      count.population++;
      check(textOf(popBlock).includes(pop.allAges.toLocaleString('en-GB')), `Population value ${where}`);
      check(/<\/p>\s*<p class="source-line/.test(popBlock), `Population source directly below ${where}`);
    }
    for (const service of links.services) {
      const expected = own?.[service.id];
      const pattern = new RegExp(`<a\\b[^>]*href="([^"]+)"[^>]*>${service.title}</a>`);
      const found = pattern.exec(about)?.[1]?.replace(/&amp;/g, '&');
      check(found === expected, `Service ${service.id} presence or URL ${where}`);
    }
    if (own?.councilTax) count.links++;
    if (collectionSection) {
      count.collection++;
      check(collectionSection.includes(`${collection.councils[council.gss].rate.toFixed(2)}%`), `Collection rate ${where}`);
      check(collectionSection.includes(`${collection.england.rate.toFixed(2)}%`), `England rate ${where}`);
    }
    if (election) {
      count.elections++;
      const quote = /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/.exec(electionSection)?.[1];
      check(Boolean(quote) === !held.test(election.quote), `Held quote presence ${where}`);
      if (quote) {
        check(textOf(quote) === textOf(election.quote), `Verbatim quote ${where}`);
        check(!/re[\s\-\u2010-\u2015]*organi[sz]|aboli(?:sh|tion)|structural changes?/i.test(textOf(quote)), `Held wording in quote ${where}`);
      }
      check(electionSection.includes(`href="${election.sourceUrl.replace(/&/g, '&amp;')}"`), `Election citation ${where}`);
      check(textOf(electionSection).includes(String(election.dateLabel ?? election.nextYear)), `Election year ${where}`);
    }
    if (section(html, 'exceptional-financial-support')) count.efs++;
    for (const kind of ['band-d', 'collection']) {
      const figures = [...html.matchAll(new RegExp(`<figure\\b[^>]*data-position-strip="${kind}"[^>]*>[\\s\\S]*?</figure>`, 'g'))];
      check(figures.length === 1, `${kind} strip count ${where}`);
      if (figures.length !== 1) continue;
      count[kind === 'band-d' ? 'band' : 'strip']++;
      const figure = figures[0][0];
      const classCode = tax.authorities[council.gss].classCode;
      const peers = Object.entries(tax.authorities).filter(([gss, r]) => r.classCode === classCode && (kind === 'band-d' ? typeof r.bands.D === 'number' : typeof collection.councils[gss]?.rate === 'number'));
      check((figure.match(/data-strip-peer\b/g) ?? []).length === peers.length, `${kind} peers ${where}`);
      check(/<\/figcaption>\s*<p class="source-line/.test(figure), `${kind} source immediately below caption ${where}`);
      check(!/<script|<astro-island/.test(figure), `${kind} client code ${where}`);
      check(/<svg\b[^>]*role="img"/.test(figure) && figure.includes('<desc') && figure.includes('<title'), `${kind} accessible SVG ${where}`);
      check((figure.match(/data-current(?:[\s=>])/g) ?? []).length === 1, `${kind} current table row ${where}`);
      const body = /<tbody\b[^>]*>([\s\S]*?)<\/tbody>/.exec(figure)?.[1] ?? '';
      const rows = [...body.matchAll(/<tr\b[^>]*>[\s\S]*?<\/tr>/g)].map(m => m[0]);
      const names = rows.map(row => textOf(/<th\b[^>]*>([\s\S]*?)<\/th>/.exec(row)?.[1] ?? ''));
      const expectedNames = peers.map(([, row]) => row.name).sort((a, b) => a.localeCompare(b, 'en-GB'));
      check(JSON.stringify(names) === JSON.stringify(expectedNames), `${kind} table coverage and name order ${where}`);
      const value = kind === 'band-d' ? tax.authorities[council.gss].bands.D : collection.councils[council.gss].rate;
      const renderedValue = /data-strip-current[^>]*data-value="([^"]+)"/.exec(figure)?.[1];
      check(Number(renderedValue) === value, `${kind} current value ${where}`);
      const currentRow = rows.find(row => /data-current(?:[\s=>])/.test(row));
      check(Boolean(currentRow && (currentRow.match(/<strong\b/g) ?? []).length === 2), `${kind} current row emphasis ${where}`);
    }
    const order = ['about', 'tax-summary', 'collection', 'exceptional-financial-support', 'elections', 'budget', 'county-budget', 'spending', 'school-holidays', 'sources'];
    const present = order.filter(id => section(html, id));
    check(present.every((id, i) => i === 0 || html.indexOf(`id="${id}"`) > html.indexOf(`id="${present[i - 1]}"`)), `Profile order ${where}`);
    const contents = /<nav\b[^>]*aria-label="On this page"[\s\S]*?<\/nav>/.exec(html)?.[0];
    check(Boolean(contents), `Missing contents ${where}`);
    if (contents) {
      for (const id of order) check(contents.includes(`href="#${id}"`) === present.includes(id), `Contents presence ${where} ${id}`);
      const listed = [...contents.matchAll(/href="#([^"]+)"/g)].map(m => m[1]).filter(id => order.includes(id));
      check(JSON.stringify(listed) === JSON.stringify(present), `Contents order ${where}`);
    }
    const newSections = section(html, 'tax-summary') + collectionSection + electionSection + popBlock + ownBlock;
    const withoutLabels = newSections.replace(/<(text|figcaption|desc)\b[\s\S]*?<\/\1>/g, '');
    check(!/\bhighest\b|\blowest\b/i.test(textOf(withoutLabels)), `Ordinal wording outside strip labels ${where}`);
    if (where === 'birmingham') check(!textOf(newSections).includes('Birmingham Council'), 'Registry name in new Birmingham content');
  }
  const expected = {
    collection: pages.filter(c => collection.councils[c.gss]).length,
    band: pages.length, strip: pages.length,
    population: pages.filter(c => population.areas[c.gss]).length,
    elections: pages.filter(c => elections.councils[c.gss]).length,
    links: pages.filter(c => links.councils[c.gss]?.councilTax).length,
    efs: pages.filter(c => Object.values(efs.authorities).some(a => a.slug === c.slug)).length,
  };
  for (const key of Object.keys(count)) check(count[key] === expected[key], `B2 ${key}: ${count[key]}, expected ${expected[key]}`);
  const anchors = {
    burnley: ['100,946', '1,308,567', 'Lancashire County Council', '94.09%', '95.60%', '2027', 'Councillors are elected by thirds.'],
    birmingham: ['1,176,960', '90.04%', '2030', 'The whole council is elected together.', 'Exceptional Financial Support'],
    barnsley: ['2027', 'Councillors are elected by thirds.', '96.17%'],
    sheffield: ['92.80%'], 'city-of-london': ['15,631', 'March 2029', '98.09%'],
    'isles-of-scilly': ['2,299', '2029', '95.25%'], westminster: ['id="collection"'], woking: ['id="collection"'],
  };
  for (const [slug, needles] of Object.entries(anchors)) for (const needle of needles) check(built.get(slug)?.includes(needle), `B2 anchor ${slug}: ${needle}`);
  for (const slug of ['sheffield', 'westminster', 'woking']) check(!section(built.get(slug) ?? '', 'elections'), `Held elections ${slug}`);
  for (const slug of ['barnsley', 'sheffield']) check(!built.get(slug)?.includes('residents in mid-2025'), `Held population ${slug}`);
  check(!section(built.get('burnley') ?? '', 'exceptional-financial-support'), 'Unexpected Burnley EFS');
  check(!built.get('woking')?.toLowerCase().includes('abolished'), 'Held Woking wording');
  check(!existsSync(join(dist, 'councils/lancashire/index.html')), 'Unexpected Lancashire page');
  const sources = readFileSync(join(dist, 'sources/index.html'), 'utf8');
  for (const needle of [population.source.title, collection.source.title, elections.source.title, links.source.name]) check(textOf(sources).includes(needle), `B2 source missing ${needle}`);
  return {failures, counts: count};
}
