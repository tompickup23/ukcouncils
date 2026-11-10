import {parse, walkSync, TEXT_NODE, ELEMENT_NODE, type Node, type ElementNode} from 'ultrahtml';
import {panelView, reorganisationData, reorganisationSources, longDate, type PanelClaim} from '../src/lib/reorganisation';
import {boundarySource} from '../src/lib/boundaries';
import {councilPages} from '../src/lib/paths';
import { heldWording, RA_906_LABEL, outsideReorganisation } from '../scripts/lib/held-wording.mjs';
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadRegistry } from "../src/lib/registry";

// The reorganisation field is held until the registry is rebuilt from a
// corrected UK Places source. See "Held data" in CLAUDE.md.
const HELD_PHRASES = ["government-decided", "four-unitary", "Structural Change Order"];
const DIST = resolve(process.cwd(), "dist");

function* htmlFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (path.endsWith(".html")) yield path;
  }
}

describe("the held reorganisation field", () => {
  it("leaves the registry loading with every council", () => {
    const councils = Object.values(loadRegistry().councils);
    expect(councils.length).toBe(361);
  });

  it("is not read by the council page", () => {
    const page = readFileSync(resolve(process.cwd(), "src/pages/councils/[slug].astro"), "utf-8");
    expect(page).not.toMatch(/\.reorganisation\b/);
  });

  it("is not read anywhere under src except its type", () => {
    const readers: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) walk(path);
        else if (/\.(ts|astro|mjs|js|tsx)$/.test(path) && /\.reorganisation\b/.test(readFileSync(path, "utf-8"))) readers.push(path);
      }
    };
    walk(resolve(process.cwd(), "src"));
    expect(readers).toEqual([]);
  });

  it.skipIf(!existsSync(DIST))("permits sourced panels while the registry wording appears nowhere", () => {
    const hits: string[] = [];
    for (const path of htmlFiles(DIST)) {
      const html = readFileSync(path, "utf-8");
      if (heldWording(html)) hits.push(`held wording in ${path.slice(DIST.length)}`);
      for (const phrase of HELD_PHRASES) if (html.includes(phrase)) hits.push(`${phrase} in ${path.slice(DIST.length)}`);
    }
    expect(hits).toEqual([]);
  });
});


describe("the narrow RA line 906 exception", () => {
  const row = `<tr data-record-type="observation"><th scope="row">${RA_906_LABEL}</th><td>906</td><td>£5,800,000</td></tr>`;
  const table = `<table data-ra-financing><tbody>${row}</tbody></table>`;
  it("accepts the verbatim label only in its original financing row", () => {
    expect(heldWording(table)).toBe(false);
    expect(heldWording('<blockquote cite="https://council.example/reorganisation">The next election is in 2027.</blockquote>')).toBe(false);
    for (const html of [row, `<table>${row}</table>`, table.replace('906', '907'), table.replace('observation', 'calculation'), table.replace('respect of', 'connection with')]) expect(heldWording(html)).toBe(true);
  });
  it("rejects the same label in prose, metadata, citations and other tables", () => {
    for (const html of [`<p>${RA_906_LABEL}</p>`, `<meta content="${RA_906_LABEL}">`, `<meta content="${RA_906_LABEL.replace('-', '&#45;')}">`, `<p class="source-line">${RA_906_LABEL}</p>`, `<ul data-profile-sources><li>${RA_906_LABEL}</li></ul>`, `<table><tr><td>${RA_906_LABEL}</td></tr></table>`, table + `<p>${RA_906_LABEL}</p>`, table.replace('</tbody>', `<tr><td>${RA_906_LABEL}</td></tr></tbody>`)]) expect(heldWording(html)).toBe(true);
  });
});


it.skipIf(!existsSync(DIST))("prints line 906 only on the three source returns and excludes its table from search snippets", () => {
  const found: string[] = [];
  for (const name of readdirSync(join(DIST, 'councils'))) {
    const path = join(DIST, 'councils', name, 'index.html');
    if (!existsSync(path)) continue;
    const html = readFileSync(path, 'utf8');
    if (!html.includes(RA_906_LABEL)) continue;
    found.push(name);
    const tables = html.match(/<table\b[^>]*data-ra-financing[^>]*>[\s\S]*?<\/table>/g) ?? [];
    expect(tables.some(table => table.includes(RA_906_LABEL) && table.includes('data-pagefind-ignore') && /<td[^>]*>906<\/td>/.test(table))).toBe(true);
    expect(heldWording(html)).toBe(false);
    expect(heldWording(html.replace(RA_906_LABEL, 'Inter-authority transfers in respect of REORGANISATION'))).toBe(true);
    expect(heldWording(html + `<p>${RA_906_LABEL}</p>`)).toBe(true);
  }
  expect(found.sort()).toEqual(['bromsgrove', 'buckinghamshire', 'redditch']);
});


const collapse = (s: string) => s.replace(/\s+/g,' ').replace(/\s+([,:.])/g,'$1').trim();
const decode = (s: string) => s.replace(/&#(?:x([\da-f]+)|(\d+));/gi,(_,h,d)=>String.fromCodePoint(parseInt(h??d,h?16:10))).replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
function text(node: Node): string {return node.type === TEXT_NODE ? decode(node.value) : (node.children ?? []).map(text).join(' ');}
function elements(node: Node): ElementNode[] {const found: ElementNode[]=[];walkSync(node,n=>{if(n.type===ELEMENT_NODE)found.push(n);});return found;}
const panelOf = (html: string) => /<section\b[^>]*\bid="reorganisation"[^>]*>[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

it.skipIf(!existsSync(DIST))('renders exactly the reviewed council page joins, with no county pages', () => {
  const rows=readFileSync(resolve('docs/reorganisation-sources/gss-join-dry-run.tsv'),'utf8').trim().split('\n').slice(1).map(r=>r.split('\t'));
  const header=readFileSync(resolve('docs/reorganisation-sources/gss-join-dry-run.tsv'),'utf8').split('\n')[0].split('\t');
  const gssColumn=header.indexOf('gss');
  const expected=new Set(rows.map(r=>r[gssColumn]).filter(gss=>!gss.startsWith('E10')));
  const found:string[]=[];
  for(const {council} of councilPages()) {
    const panel=panelOf(readFileSync(join(DIST,'councils',council.slug,'index.html'),'utf8'));
    expect(Boolean(panel),council.slug).toBe(expected.has(council.gss));
    if(panel)found.push(council.gss);
  }
  expect(found.sort()).toEqual([...expected].sort()); expect(found).toHaveLength(184);
  for(const area of reorganisationData.areas) {
    const county=area.councils.find(c=>c.role==='county')!;
    const slug=county.name!.replace(/ County Council$/, '').toLowerCase().replaceAll(' ','-');
    expect(existsSync(join(DIST,'councils',slug,'index.html')),slug).toBe(false);
  }
  for(const path of htmlFiles(DIST)) if(!path.includes('/councils/')) expect(panelOf(readFileSync(path,'utf8'))).toBe('');
});

it.skipIf(!existsSync(DIST))('accounts for every panel text node and verifies every claim and quotation against saved sources', () => {
  for(const {council} of councilPages()) {
    const view=panelView(council.gss); if(!view)continue;
    const html=readFileSync(join(DIST,'councils',council.slug,'index.html'),'utf8');
    const panel=panelOf(html); const root=parse(panel); const nodes=elements(root);
    const expected=new Map<string,PanelClaim>();
    const add=(c:PanelClaim)=>expected.set(c.key,c);
    add(view.heading);view.status.forEach(add);
    view.rail.forEach(c=>add({...c,text:collapse([c.label,c.text,c.date?longDate(c.date):''].join(' '))}));
    if(!view.area.documentsOnly) {
      add(view.checked);view.proposals.forEach(add);
      if(view.orderRequirement)add(view.orderRequirement);
      if(view.surreyProposal)add(view.surreyProposal);
    } else view.area.timeline.forEach((c,i)=>add({...c,key:`document-${i}`,text:`${longDate(c.date)}: ${c.label}`}));
    view.councils.forEach(c=>add({...c,key:`council-${c.gss}`,text:c.name+(c.current?' (this council)':'')}));
    add({key:'map',...view.mapCitation,text:`${view.area.name}: area councils marked, ${view.name} outlined`});
    const claims=nodes.filter(n=>'data-claim' in n.attributes);
    expect(nodes.filter(n=>'data-reorg-citation' in n.attributes)).toHaveLength(claims.length);
    expect(nodes.find(n=>n.name==='svg')?.attributes['aria-label']).toBe(`${view.area.name}: area councils marked, ${view.name} outlined`);
    expect(claims.map(n=>n.attributes['data-claim']).sort(),council.slug).toEqual([...expected.keys()].sort());
    for(const node of claims) {
      const key=node.attributes['data-claim'];const c=expected.get(key)!;
      expect(node.attributes['data-source'],key).toBe(c.source);
      const source=reorganisationSources[c.source];
      expect(['Ministry of Housing, Communities and Local Government','legislation.gov.uk']).toContain(source.publisher);
      expect(collapse(text(node)),`${council.slug} ${key}`).toBe(collapse([c.text,c.quote??''].join(' '))+(key==='order-requirement'?'.':''));
      const index=nodes.indexOf(node);
      const following=nodes.slice(index+1).find(n=>'data-reorg-citation' in n.attributes || 'data-claim' in n.attributes);
      expect(following?.attributes['data-reorg-citation'],key).toBe(c.source);
      expect(following?.attributes['data-page'] || undefined).toBe(c.page ? String(c.page) : undefined);
      expect(elements(following!).some(n=>n.name==='a' && decode(n.attributes.href??'')===source.url)).toBe(true);
      const citationText=[c,...c.also??[]].map(ref=>{
        const item=reorganisationSources[ref.source];
        return `Source: ${item.publisher}, ${item.title}, ${longDate(item.date)}${ref.pages ? `, pages ${ref.pages.join(' and ')}` : ref.page ? `, page ${ref.page}` : ''}${ref.article ? `, article ${ref.article}` : ''}.`
          + (item.files ? ' '+item.files.map(file=>`${file.file.split('/').pop()} SHA256: ${file.sha256}`).join(' ') : '');
      }).join(' ');
      expect(following?.attributes['data-pages'] || undefined).toBe(c.pages?.join(','));
      expect(collapse(text(following!)),`${council.slug} citation ${key}`).toBe(collapse(citationText));
      for(const q of elements(node).filter(n=>n.name==='q'||n.name==='blockquote')) {
        const filename=c.page ? source.pageTexts?.[String(c.page)] : source.text;
        expect(filename,`${c.source} page ${c.page}`).toBeTruthy();
        expect(collapse(readFileSync(resolve('docs/reorganisation-sources/text',filename!),'utf8'))).toContain(collapse(text(q)));
      }
      expect(collapse(text(node))).not.toMatch(/£|%|population|saving|cost|funding|cancel|scrap|delay/i);
      for(const digits of text(node).match(/\d{3,}/g)??[])expect(digits).toMatch(/^(202[4-9]|264)$/);
    }
    // Any added sentence outside a claim or a verified source line fails here.
    const permittedStatic=new Set([`The published documents cover ${view.area.name}.`,`Read the reorganisation stages, proposals and area councils for ${view.name}`,'Proposals','Documents','Councils in this area','Source:',`Office for National Statistics, ${boundarySource.date}`,'.',`${boundarySource.attribution} Licensed under`,'OGL v3.0']);
    walkSync(root,(node)=>{
      if(node.type!==TEXT_NODE || !collapse(text(node)))return;
      let parent=node.parent;
      while(parent && parent.type===ELEMENT_NODE) {
        if('data-claim' in parent.attributes || 'data-reorg-citation' in parent.attributes)return;
        parent=parent.parent;
      }
      expect(permittedStatic.has(collapse(text(node))),`${council.slug}: unsourced text ${text(node)}`).toBe(true);
    });
    for(const citation of nodes.filter(n=>'data-reorg-citation' in n.attributes)) {
      const source=reorganisationSources[citation.attributes['data-reorg-citation']];
      expect(collapse(text(citation))).toContain(collapse(source.title));
      expect(collapse(text(citation))).toContain(source.publisher);
      for(const file of source.files??[]) {
        expect(collapse(text(citation))).toContain(file.sha256);
        expect(elements(citation).some(n=>n.name==='a'&&decode(n.attributes.href??'')===file.url)).toBe(true);
      }
    }
    expect(panel).not.toMatch(/[\u2013\u2014]|&mdash;|&ndash;|&#821[12];|\x20-\x20/);
    if(view.area.documentsOnly) {
      expect(nodes.some(n=>['q','blockquote'].includes(n.name)||'data-proposals' in n.attributes)).toBe(false);
      expect(view.rail).toEqual([]);
      expect(nodes.some(n=>'data-step' in n.attributes || n.attributes.class==='reorg-rail')).toBe(false);
      expect(html).not.toMatch(/New councils start|Not yet dated/);
      const prose=claims.filter(n=>!n.attributes['data-claim'].startsWith('document-')).map(text).join(' ');
      expect(prose).not.toMatch(/withdraw|claim|court|review|decision/i);
    }
    expect(outsideReorganisation(html)).not.toContain('government-decided');
  }
}, 30000);

it('holds unitary wording outside the permitted sourced panel and citations', () => {
  expect(heldWording('<p>A unitary council.</p>')).toBe(true);
  expect(heldWording('<section id="reorganisation"><p>A unitary council.</p></section>')).toBe(false);
  expect(heldWording('<p class="source-line"><a href="https://www.gov.uk/">A unitary council</a></p>')).toBe(false);
});

it('preserves only existing classification labels in their original markup', () => {
  const labels = [
    '<p class="muted">A unitary authority in North West.</p>',
    '<dd data-council-type>Unitary authority</dd>',
    '<span class="row-detail">Unitary authority</span>',
    '<span>Unitary authority · North West</span>',
    '<option value="blackpool">Blackpool (Unitary authority)</option>',
    '<option value="UA">Unitary authority</option>',
    '<th scope="row">Shire Unitary Authorities [r]</th>',
    '<th scope="colgroup">Unitary authority (63 councils)</th>',
    '<span class="fact-label">Average area Band D for unitary areas, 2026/27</span>',
    '<p class="muted">Other unitary authorities in North West, by council type in the UK Places register.</p>',
    '<section id="2026-27-unitary" aria-labelledby="2026-27-unitary-heading"><h3 id="2026-27-unitary-heading">How much did London boroughs, metropolitan districts and unitary authorities raise their share?</h3></section>',
    '<caption>London boroughs, metropolitan districts and unitary authorities, own Band D 2026/27, change on 2025/26, largest first</caption>',
    '<script type="application/json">{"classCode":"UA","classLabel":"Unitary authority"}</script>',
    '<figure data-position-strip="band-d"><title>Band D in Blackpool among unitary authorities in England</title><div aria-label="Band D in Blackpool among unitary authorities in England"></div></figure>',
  ];
  for (const html of labels) {
    expect(heldWording(html), html).toBe(false);
    expect(heldWording(html + '<p>A new unitary council is proposed.</p>')).toBe(true);
    expect(heldWording(html.replace(/unitary/i, 'new unitary')), html).toBe(true);
  }
  for (const html of [
    '<p>Unitary authority</p>',
    '<dd data-council-type>A new unitary council is proposed.</dd>',
    '<p class="muted">A unitary authority in North West. A new unitary council is proposed.</p>',
    '<figure data-position-strip="band-d"><p>A new unitary council is proposed.</p></figure>',
    '<script type="application/json">{"classCode":"UA","classLabel":"Unitary authority","note":"A new unitary council"}</script>',
  ]) expect(heldWording(html), html).toBe(true);
});
