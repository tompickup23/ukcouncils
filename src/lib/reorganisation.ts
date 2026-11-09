import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {loadRegistry} from './registry';
import {CURRENT_YEAR, loadYear} from './council-tax';
import {longDate} from './sources';

export interface Citation {source: string; page?: number; pages?: number[]; article?: string; also?: Citation[]}
export interface ReorganisationSource {
  id: string; publisher: string; title: string; date: string; url: string; file: string; sha256: string;
  retrieved: string; text?: string; pageTexts?: Record<string,string>;
  files?: {file: string; sha256: string; url: string}[];
}
export interface AreaCouncil extends Citation {
  gss: string; role: string; name?: string; via?: string;
  orderName?: string; successor?: string; orderArticle?: string; orderPage?: number;
}
export interface ReorganisationArea extends Citation {
  id: string; name: string; status: string; documentsOnly: boolean; collection: string;
  councils: AreaCouncil[]; submitted: string; proposalSource: string; invitationSource: string;
  proposals: (Citation & {by: string[]; councils: number; split: boolean; submitted: string})[];
  mindedTo: (Citation & {date: string; quote: string; statutoryPage: number}) | null;
  window: (Citation & {opens: null; closes: null; minimum: string; quote: string}) | null;
  order: (Citation & {si: string; made: string; articles: Record<string, Citation & {quote: string}>}) | null;
  vesting: Citation & {date?: string; month?: string; basis: string};
  quotes: (Citation & {text: string})[];
  timeline: (Citation & {date: string; label: string; kind: string})[];
}
export const reorganisationData = JSON.parse(readFileSync(resolve(process.cwd(), 'data/reorganisation/areas.json'), 'utf8')) as {
  checked: string; programmeSource: string; areas: ReorganisationArea[];
};
export const reorganisationSources = JSON.parse(readFileSync(resolve(process.cwd(), 'data/reorganisation/sources.json'), 'utf8')) as Record<string, ReorganisationSource>;
const forbidden = /£|%|population|saving|cost|funding/i;
const dash = /[\u2013\u2014]|\x20-\x20/;
// Identifiers and provenance are not printed factual quantities.
const identifiers = /^(gss|source|proposalSource|invitationSource|programmeSource|statusCheckSources|via|url|collection|file|sha256|text|pageTexts|files|paragraph)$/;
export function validateReorganisation(data: unknown, sources: Record<string, ReorganisationSource>) {
  function visit(value: unknown, key = ''): void {
    if (identifiers.test(key)) {
      if (/source$/i.test(key) && typeof value === 'string' && !sources[value]) throw new Error(`Unknown source ${value}`);
      return;
    }
    if (Array.isArray(value)) {value.forEach(v => visit(v, key)); return;}
    if (value && typeof value === 'object') {for (const [k,v] of Object.entries(value)) visit(v,k); return;}
    if (typeof value !== 'string' && typeof value !== 'number') return;
    const text = String(value);
    if ((key === 'quote' || key === 'label') && (forbidden.test(text) || dash.test(text))) throw new Error(`Unprintable ${key}`);
    if (/^(date|month|checked|submitted|made|inForce|abolition|si|page|orderPage|statutoryPage|article|orderArticle|councils)$/.test(key)) return;
    for (const digits of text.match(/\d{3,}/g) ?? []) if (!/^(202[4-9]|264)$/.test(digits)) throw new Error(`Unpermitted figure in ${key}`);
  }
  visit(data);
}
validateReorganisation(reorganisationData, reorganisationSources);
for (const area of reorganisationData.areas) for (const quote of area.quotes) {
  if (dash.test(quote.text) || forbidden.test(quote.text)) throw new Error(`Unprintable quotation ${area.id}`);
}
const byGss = new Map<string, {area: ReorganisationArea; council: AreaCouncil; sources: typeof reorganisationSources}>();
const registry = loadRegistry().councils;
const tax = loadYear(CURRENT_YEAR).authorities;
for (const area of reorganisationData.areas) {
  const county = area.councils.find(c => c.role === 'county');
  for (const council of area.councils) {
    if (council.role === 'county') continue;
    if (!registry[council.gss] || !tax[council.gss] || (council.role === 'district' && registry[council.gss].parentGss !== county?.gss)) throw new Error(`Registry join failed ${council.gss}`);
    if (byGss.has(council.gss)) throw new Error(`Duplicate programme council ${council.gss}`);
    byGss.set(council.gss, {area, council, sources: reorganisationSources});
  }
}
export function reorganisationFor(gss: string) {return byGss.get(gss) ?? null;}
export const templates = {
  heading: 'Local government reorganisation in {area}',
  order: 'Under the Surrey (Structural Changes) Order 2026 (SI 2026/264), on 1 April 2027 the district of {name} is abolished as a local government area and {orderName} is wound up and dissolved. {successor} becomes the council for the area.',
  minded: 'On 29 October 2026 the government said it is minded to implement',
  statutory: 'This is not a final decision. The letter says it does not itself establish any new council or alter any boundary.',
  october: 'On 29 October 2026 the government withdrew the decision it announced for {area} in July 2026. All options and proposals remain under consideration.',
  september: 'On 7 September 2026 the government withdrew the decision it announced for {area} in March 2026. The area is in the review the government began that day.',
  undecided: 'The government has not decided on the proposals for {area}. The area is in the review the government began on 7 September 2026.',
  berkshire: 'West Berkshire was not part of the original invitation. The Oxfordshire minded to letter includes it in the proposed Ridgeway council.',
  island: 'No changes have been proposed for the Isle of Wight, an existing unitary council.',
  proposal: '{by} proposed {councils} unitary {noun}{split}',
  surreyProposal: 'The order implements the proposal made by Surrey County Council, Elmbridge Borough Council and Mole Valley District Council.',
  noOrder: 'None made by 9 November 2026',
  neededOrder: 'would need to be provided for in a structural changes order',
  checked: 'Checked against MHCLG and legislation.gov.uk on {date}.',
} as const;
export function fillTemplate(template: string, values: Record<string,string | number>) {
  return template.replace(/\{(\w+)\}/g, (_,key: string) => {
    if (!(key in values)) throw new Error(`Missing template field ${key}`);
    return String(values[key]);
  });
}
export {longDate};

export interface PanelClaim extends Citation {key: string; text: string; quote?: string}
export interface RailStep extends PanelClaim {step: string; state: string; label: string; date?: string}
export function panelView(gss: string) {
  const found = reorganisationFor(gss);
  if (!found) return null;
  const {area, council} = found;
  const name = tax[gss].name;
  const claim = (key: string, text: string, source: string, page?: number, quote?: string): PanelClaim => ({key,text,source,page,quote});
  const status: PanelClaim[] = [];
  if (!area.documentsOnly) {
    if (area.order) status.push({...claim('status',fillTemplate(templates.order,{name,orderName:council.orderName!,successor:council.successor!}), 'S12',council.orderPage), article:`${council.orderArticle}(5) and ${council.orderArticle}(2)`});
    else if (area.mindedTo) {
      status.push(claim('status',templates.minded,area.mindedTo.source,1,area.mindedTo.quote));
      status.push(claim('statutory',templates.statutory,area.mindedTo.source,area.mindedTo.statutoryPage));
    } else if (area.status === 'withdrawn-2026-10') status.push(claim('status',fillTemplate(templates.october,{area:area.name}),'S4',2));
    else if (area.status === 'withdrawn-2026-09') {
      status.push({...claim('status',fillTemplate(templates.september,{area:area.name}),'S1'),also:[{source:'S5',page:2}]});
    } else status.push(claim('status',fillTemplate(templates.undecided,{area:area.name}),'S5',2));
    if (gss === 'E06000037') status.push({...claim('berkshire',templates.berkshire,'S8'),pages:[1,3],also:[{source:area.invitationSource}]});
    if (gss === 'E06000046') status.push(claim('island','',area.source,undefined,templates.island));
  }
  const rail: RailStep[] = [
    {...claim('rail-proposals','',area.proposalSource),step:'proposals',state:'done',label:'Proposals submitted',date:area.submitted},
    {...claim('rail-minded',area.mindedTo || area.order ? '' : 'No minded to decision',area.mindedTo?.source ?? 'S1',area.mindedTo ? 1 : undefined),step:'minded-to',state:area.mindedTo || area.order ? 'done' : 'none',label:area.order ? 'Decision' : 'Minded to decision',date:area.mindedTo?.date ?? (area.order ? '2025-10-28' : undefined)},
    {...claim('rail-window',area.window ? 'Not yet dated by MHCLG' : '',area.window?.source ?? 'S1',area.window?.page,area.window?.quote),step:'window',state:area.window ? 'current' : area.order ? 'none' : 'future',label:'Representation window'},
    {...claim('rail-order',area.order ? 'Made' : templates.noOrder,area.order ? 'S12' : 'L1',area.order ? 1 : undefined),step:'order',state:area.order ? 'done' : 'future',label:'Structural changes order',date:area.order?.made},
    {...claim('rail-vesting',area.order ? '' : area.vesting.month ? 'April 2029, the date the government gives for new councils' : "1 April 2029, the government's stated timetable",area.vesting.source,area.vesting.page),step:'vesting',state:'future',label:'New councils start',date:area.order ? area.vesting.date : undefined},
  ];
  // The sub judice rule permits labels and dates only in Lancashire's rail.
  if (area.documentsOnly) for (const step of rail) {
    step.text = step.date ? '' : 'Not yet dated by MHCLG';
    step.quote = undefined;
    if (step.step === 'vesting') {step.date=area.vesting.date; step.text='';}
  }
  const proposals = area.proposals.map((p,i) => claim(`proposal-${i}`,fillTemplate(templates.proposal,{
    by:new Intl.ListFormat('en-GB',{style:'long',type:'conjunction'}).format(p.by),councils:p.councils,
    noun:p.councils === 1 ? 'council' : 'councils',split:p.split ? ' with a request to split existing district areas' : '',
  }),p.source));
  const councils = area.councils.map(c => ({...c,name:c.role==='county' ? c.name! : tax[c.gss].name,
    href:c.role==='county' || c.gss===gss ? undefined : `/councils/${registry[c.gss].slug}/`,current:c.gss===gss}));
  return {area,council,name,status,rail,proposals,councils,
    mapCitation:{source:area.invitationSource,also:area.councils.some(c=>c.via==='S8') ? [{source:'S8',page:1}] : undefined},
    heading:claim('heading',fillTemplate(templates.heading,{area:area.name}),area.source),
    checked:claim('checked',fillTemplate(templates.checked,{date:longDate(reorganisationData.checked)!}),'S1'),
    orderRequirement:area.mindedTo ? claim('order-requirement','',area.mindedTo.source,area.mindedTo.statutoryPage,templates.neededOrder) : null,
    surreyProposal:area.order ? claim('surrey-proposal',templates.surreyProposal,'S12',1) : null,
  };
}
