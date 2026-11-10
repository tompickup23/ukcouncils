"""Import only the saved sources named in REORGANISATION-SOURCE-NOTES.md."""
from pathlib import Path
import csv
import hashlib
import html
import json
import re
import subprocess

ROOT = Path.cwd()
RAW = ROOT / 'docs/reorganisation-sources/raw'
API = RAW / 'mhclg/govuk-content-api'
TEXT = ROOT / 'docs/reorganisation-sources/text'
OUT = ROOT / 'data/reorganisation'
MHCLG = 'Ministry of Housing, Communities and Local Government'
CHECKED = '2026-11-09'

def require(condition, message):
    if not condition:
        raise ValueError(message)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

manifest = {}
for line in (RAW / 'SHA256SUMS').read_text().splitlines():
    expected, name = line.split(maxsplit=1)
    path = RAW / name
    require(path.is_file() and digest(path) == expected, f'Hash mismatch: {name}')
    manifest[path.resolve()] = expected
require(len(manifest) == 132, 'Expected the 132 reviewed source files')

def read(path):
    require(path.resolve() in manifest, f'Unregistered source: {path}')
    return json.loads(path.read_text())

def plain(value):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]*>', ' ', value))).strip()

sources = {}
texts = {}

def source(id, path, title, date, url, publisher=MHCLG, **extra):
    require(path.resolve() in manifest, f'Unregistered source: {path}')
    value = dict(id=id, publisher=publisher, title=title, date=date, url=url,
                 file=str(path.relative_to(ROOT)), sha256=digest(path), retrieved=CHECKED, **extra)
    sources[id] = value
    return id

def api_source(id, path, date=None):
    doc = read(path)
    source(id, path, doc['title'], date or doc['first_published_at'][:10],
           'https://www.gov.uk' + doc['base_path'])
    textname = id.replace(':', '_') + '.txt'
    texts[textname] = plain(doc.get('details', {}).get('body', ''))
    sources[id]['text'] = textname
    return doc

def pdf_source(id, filename, publication, date):
    parent = read(API / 'publications' / (publication + '.json'))
    attachment = next(a for a in parent['details']['attachments'] if a['url'].split('/')[-1] == filename)
    return source(id, RAW / 'mhclg' / filename, attachment['title'], date, attachment['url'],
                  parent=parent['title'], parentUrl='https://www.gov.uk'+parent['base_path'],
                  pages=attachment.get('number_of_pages'))

def page(id, number):
    filename = Path(sources[id]['file']).stem + f'.p{number}.txt'
    if filename not in texts:
        texts[filename] = plain(subprocess.run(['pdftotext', '-f', str(number), '-l', str(number),
            str(ROOT / sources[id]['file']), '-'], capture_output=True, text=True, check=True).stdout)
    sources[id].setdefault('pageTexts', {})[str(number)] = filename
    return texts[filename]

def citation(id, location, page_number=None):
    return {'source': id, 'paragraph': location, **({'page': page_number} if page_number else {})}

api_source('S1', API/'collections/policy.json', '2026-10-29')
api_source('S3', API/'publications/local-government-reorganisation-invitation-to-local-authorities-in-two-tier-areas.json', '2025-02-05')
api_source('S11', API/'publications/local-government-reorganisation-moves-forward-in-five-counties.json', '2026-10-29')
api_source('S16', API/'publications/local-government-reorganisation-decision-letters-to-council-leaders.json', '2026-07-16')
review = 'local-government-reorganisation-review-update-letters-to-council-leaders'
pdf_source('S4', 'Local_government_reorganisation_-_withdrawn_letter_to_9_areas.pdf', review, '2026-10-29')
pdf_source('S5', 'Local_government_reorganisation_-_review_letter_to_6_areas.pdf', review, '2026-10-29')
minded = [
 ('east-sussex-and-brighton-and-hove', 'S6', 'Local_government_reorganisation_-_minded_to_decision_letter_to_East_Sussex_and_Brighton_and_Hove_council_leaders.pdf', 9, 10, ['East Sussex Council', 'Brighton and Hove Council']),
 ('gloucestershire', 'S7', 'Local_government_reorganisation_-_minded_to_decision_letters_to_Gloucestershire_council_leaders.pdf', 6, 6, ['Gloucestershire']),
 ('oxfordshire', 'S8', 'Local_government_reorganisation_-_minded_to_decision_letter_Oxfordshire.pdf', None, 12, ['Greater Oxford Council', 'Northern Oxfordshire Council', 'Ridgeway Council']),
 ('warwickshire', 'S9', 'Local_government_reorganisation_-_minded_to_decision_letters_to_Warwickshire_council_leaders.pdf', 7, 7, ['North Warwickshire', 'South Warwickshire']),
 ('worcestershire', 'S10', 'Local_government_reorganisation_-_minded_to_decision_letter_to_Worcestershire_council_leaders.pdf', 7, 7, ['North Worcestershire', 'South Worcestershire']),
]
for _, sid, filename, _, _, _ in minded:
    pdf_source(sid, filename, 'local-government-reorganisation-minded-to-decision-letters-to-council-leaders', '2026-10-29')
source('S12', RAW/'legislation/uksi-2026-264-made.pdf', 'The Surrey (Structural Changes) Order 2026',
       '2026-03-09', 'https://www.legislation.gov.uk/uksi/2026/264/contents/made', 'legislation.gov.uk', pages=32)
pdf_source('S13', 'Local_government_reorganisation_-_programme_review_and_decisions_withdrawal_letter_to_Surrey_leaders.pdf',
           'local-government-reorganisation-programme-review-and-decisions-withdrawal-letter-to-council-leaders', '2026-09-07')
pdf_source('S14', 'surrey-lgr-secretary-of-state-letter-to-surrey-leaders.pdf',
           'local-government-reorganisation-decision-letter-to-surrey-council-leaders', '2025-10-28')
pdf_source('S16:lancashire', 'Local_government_reorganisation_-_decision_letter_to_Lancashire__Blackburn_with_Darwen_and_Blackpool_council_leaders.pdf',
           'local-government-reorganisation-decision-letters-to-council-leaders', '2026-07-16')
for sid, meeting, date in [('S17','16308','2026-10-01'), ('S18','16316','2026-11-05')]:
    source(sid, RAW/'lancashire'/f'lcc-cabinet-meeting-{meeting}.html', 'Cabinet, agenda and minutes', date,
           f'https://council.lancashire.gov.uk/ieListDocuments.aspx?CId=122&MId={meeting}&Ver=4', 'Lancashire County Council', statusCheckOnly=True)

feeds = []
for kind, year in [('uksi',2026),('ukdsi',2026),('uksi',2025),('ukdsi',2025)]:
    path = RAW/'legislation'/f'search-{kind}-{year}-structural-changes.feed.xml'
    require(path.resolve() in manifest, f'Unregistered source: {path}')
    feeds.append(dict(file=str(path.relative_to(ROOT)),sha256=digest(path),
        url=f'https://www.legislation.gov.uk/{kind}/{year}/data.feed?title=structural%20changes'))
source('L1', ROOT/feeds[0]['file'],
    'UK Statutory Instruments and UK Draft Statutory Instruments, 2025 and 2026, titles containing Structural Changes',
    CHECKED, feeds[0]['url'], 'legislation.gov.uk', files=feeds)

registry = json.loads((ROOT/'data/registry/councils.json').read_text())['councils']
counties = read(RAW/'ukplaces/county-councils.json')
joins = list(csv.DictReader((ROOT/'docs/reorganisation-sources/gss-join-dry-run.tsv').open(), delimiter='\t'))
expected = [4,5,5,2,4,3,4,3,5,0,3,4,3,3,3,5,2,2,2,2,2]
slugs = ['cambridgeshire-and-peterborough','derbyshire-and-derby','devon-plymouth-and-torbay',
 'east-sussex-and-brighton-and-hove','essex-southend-on-sea-and-thurrock','gloucestershire',
 'hampshire-isle-of-wight-portsmouth-and-southampton','hertfordshire','kent-and-medway',
 'lancashire-blackburn-with-darwen-and-blackpool','leicestershire-leicester-and-rutland',
 'lincolnshire-north-lincolnshire-and-north-east-lincolnshire','norfolk','nottinghamshire-and-nottingham',
 'oxfordshire','staffordshire-and-stoke-on-trent','suffolk','surrey','warwickshire','west-sussex','worcestershire']
areas = []
for slug, proposal_count in zip(slugs, expected):
    collection_id = 'S2:'+slug
    collection = api_source(collection_id, API/'collections'/f'{slug}.json')
    collection['title'] = collection['title'].replace('\u200b', '')
    sources[collection_id]['title'] = collection['title']
    letter = {'east-sussex-and-brighton-and-hove':'letter-east-sussex-and-brighton',
      'lancashire-blackburn-with-darwen-and-blackpool':'letter-lancashire-blackburn-and-blackpool',
      'nottinghamshire-and-nottingham':'nottinghamshire-and-nottingham'}.get(slug, 'letter-'+slug)
    invitation_id = 'S3:'+slug
    invitation = api_source(invitation_id, API/'invitation-letters'/f'{letter}.json', '2025-02-05')
    council_rows = [r for r in joins if r['area'] == letter]
    county = next(r['gss'] for r in council_rows if r['gss'].startswith('E10'))
    councils = []
    for row in council_rows:
        code = row['gss']
        role = 'county' if code.startswith('E10') else 'district' if code.startswith('E07') else 'unitary'
        if role != 'county':
            require(code in registry, f'Registry join failed for {slug}: {code}')
        if role == 'district':
            require(registry[code]['parentGss'] == county, f'Parent join failed: {code}')
        councils.append(dict(gss=code, role=role, **citation(invitation_id, 'To: addressees'),
                             **({'name':counties[code]['name']} if role=='county' else {})))
    if slug == 'oxfordshire':
        councils.append(dict(gss='E06000037', role='unitary', via='S8', **citation('S8', 'Addressees', 1)))
    documents_only = slug.startswith('lancashire')
    match = next((m for m in minded if m[0] == slug), None)
    status = 'order' if slug=='surrey' else 'minded-to' if match else 'undecided' if slug in ['cambridgeshire-and-peterborough','west-sussex'] else 'withdrawn-2026-09' if slug in ['essex-southend-on-sea-and-thurrock','hampshire-isle-of-wight-portsmouth-and-southampton','norfolk','suffolk'] else 'withdrawn-2026-10'
    consult = 'norfolk-and-suffolk' if slug in ['norfolk','suffolk'] else 'east-sussex-and-brighton-and-hove-and-west-sussex' if slug in ['east-sussex-and-brighton-and-hove','west-sussex'] else slug
    proposal_id = 'S15:'+slug
    consultation = api_source(proposal_id, API/'consultations'/f'att-{consult}.json')
    body = consultation['details']['body']
    # Surrey opens with a heading and lists the proposals in list items.
    intro = re.split(r'<h2[^>]*id="(?:scope-of-this-consultation|background)"', body)[0]
    blocks = [plain(b) for b in re.findall(r'<(?:p|h4)[^>]*>(.*?)</(?:p|h4)>', intro, re.S)]
    submission = re.search(r'proposals in this consultation were made by the following councils on (\d+ \w+ \d{4})', plain(body))
    require(submission is not None, f'No submission source line: {slug}')
    from datetime import datetime
    submitted = datetime.strptime(submission[1], '%d %B %Y').date().isoformat()
    proposals = []
    seen = set()
    for paragraph_index, block in enumerate(blocks):
        m = re.match(r'(.+?) (?:have )?proposed (\d+|one) unitary councils?\b(.*)', block)
        if not m: continue
        by, number, rest = m.groups()
        key = (by, number)
        if key in seen: continue
        seen.add(key)
        if slug in ['norfolk','suffolk'] and ('area of '+slug.title()) not in rest: continue
        if slug=='east-sussex-and-brighton-and-hove' and 'whole of the area of West Sussex' in rest: continue
        if slug=='west-sussex' and not ('whole of the area of West Sussex' in rest): continue
        proposals.append(dict(by=[by.rstrip(',')], councils=1 if number=='one' else int(number),
           split=bool(re.search(r'request to split', rest)), submitted=submitted,
           **citation(proposal_id, f'Proposal by {by.rstrip(",")}')))
    if documents_only: proposals=[]
    require(len(proposals)==proposal_count, f'Proposal count mismatch: {slug}: {len(proposals)} expected {proposal_count}')
    area = dict(id=slug, name=collection['title'].split(':')[0], collection=sources[collection_id]['url'],
                source=collection_id, paragraph='Title', status=status, documentsOnly=documents_only,
                councils=councils, proposals=proposals, submitted=submitted, proposalSource=proposal_id,
                invitationSource=invitation_id, mindedTo=None, window=None, order=None, quotes=[])
    timeline = [dict(date='2025-02-05',kind='invitation',label=sources[invitation_id]['title'],**citation(invitation_id,'Title')),
                dict(date=sources[proposal_id]['date'],kind='consultation',label=sources[proposal_id]['title'],**citation(proposal_id,'Title'))]
    if documents_only:
        for sid, kind in [('S16:lancashire','decision'),('S4','withdrawn')]:
            timeline.append(dict(date=sources[sid]['date'],kind=kind,label=sources[sid]['title'],**citation(sid,'Title',1)))
        area['lancashireRule'] = {'checked':CHECKED, 'documentsOnly':True, 'statusCheckSources':['S17','S18']}
    if match:
        _, sid, _, window_page, statutory_page, names = match
        quote = re.search(r'minded to implement (.*?)(?:\.(?:\s|$))', page(sid,1))
        require(quote is not None, f'Missing minded to source line: {slug}')
        area['mindedTo'] = dict(date='2026-10-29', quote=quote[1], newCouncils=names, statutoryPage=statutory_page, **citation(sid,'Minded to decision',1))
        page(sid,statutory_page)
        window_source = sid if window_page else 'S11'
        window_quote = 'This representation period will be for a minimum of three weeks.' if window_page else 'There will be a period of three weeks minimum for further representations before final decisions are taken.'
        if window_page: require(window_quote in page(sid,window_page), f'Window quote mismatch: {slug}')
        else: require(window_quote in texts[sources['S11']['text']], 'S11 window quote mismatch')
        area['window'] = dict(opens=None,closes=None,minimum='three weeks',quote=window_quote,**citation(window_source,'Representation period',window_page))
        area['vesting'] = dict(month='2029-04',basis='timetable',**citation(sid,'Timetable',1))
        area['quotes'] = [dict(text=quote[1],**citation(sid,'Minded to decision',1)), dict(text=window_quote,**citation(window_source,'Representation period',window_page))]
    elif slug=='surrey':
        for n in range(1,5):page('S12',n)
        area['order'] = dict(si='2026/264',title=sources['S12']['title'],made='2026-03-09',inForce='2026-03-10',abolition='2027-04-01',source='S12',articles={})
        article_quotes = [('1(2)',1,'This Order comes into force on the day after the day on which it is made.'),
          ('3',3,'the County of Surrey is abolished as a local government area;'),
          ('4(5)',3,'the East Surrey councils are wound up and dissolved.'),
          ('5(5)',4,'the West Surrey councils are wound up and dissolved.')]
        for article, number, quote in article_quotes:
            require(quote in page('S12',number), f'Surrey article quote mismatch: {article}')
            area['order']['articles'][article] = dict(quote=quote,article=article,**citation('S12','Article '+article,number))
        for side, number, codes in [('East',2,['E07000207','E07000208','E07000210','E07000211','E07000215']),
                                    ('West',3,['E07000209','E07000212','E07000213','E07000214','E07000216','E07000217'])]:
            definitions = page('S12',number)
            districts = re.search('“the '+side+' Surrey districts” means (.*?);', definitions)
            council_names = re.search('“the '+side+' Surrey councils” means (.*?);', definitions)
            require(districts and council_names, 'Missing Surrey article 2 definitions')
            names = re.split(r', | Council and ', council_names[1])
            # Split on the last council conjunction without altering its formal name.
            names = re.split(r'(?<=Council), |(?<=Council) and ', council_names[1])
            require(len(names)==len(codes), 'Surrey council definition count mismatch')
            area['order']['articles']['2'+side] = dict(quote=districts[1],councils=council_names[1],article='2',**citation('S12','Definitions',number))
            for code,name in zip(codes,names):
                c=next(c for c in councils if c['gss']==code)
                c['orderName']=name
                c['successor']=side+' Surrey Council'
                c['orderArticle']='4' if side=='East' else '5'
                c['orderPage']=3 if side=='East' else 4
        area['vesting'] = dict(date='2027-04-01',basis='order',article='3',**citation('S12','Article 3',3))
    else:
        sid, p = ('S4',3) if status=='withdrawn-2026-10' else ('S5',2)
        area['vesting'] = dict(date='2029-04-01',basis='timetable',**citation(sid,'Timetable',p))
        page(sid,p)
    area['timeline']=timeline
    areas.append(area)

require(len(areas)==21, 'Area count mismatch')
all_codes=[c['gss'] for a in areas for c in a['councils']]
require(len(all_codes)==205 and len(set(all_codes))==205, 'Council count or duplicate GSS')
require(sum(c['role']=='county' for a in areas for c in a['councils'])==21, 'County count mismatch')
from collections import Counter
require(dict(Counter(a['status'] for a in areas))=={'order':1,'minded-to':5,'withdrawn-2026-10':9,'withdrawn-2026-09':4,'undecided':2}, 'Status count mismatch')
for a in areas:
    for q in a['quotes']:
        require(not re.search(r'[\u2013\u2014]|\x20-\x20',q['text']), f'Dash in quote: {a["id"]}')
        require(not re.search(r'£|%|population|saving|cost|funding',q['text'],re.I), f'Forbidden quote: {a["id"]}')
for sid,n in [('S4',2),('S5',2),('S8',3)]:page(sid,n)
OUT.mkdir(parents=True,exist_ok=True)
TEXT.mkdir(parents=True,exist_ok=True)
for name,text in texts.items():(TEXT/name).write_text(text+'\n')
(OUT/'sources.json').write_text(json.dumps(sources,indent=2,ensure_ascii=False)+'\n')
(OUT/'areas.json').write_text(json.dumps(dict(checked=CHECKED,programmeSource='S1',areas=areas),indent=2,ensure_ascii=False)+'\n')
print('Verified 132 hashes; 21 areas; 204 invited councils plus West Berkshire; 184 council pages.')
