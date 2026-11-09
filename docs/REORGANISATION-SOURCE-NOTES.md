# B4: reorganisation panel | source notes

Written 9 November 2026 in Claude Code, worktree `~/wt/ukc-reorg`, branch `feat/reorganisation-panel`, cut from `origin/main` at `151dc0f` (PR 35). These notes hold every source, hash and count that `docs/REORGANISATION-PANEL-BRIEF.md` relies on. Every document below was fetched on 9 November 2026 between 09:55 and 10:15 UTC and is saved under `docs/reorganisation-sources/raw/`, hashed in `docs/reorganisation-sources/raw/SHA256SUMS` (128 files). Quotations are from the documents' own text (PDF text extracted with `pdftotext`, GOV.UK pages from the GOV.UK Content API JSON of the page), with the page for PDFs. No figure here is estimated. No individual is named: letters are cited by title, never by signatory.

Decisions taken before this work (DECISIONS-WAITING-2026-11-10, decided 9 November 2026): 8, the panel is B4 after C3; 3, Surrey is carried by the panel; 4, the registry name refresh from UK Places is authorised, with the reorganisation hold kept separate.

## Summary

| Question | Answer, 9 November 2026 | Section |
|---|---|---|
| How many areas are in the programme? | 21, by MHCLG's own count and structure | 1 |
| Councils in those areas | 204 invited councils: 21 county councils and 183 district or unitary councils, plus West Berkshire, brought in by the Oxfordshire minded to letter: 184 councils with a UK Councils page | 2, 9 |
| Structural changes orders made | One: the Surrey (Structural Changes) Order 2026, SI 2026/264. No draft or made order for any other area | 3 |
| Minded to decisions live | Five, all dated 29 October 2026: East Sussex and Brighton and Hove, Gloucestershire, Oxfordshire (with West Berkshire), Warwickshire, Worcestershire | 4 |
| Representation windows | Not yet dated. Each letter says "a minimum of three weeks" (Oxfordshire's letter gives no period; the press release covers all five) and that timings will be confirmed. No timing document was published by 9 November 2026 | 4 |
| Under review, no decision | 15 areas: 9 whose July 2026 decisions were withdrawn on 29 October 2026, 4 whose March 2026 decisions were withdrawn on 7 September 2026, and 2 never decided | 5 |
| Vesting | Surrey 1 April 2027 (the order). The other 20 areas: MHCLG's stated timetable is elections to new councils in May 2028 and vesting on 1 April 2029; no order fixes it | 3, 5 |
| Lancashire | July 2026 decision withdrawn on 29 October 2026 (withdrawn letter to 9 areas, page 2). The county council's protective claim: no record of withdrawal or discontinuance found; treated as live, so Lancashire lines carry the dated documents only | 6 |
| Registry name refresh from UK Places | Changes no name. UK Places as published on 5 November 2026 differs from both registries only in `county` (97 records). The known wrong names are wrong in UK Places too | 8 |
| GSS join | 184 of 184 district and unitary codes join to the registry and to UK Places on exact GSS; all 184 have a council page; the 21 county councils have no page by design | 9 |

## Source register

Publisher MHCLG unless stated. "Content API" means the JSON at `https://www.gov.uk/api/content` plus the page path, saved under `raw/mhclg/govuk-content-api/`. Hashes are SHA-256 of the saved file; the full list is in `raw/SHA256SUMS`.

| Id | Title | Date | URL | Saved file and SHA-256 |
|---|---|---|---|---|
| S1 | Local government reorganisation: Policy and programme updates (collection page, "Timeline" and "The current position on local government reorganisation") | first published 6 February 2025, updated 29 October 2026 | https://www.gov.uk/government/collections/local-government-reorganisation-policy-and-programme-updates | `collections/policy.json`, `4bee04a206a77fc4e078966be7c1094766eee59841c80c18f1d6e6386aee2fde` |
| S2 | The 21 area collection pages, "<Area>: Local government reorganisation" | as listed in section 1 | `https://www.gov.uk/government/collections/<slug>-local-government-reorganisation` | `collections/<slug>.json` |
| S3 | Local government reorganisation: invitation to local authorities in two-tier areas (21 HTML letters, each headed "To:" with its addressee councils) | 5 February 2025 (published 6 February 2025) | https://www.gov.uk/government/publications/local-government-reorganisation-invitation-to-local-authorities-in-two-tier-areas | `publications/local-government-reorganisation-invitation-to-local-authorities-in-two-tier-areas.json` and `invitation-letters/*.json` |
| S4 | Local government reorganisation: withdrawn letter to 9 areas (PDF, 3 pages), attachment to "Local government reorganisation: review update letters to council leaders" | 29 October 2026 | https://assets.publishing.service.gov.uk/media/6ae36c6ed22fc5fecb3eb7f9/Local_government_reorganisation_-_withdrawn_letter_to_9_areas.pdf | `raw/mhclg/Local_government_reorganisation_-_withdrawn_letter_to_9_areas.pdf`, `58f686f6cb85eeaf3dc678f0e00c92cf74c01ac2bec6f1b00473a621bd3f2656` |
| S5 | Local government reorganisation: review letter to 6 areas (PDF, 3 pages), same publication | 29 October 2026 | https://assets.publishing.service.gov.uk/media/6ae366b6d22fc5fecb3eb7ee/Local_government_reorganisation_-_review_letter_to_6_areas.pdf | `21c93437f58196f9cd4f2da034bcb3d7409a7a868decc78c5083ed304924b073` |
| S6 | Local government reorganisation: minded to decision letter to East Sussex and Brighton and Hove council leaders (PDF, 11 pages) | 29 October 2026 | https://assets.publishing.service.gov.uk/media/6ae3581b83b993d8d93eb78a/Local_government_reorganisation_-_minded_to_decision_letter_to_East_Sussex_and_Brighton_and_Hove_council_leaders.pdf | `85fd59c8174e584c5e2a3da71d027f3194133fce3898a69644a207dafda5dda7` |
| S7 | Local government reorganisation: minded to decision letter to Gloucestershire council leaders (PDF, 7 pages) | 29 October 2026 | https://assets.publishing.service.gov.uk/media/6ae34f37c591dbfc31fb684a/Local_government_reorganisation_-_minded_to_decision_letters_to_Gloucestershire_council_leaders.pdf | `d395af7fd9dd8170444f5ef4dc2a954418923104e0c24670d6a1ed3ddff49a22` |
| S8 | Local government reorganisation: minded to decision letter to Oxfordshire council leaders (PDF, 14 pages, addressed to "Council Leaders in Oxfordshire and West Berkshire") | 29 October 2026 | https://assets.publishing.service.gov.uk/media/6ae34ec783b993d8d93eb77a/Local_government_reorganisation_-_minded_to_decision_letter_Oxfordshire.pdf | `712107f078d62f6c5251920b4afcf0187040c2c4c48e1a69021651ac77a637e9` |
| S9 | Local government reorganisation: minded to decision letter to Warwickshire council leaders (PDF, 8 pages) | 29 October 2026 | https://assets.publishing.service.gov.uk/media/6ae34faa976f73ef5cfb6834/Local_government_reorganisation_-_minded_to_decision_letters_to_Warwickshire_council_leaders.pdf | `ad2a3adc80d6c8d7f8514e67665c2aa1b3e6e22dbd3b4ef9688dbb920b9b3e6d` |
| S10 | Local government reorganisation: minded to decision letter to Worcestershire council leaders (PDF, 8 pages) | 29 October 2026 | https://assets.publishing.service.gov.uk/media/6ae34ffba5c2f99e3a7b8330/Local_government_reorganisation_-_minded_to_decision_letter_to_Worcestershire_council_leaders.pdf | `87993efd7d487d59532fa930eb5fa7b7ad1e74dab9ed88c3420b7111fe4aa6d9` |
| S11 | Local Government Reorganisation moves forward in five counties (press release) | 29 October 2026 | https://www.gov.uk/government/news/local-government-reorganisation-moves-forward-in-five-counties | `publications/local-government-reorganisation-moves-forward-in-five-counties.json`, `383aa681215a55e69fc023b232d49cd2082fd499ecc82f5f737be66fd72ec6f5` |
| S12 | The Surrey (Structural Changes) Order 2026, SI 2026/264, as made (PDF, 32 pages, and XML) | made 9 March 2026 | https://www.legislation.gov.uk/uksi/2026/264/contents/made | `raw/legislation/uksi-2026-264-made.pdf`, `b0c9d6e871c9f4580ea14c66e0d50402786f25e18472d524753fe5b47db25dea`; XML `c5072091d5d763fe8951b70776b4a1a2608fe6c6d6d27429a7c420571ea656f9` |
| S13 | Local government reorganisation: programme review and decisions withdrawal letter to Surrey leaders (PDF, 2 pages) | 7 September 2026 | https://assets.publishing.service.gov.uk/media/6aa02015c5796a7a179c6460/Local_government_reorganisation_-_programme_review_and_decisions_withdrawal_letter_to_Surrey_leaders.pdf | `a65572883d0d0e1d9754afa594262b4547d5957f93b75d396842187a6fe261c1` |
| S14 | Local government reorganisation: decision letter to Surrey council leaders (PDF) | 28 October 2025 | https://assets.publishing.service.gov.uk/media/6900953eafec1781f779947a/surrey-lgr-secretary-of-state-letter-to-surrey-leaders.pdf | `f4542acac2a7db44baf93f7b2eb56513aa471a748fa37d52f1f107154bd6ea3f` |
| S15 | The statutory consultations, "Proposals for local government reorganisation in <area>" (HTML attachments listing each proposal and its proposers) | 17 June 2025 (Surrey), 19 November 2025 (four consultations, six areas), 5 February 2026 (14 areas) | `https://www.gov.uk/government/consultations/local-government-reorganisation-in-<slug>/proposals-for-local-government-reorganisation-in-<slug>` | `consultations/att-<slug>.json`, hashes in `SHA256SUMS` |
| S16 | Local government reorganisation: decision letters to council leaders (14 PDFs, the July 2026 decisions, all withdrawn since) | 16 July 2026, updated 4 August 2026 | https://www.gov.uk/government/publications/local-government-reorganisation-decision-letters-to-council-leaders | `raw/mhclg/Local_government_reorganisation_-_decision_letter_to_*.pdf` |
| S17 | Lancashire County Council, Cabinet, 1 October 2026, agenda and minutes page, item 13a "Local Government Reorganisation: Review and Preservation of the Council's Position" | 1 October 2026 | https://council.lancashire.gov.uk/ieListDocuments.aspx?CId=122&MId=16308&Ver=4 | `raw/lancashire/lcc-cabinet-meeting-16308.html`, `2ad7025500abd2b82c93c6d4792e4e41f4694a9a587b074b670872a5b24dbc9e` |
| S18 | Lancashire County Council, Cabinet, 5 November 2026, agenda and minutes page | 5 November 2026 | https://council.lancashire.gov.uk/ieListDocuments.aspx?CId=122&MId=16316&Ver=4 | `raw/lancashire/lcc-cabinet-meeting-16316.html`, `a806788a6f2ec3ae4b66d1c5d4262c94ae405463886e326e9e08261a6e3c7dca` |
| S19 | UK Places, `places.json` (published registry) | `last-modified` 5 November 2026 16:42:27 GMT; identical to `tompickup23/ukplaces` origin/main `public/data/registry/places.json` at `26d3c15` (3 November 2026) | https://ukplaces.co.uk/data/registry/places.json | `raw/ukplaces/places.json`, `73b8c35dbce7e056aa1215f1059e2619f36941bc10ee89058356c13a5f55fa1e` |

Two documents are referred to but not saved: the written ministerial statement HCWS432 of 29 October 2026 (https://questions-statements.parliament.uk/written-statements/detail/2026-10-29/hcws432), which S1 links and which the parliament API did not serve to a script; and GOV.UK Local Links Manager's export (https://local-links-manager.publishing.service.gov.uk/data/links_to_services_provided_by_local_authorities.csv, `last-modified` 9 November 2026 03:00:05 GMT, 7,627,824 bytes, SHA-256 `541dfe3484a3b14a8ac5ed80127ff452b8e5b4a9d90a410037d782747c3f4b94`), read for section 8 and not committed for its size. Neither is a panel source.

## 1. How many areas: 21

The LGR plan of 9 November 2026 says 21. I count 21, by three independent routes in MHCLG's own documents:

1. **The invitation.** S1, "24 March 2025": the government "had received responses from all 21 invited areas", and Proposal Development Contributions were "to be split across these 21 areas". S3 holds 21 letters, one per area.
2. **The current position.** S1, "The current position on local government reorganisation": "Five areas have new minded-to decisions ... Fifteen areas remain under review. Surrey is unaffected, with its new councils going live in April 2027." Five plus fifteen plus Surrey is 21. S11 says the same ("15 in total") and lists them.
3. **MHCLG's structure.** GOV.UK holds exactly 21 area collection pages (S2), found by the GOV.UK search API with `filter_format=document_collection` and the query "local government reorganisation"; S1 is the 22nd, the programme page.

Why 21 and not some other number a reader might reach:

- **Norfolk and Suffolk are two areas,** consulted together (S15, one consultation) but invited, decided and withdrawn separately (S2, S1 "25 March 2026": "3 unitary councils in Norfolk", "3 unitary councils in Suffolk").
- **East Sussex and Brighton and Hove, and West Sussex, are two areas,** consulted together (S15) but decided separately; West Sussex has never had a decision (S1, "16 July 2026").
- **Surrey is in the 21** although its order is made: S1 lists it in the invitation and the review left it "unaffected" (S13, page 2).
- **West Berkshire is not an area.** It was not invited (S3, the Oxfordshire letter has six addressees, none of them West Berkshire). It enters the programme through the Oxfordshire minded to decision (S8, page 1, addressed to "Council Leaders in Oxfordshire and West Berkshire"). It is counted as a council (section 9), not an area.
- **The Isle of Wight is in the Hampshire area** (S3, addressee), but S2 Hampshire, "19 November 2025", says "No changes have been proposed for the Isle of Wight, an existing unitary council."

The 21 areas, with MHCLG's area name, collection slug, first published and last updated dates of each collection page (S2):

| # | Area | Collection slug | Collection dates |
|---|---|---|---|
| 1 | Cambridgeshire and Peterborough | `cambridgeshire-and-peterborough` | 5 February 2026, 29 October 2026 |
| 2 | Derbyshire and Derby | `derbyshire-and-derby` | 5 February 2026, 29 October 2026 |
| 3 | Devon, Plymouth and Torbay | `devon-plymouth-and-torbay` | 5 February 2026, 29 October 2026 |
| 4 | East Sussex and Brighton and Hove | `east-sussex-and-brighton-and-hove` | 19 November 2025, 29 October 2026 |
| 5 | Essex, Southend-on-Sea and Thurrock | `essex-southend-on-sea-and-thurrock` | 19 November 2025, 29 October 2026 |
| 6 | Gloucestershire | `gloucestershire` | 5 February 2026, 29 October 2026 |
| 7 | Hampshire, Isle of Wight, Portsmouth and Southampton | `hampshire-isle-of-wight-portsmouth-and-southampton` | 19 November 2025, 29 October 2026 |
| 8 | Hertfordshire | `hertfordshire` | 5 February 2026, 29 October 2026 |
| 9 | Kent and Medway | `kent-and-medway` | 5 February 2026, 29 October 2026 |
| 10 | Lancashire, Blackburn with Darwen and Blackpool | `lancashire-blackburn-with-darwen-and-blackpool` | 5 February 2026, 29 October 2026 |
| 11 | Leicestershire, Leicester and Rutland | `leicestershire-leicester-and-rutland` | 5 February 2026, 29 October 2026 |
| 12 | Lincolnshire, North Lincolnshire and North East Lincolnshire | `lincolnshire-north-lincolnshire-and-north-east-lincolnshire` | 5 February 2026, 29 October 2026 |
| 13 | Norfolk | `norfolk` | 19 November 2025, 29 October 2026 |
| 14 | Nottinghamshire and Nottingham | `nottinghamshire-and-nottingham` | 5 February 2026, 29 October 2026 |
| 15 | Oxfordshire | `oxfordshire` | 5 February 2026, 29 October 2026 |
| 16 | Staffordshire and Stoke-on-Trent | `staffordshire-and-stoke-on-trent` | 5 February 2026, 29 October 2026 |
| 17 | Suffolk | `suffolk` | 19 November 2025, 29 October 2026 |
| 18 | Surrey | `surrey` | 17 June 2025, 7 July 2026 |
| 19 | Warwickshire | `warwickshire` | 5 February 2026, 29 October 2026 |
| 20 | West Sussex | `west-sussex` | 19 November 2025, 29 October 2026 |
| 21 | Worcestershire | `worcestershire` | 5 February 2026, 29 October 2026 |

The area collection timelines were updated on 29 October 2026 but their bodies still end at July 2026 (or September 2026 for the four areas withdrawn then). The 29 October 2026 position is stated on S1 and in S4 to S11, which the panel cites instead. Two MHCLG typing slips, recorded so nobody "corrects" a date from them: S2 Hampshire, Norfolk and Suffolk head the March decision "25 March 2025" while linking HCWS1455 of 2026-03-25; S3's Kent letter spells "Folkstone", its Staffordshire letter says "Stoke City Council" and its Hertfordshire letter says "East Herts Council".

## 2. Councils by GSS code

Source: the "To:" block of each invitation letter (S3), joined to GSS codes by normalised name against `data/registry/councils.json` and UK Places' `src/data/registry/county-councils.json` (21 county councils, origin/main `26d3c15`). 201 of 204 addressees matched by name; three matched by hand because of MHCLG's spellings: "East Herts Council" is E07000242 East Hertfordshire, "Folkstone and Hythe District Council" is E07000112, "Stoke City Council" is E06000021 Stoke-on-Trent. No GSS code appears in two areas. Every district's `parentGss` in the registry is its area's county council, and every district the registry places under one of the 21 county councils is an addressee: the invitation and the ONS hierarchy agree with no exception.

The machine readable list is `docs/reorganisation-sources/area-councils-by-gss.tsv` (one line per area) and `docs/reorganisation-sources/gss-join-dry-run.tsv` (one line per council). Per area, with the registry's `name`:

1. **Cambridgeshire and Peterborough (7):** E10000003 Cambridgeshire County Council; E06000031 Peterborough; E07000008 Cambridge; E07000009 East Cambridgeshire; E07000010 Fenland; E07000011 Huntingdonshire; E07000012 South Cambridgeshire.
2. **Derbyshire and Derby (10):** E10000007 Derbyshire County Council; E06000015 Derby; E07000032 Amber Valley; E07000033 Bolsover; E07000034 Chesterfield; E07000035 Derbyshire Dales; E07000036 Erewash; E07000037 High Peak; E07000038 North East Derbyshire; E07000039 South Derbyshire.
3. **Devon, Plymouth and Torbay (11):** E10000008 Devon County Council; E06000026 Plymouth; E06000027 Torbay; E07000040 East Devon; E07000041 Exeter; E07000042 Mid Devon; E07000043 North Devon; E07000044 South Hams; E07000045 Teignbridge; E07000046 Torridge; E07000047 West Devon.
4. **East Sussex and Brighton and Hove (7):** E10000011 East Sussex County Council; E06000043 Brighton and Hove; E07000061 Eastbourne; E07000062 Hastings; E07000063 Lewes; E07000064 Rother; E07000065 Wealden.
5. **Essex, Southend-on-Sea and Thurrock (15):** E10000012 Essex County Council; E06000033 Southend-on-Sea; E06000034 Thurrock; E07000066 Basildon; E07000067 Braintree; E07000068 Brentwood; E07000069 Castle Point; E07000070 Chelmsford; E07000071 Colchester; E07000072 Epping Forest; E07000073 Harlow; E07000074 Maldon; E07000075 Rochford; E07000076 Tendring; E07000077 Uttlesford.
6. **Gloucestershire (7):** E10000013 Gloucestershire County Council; E07000078 Cheltenham; E07000079 Cotswold; E07000080 Forest of Dean; E07000081 Gloucester; E07000082 Stroud; E07000083 Tewkesbury.
7. **Hampshire, Isle of Wight, Portsmouth and Southampton (15):** E10000014 Hampshire County Council; E06000044 Portsmouth; E06000045 Southampton; E06000046 Isle of Wight; E07000084 Basingstoke and Deane; E07000085 East Hampshire; E07000086 Eastleigh; E07000087 Fareham; E07000088 Gosport; E07000089 Hart; E07000090 Havant; E07000091 New Forest; E07000092 Rushmoor; E07000093 Test Valley; E07000094 Winchester.
8. **Hertfordshire (11):** E10000015 Hertfordshire County Council; E07000095 Broxbourne; E07000096 Dacorum; E07000098 Hertsmere; E07000099 North Hertfordshire; E07000102 Three Rivers; E07000103 Watford; E07000240 St Albans; E07000241 Welwyn Hatfield; E07000242 East Hertfordshire; E07000243 Stevenage.
9. **Kent and Medway (14):** E10000016 Kent County Council; E06000035 Medway; E07000105 Ashford; E07000106 Canterbury; E07000107 Dartford; E07000108 Dover; E07000109 Gravesham; E07000110 Maidstone; E07000111 Sevenoaks; E07000112 Folkestone and Hythe (registry `name` "Shepway", section 8); E07000113 Swale; E07000114 Thanet; E07000115 Tonbridge and Malling; E07000116 Tunbridge Wells.
10. **Lancashire, Blackburn with Darwen and Blackpool (15):** E10000017 Lancashire County Council; E06000008 Blackburn with Darwen; E06000009 Blackpool; E07000117 Burnley; E07000118 Chorley; E07000119 Fylde; E07000120 Hyndburn; E07000121 Lancaster; E07000122 Pendle; E07000123 Preston; E07000124 Ribble Valley; E07000125 Rossendale; E07000126 South Ribble; E07000127 West Lancashire; E07000128 Wyre.
11. **Leicestershire, Leicester and Rutland (10):** E10000018 Leicestershire County Council; E06000016 Leicester; E06000017 Rutland; E07000129 Blaby; E07000130 Charnwood; E07000131 Harborough; E07000132 Hinckley and Bosworth; E07000133 Melton; E07000134 North West Leicestershire; E07000135 Oadby and Wigston.
12. **Lincolnshire, North Lincolnshire and North East Lincolnshire (10):** E10000019 Lincolnshire County Council; E06000012 North East Lincolnshire; E06000013 North Lincolnshire; E07000136 Boston; E07000137 East Lindsey; E07000138 Lincoln; E07000139 North Kesteven; E07000140 South Holland; E07000141 South Kesteven; E07000142 West Lindsey.
13. **Norfolk (8):** E10000020 Norfolk County Council; E07000143 Breckland; E07000144 Broadland; E07000145 Great Yarmouth; E07000146 King's Lynn and West Norfolk; E07000147 North Norfolk; E07000148 Norwich; E07000149 South Norfolk.
14. **Nottinghamshire and Nottingham (9):** E10000024 Nottinghamshire County Council; E06000018 Nottingham; E07000170 Ashfield; E07000171 Bassetlaw; E07000172 Broxtowe; E07000173 Gedling; E07000174 Mansfield; E07000175 Newark and Sherwood; E07000176 Rushcliffe.
15. **Oxfordshire (6, plus West Berkshire):** E10000025 Oxfordshire County Council; E07000177 Cherwell; E07000178 Oxford; E07000179 South Oxfordshire; E07000180 Vale of White Horse; E07000181 West Oxfordshire; and, from S8, E06000037 West Berkshire.
16. **Staffordshire and Stoke-on-Trent (10):** E10000028 Staffordshire County Council; E06000021 Stoke-on-Trent; E07000192 Cannock Chase; E07000193 East Staffordshire; E07000194 Lichfield; E07000195 Newcastle-under-Lyme; E07000196 South Staffordshire; E07000197 Stafford; E07000198 Staffordshire Moorlands; E07000199 Tamworth.
17. **Suffolk (6):** E10000029 Suffolk County Council; E07000200 Babergh; E07000202 Ipswich; E07000203 Mid Suffolk; E07000244 East Suffolk; E07000245 West Suffolk.
18. **Surrey (12):** E10000030 Surrey County Council; E07000207 Elmbridge; E07000208 Epsom and Ewell; E07000209 Guildford; E07000210 Mole Valley; E07000211 Reigate and Banstead; E07000212 Runnymede; E07000213 Spelthorne; E07000214 Surrey Heath; E07000215 Tandridge; E07000216 Waverley; E07000217 Woking.
19. **Warwickshire (6):** E10000031 Warwickshire County Council; E07000218 North Warwickshire; E07000219 Nuneaton and Bedworth; E07000220 Rugby; E07000221 Stratford-on-Avon; E07000222 Warwick.
20. **West Sussex (8):** E10000032 West Sussex County Council; E07000223 Adur; E07000224 Arun; E07000225 Chichester; E07000226 Crawley; E07000227 Horsham; E07000228 Mid Sussex; E07000229 Worthing.
21. **Worcestershire (7):** E10000034 Worcestershire County Council; E07000234 Bromsgrove; E07000235 Malvern Hills; E07000236 Redditch; E07000237 Worcester; E07000238 Wychavon; E07000239 Wyre Forest.

Totals: 204 addressees (21 county councils, 183 district or unitary); with West Berkshire, 184 councils that have a UK Councils page.

## 3. Surrey: the order and its effective wording (decision 3 recheck)

The order (S12):

- Title and number: "The Surrey (Structural Changes) Order 2026", "2026 No. 264", "Made 9th March 2026" (page 1).
- Commencement: article 1(2), "This Order comes into force on the day after the day on which it is made" (page 1), so 10 March 2026.
- Approval: "A draft of this Order was laid before and approved by a resolution of each House of Parliament in accordance with section 240(6) of the 2007 Act" (page 1).
- The proposal implemented: "The proposal was made by Surrey County Council, Elmbridge Borough Council and Mole Valley District Council" (page 1).
- County: article 3, "On 1st April 2027 (a) the County of Surrey is abolished as a local government area; (b) the county council is wound up and dissolved" (page 3).
- East Surrey: article 2 defines "the East Surrey districts" as "the districts of Elmbridge, Epsom and Ewell, Mole Valley, Reigate and Banstead and Tandridge" (page 2); article 4(2) establishes "a new district council, to be known as East Surrey Council ... as the sole principal authority for the non-metropolitan district of East Surrey"; article 4(5), "On 1st April 2027 (a) the East Surrey districts are abolished as local government areas; and (b) the East Surrey councils are wound up and dissolved" (page 3).
- West Surrey: article 2 defines "the West Surrey districts" as "the districts of Guildford, Runnymede, Spelthorne, Surrey Heath, Waverley and Woking" (page 3); article 5(2) establishes West Surrey Council; article 5(5) in the same words as 4(5) (page 4).

Amendment check: legislation.gov.uk's changes feed for the order (`https://www.legislation.gov.uk/changes/affected/uksi/2026/264/data.feed`) returned 0 results on 9 November 2026, and the "latest available" XML was byte identical to the made XML. A related order, the Surrey (Structural Changes) (Pensions etc.) Order 2026 (SI 2026/1011), exists; it is not needed for the panel and was not read. A title search of 2025 and 2026 statutory instruments and draft instruments for "Structural Changes" found no order and no draft order for any other area.

MHCLG corroboration: S13, page 2, "The new councils for East Surrey and West Surrey are unaffected and outside of this process because they are already established in law"; S1, "9 March 2026" and "The current position"; S11, "Reorganisation in Surrey will remain unaffected with two new unitary authorities ... going live in April 2027".

**Effective wording for the panel.** B2's draft, "Abolished on 1 April 2027 by the Surrey (Structural Changes) Order 2026", reads as past tense and paraphrases. Until 1 April 2027 the councils exist, so the line for the 11 districts is future tense and keeps the order's words: "Under the Surrey (Structural Changes) Order 2026 (SI 2026/264), on 1 April 2027 the district of <name> is abolished as a local government area and <council> is wound up and dissolved. <East or West> Surrey Council becomes the council for the area." Cite article 4(5) or 5(5) and article 4(2) or 5(2). From 1 April 2027 the build can switch to the past tense only by a dated rule that the brief specifies.

## 4. The five minded to decisions, 29 October 2026

Common to all five: each letter says the decision announced on 16 July 2026 for the area is withdrawn ("The previous decision" section: S6 page 10, S7 page 6, S8 page 12, S9 page 7, S10 page 7); "Elections to new councils would take place in May 2028, ahead of vesting in April 2029" or equivalent (S6 to S10, page 1); and "This letter does not itself establish any new council, alter any existing local government boundary or otherwise implement structural change" (S6 page 10, S7 page 6, S8 page 12, S9 page 7, S10 page 7). Any structural change "would need to be provided for in a structural changes order under section 7 of the 2007 Act" (same pages).

**Representation windows.** S6 page 9, S7 page 6, S9 page 7 and S10 page 7: "This representation period will be for a minimum of three weeks." followed by "I will confirm the exact timings shortly" (S6) or "We will confirm the exact timings shortly" (S7, S9, S10). S8 (Oxfordshire), pages 11 and 12, invites representations and states no period. S11 covers all five: "There will be a period of three weeks minimum for further representations before final decisions are taken." On 9 November 2026 the minded to publication (Content API `public_updated_at` 29 October 2026) and every area collection (latest 29 October 2026) carried no timing document, and the GOV.UK search API found none. So: **no window has an opening or closing date.** The panel prints the window as "not yet dated by MHCLG" with the minimum, never a computed date.

| Area | Minded to (quoted) | New councils named | Window | Source |
|---|---|---|---|---|
| East Sussex and Brighton and Hove | "currently minded to implement the proposal submitted by Eastbourne Borough Council, East Sussex County Council, Hastings Borough Council, Lewes District Council and Rother District Council with modifications to the proposed boundary to expand Brighton and Hove by four wards" | East Sussex Council; Brighton and Hove Council, with four Lewes wards (East Saltdean and Telscombe Cliffs, Peacehaven North, Peacehaven East, Peacehaven West); Falmer parish omitted (page 3) | minimum three weeks, timings to follow (page 9) | S6 page 1, table page 2 |
| Gloucestershire | "currently minded to implement the one unitary proposal submitted by Cotswold District Council, Gloucestershire County Council, Stroud District Council and Tewkesbury Borough Council" | Gloucestershire, covering all six districts (table page 2) | minimum three weeks, timings to follow (page 6) | S7 page 1 |
| Oxfordshire | "currently minded to implement the three unitary option submitted by Oxford City Council with modifications to the proposed boundaries to create Greater Oxford Council, Northern Oxfordshire Council and Ridgeway Council" | Greater Oxford, Northern Oxfordshire, Ridgeway; Ridgeway "would bring together the remaining parts of South Oxfordshire and Vale of White Horse with West Berkshire" (page 3); 41 parishes listed in Annex A (page 14) | no period stated in the letter; S11 says three weeks minimum | S8 page 1 |
| Warwickshire | "currently minded to implement the two unitary proposal submitted by North Warwickshire Borough Council, Nuneaton and Bedworth Borough Council, Stratford-on-Avon District Council and Warwick District Council" | North Warwickshire (North Warwickshire, Nuneaton and Bedworth, Rugby); South Warwickshire (Stratford-on-Avon, Warwick) (table pages 1 and 2) | minimum three weeks, timings to follow (page 7) | S9 page 1 |
| Worcestershire | "currently minded to implement the two unitary proposal submitted by Bromsgrove District Council, Malvern Hills District Council, Redditch Borough Council, Worcester City Council and Wychavon District Council" | North Worcestershire (Bromsgrove, Redditch, Wyre Forest); South Worcestershire (Malvern Hills, Worcester, Wychavon) (table page 2) | minimum three weeks, timings to follow (page 7) | S10 page 1 |

The tables in S6 to S10 also print current populations of the proposed councils. Those are MHCLG figures but they are proposal figures, and the panel prints no population, cost, saving or funding figure (brief, rules). The letters' sections on transition funding are likewise not printed.

## 5. The fifteen areas under review

S4 page 2 and S5 page 2, and S11, list them in three groups:

- **Nine areas, July 2026 decisions withdrawn on 29 October 2026** (S4 page 2): Derbyshire and Derby; Devon, Plymouth and Torbay; Hertfordshire; Kent and Medway; Lancashire, Blackburn with Darwen, and Blackpool; Leicestershire, Leicester and Rutland; Lincolnshire, North Lincolnshire and North East Lincolnshire; Nottinghamshire and Nottingham; Staffordshire and Stoke-on-Trent. "For the avoidance of doubt, all options and proposals in your area will remain under consideration as part of the review" (S4 page 2).
- **Four areas, March 2026 decisions withdrawn on 7 September 2026** (S5 page 2; S1 "7 September 2026"): Essex, Southend-on-Sea and Thurrock; Hampshire, Isle of Wight, Portsmouth and Southampton; Norfolk; Suffolk.
- **Two areas never decided** (S5 page 2, "where decisions have not yet been taken"): Cambridgeshire and Peterborough; West Sussex.

Timetable for all fifteen: "the timetable is elections to new councils in May 2028 followed by vesting day on 1 April 2029" (S4 page 3; S5 page 2). "We commit to providing updates on outcomes in another set of areas by Christmas, and that every area will have an outcome announced by early next year" (S4 page 2; the original has a dash before "and", cut here). The 1 April 2029 date is a stated programme timetable, not a statutory date: the panel labels it so.

Proposals per area (S15, each consultation's proposals page, "The N proposals in this consultation were made by the following councils on <date>"). The panel prints, for each proposal, who made it and how many unitary councils it proposes, in MHCLG's words. Counts and dates:

| Area | Proposals | Submitted | Proposers and number of councils proposed |
|---|---|---|---|
| Cambridgeshire and Peterborough | 4 | 28 November 2025 | Cambridge, East Cambridgeshire and South Cambridgeshire: 2. Cambridgeshire County Council: 2. Huntingdonshire: 3. Peterborough and Fenland: 3, with a request to split district areas |
| Derbyshire and Derby | 5 | 28 November 2025 | Derbyshire County Council: 1. Amber Valley: 2. Bolsover and North East Derbyshire: 2, split. Chesterfield, Derby, Erewash and High Peak: 2, split. South Derbyshire: 2 |
| Devon, Plymouth and Torbay | 5 | 28 November 2025 | Devon County Council: 3. South Hams, Teignbridge, West Devon: 3. East Devon, Mid Devon, North Devon, Torridge: 3, split. Exeter and Plymouth: 4, split. Torbay: 4, split |
| Essex, Southend-on-Sea and Thurrock | 4 | 26 September 2025 | Southend-on-Sea with nine districts: 5. Essex County Council, Braintree, Epping Forest: 3. Rochford: 4. Thurrock: 4 |
| Hampshire, Isle of Wight, Portsmouth and Southampton | 4 | 26 September 2025 | Hampshire County Council and East Hampshire: 4. Basingstoke and Deane, New Forest, Test Valley: 5. Eastleigh, Fareham, Hart, Havant, Portsmouth, Rushmoor, Southampton: 5, split. Winchester: 5 |
| Hertfordshire | 3 | 28 November 2025 | Hertfordshire County Council and St Albans: 2. East Hertfordshire, Three Rivers, Watford: 3, split. Broxbourne, Dacorum, Hertsmere, North Hertfordshire, Stevenage, Welwyn Hatfield: 4, split |
| Kent and Medway | 5 | 28 November 2025 | Kent County Council: 1. Folkestone and Hythe, Maidstone, Sevenoaks, Tonbridge and Malling, Tunbridge Wells: 3. Dover, Swale, Thanet: 4. Medway, Ashford, Canterbury: 4, split. Dartford and Gravesham: 5, split |
| Lancashire, Blackburn with Darwen and Blackpool | 5 | 28 November 2025 | Not summarised on the panel (section 6); the consultation is cited as a dated document |
| Leicestershire, Leicester and Rutland | 3 | 28 November 2025 | Leicester: 2, split. Leicestershire County Council: 2. Blaby, Charnwood, Harborough, Hinckley and Bosworth, Melton, North West Leicestershire, Oadby and Wigston, Rutland: 3 |
| Lincolnshire, North Lincolnshire and North East Lincolnshire | 4 | 28 November 2025 | Boston, East Lindsey, South Holland: 2. Lincoln: 4, split. Lincolnshire County Council (supported by North East Lincolnshire and North Lincolnshire): 3. North Kesteven and South Kesteven: 4 |
| Norfolk | 3 (of the joint consultation's 5) | 26 September 2025 | Norfolk County Council: 1. South Norfolk: 2. Breckland, Broadland, Great Yarmouth, King's Lynn and West Norfolk, North Norfolk, Norwich: 3, split |
| Nottinghamshire and Nottingham | 3 | 28 November 2025 | Bassetlaw, Gedling, Mansfield, Newark and Sherwood: 2. Nottingham: 2, split. Nottinghamshire County Council and Rushcliffe: 2 |
| Staffordshire and Stoke-on-Trent | 5 | 28 November 2025 | Cannock Chase, East Staffordshire, Stafford, Stoke-on-Trent: 2. Staffordshire County Council: 2. Staffordshire Moorlands: 2, split. Lichfield, South Staffordshire, Tamworth: 3. Newcastle-under-Lyme: 4 |
| Suffolk | 2 (of the joint consultation's 5) | 26 September 2025 | Suffolk County Council: 1. Babergh, East Suffolk, Ipswich, Mid Suffolk, West Suffolk: 3, split |
| West Sussex | 2 (of the joint consultation's 4), plus a modification consultation of 12 May 2026 | 26 September 2025 | West Sussex County Council: 1. Adur, Arun, Chichester, Crawley, Horsham, Mid Sussex, Worthing: 2 |

The proposals for the five minded to areas are in S6 to S10 page 2 ("We have considered the proposals ...") and S15: East Sussex and Brighton and Hove 2 (the five council two unitary proposal, and Brighton and Hove's five unitary pan Sussex proposal), plus the modification; Gloucestershire 3; Oxfordshire 3; Warwickshire 2; Worcestershire 2. Surrey: 2, made on 9 May 2025 (S15 Surrey government response; S1 says 8 May 2025): Elmbridge, Mole Valley and Surrey County Council, 2; the other nine councils, 3.

The panel builder extracts each proposals list from the saved JSON, not from this table; this table is the expected result (brief, item 3 counts).

## 6. Lancashire

**The withdrawal, from the letter itself.** S4, "Local government reorganisation: withdrawn letter to 9 areas", dated 29 October 2026, page 2: "To give you clarity on the status of the existing decisions while I do that, we have decided to today withdraw the decisions announced in July 2026 for your area. That means decisions from July 2026 have been withdrawn for the following nine areas:" and the list includes "Lancashire, Blackburn with Darwen, and Blackpool". Same page: "For the avoidance of doubt, all options and proposals in your area will remain under consideration as part of the review." Page 3: "the timetable is elections to new councils in May 2028 followed by vesting day on 1 April 2029". The withdrawn decision is S16's Lancashire letter of 16 July 2026 (saved, not to be summarised).

**The county council's protective claim.**

- S17, item 13a, minutes: "authority was sought to commence protective proceedings to preserve the Council's position, with a request that the proceedings be stayed until the outcome of the Government's review", and "any protective claim having to be filed promptly and in any event by 16 October 2026 at the latest". Resolution (ii) authorised legal steps including "commencing protective proceedings and seeking a stay, or taking any associated procedural step, including discontinuing or withdrawing proceedings where appropriate"; resolution (iii): "a further update report would be brought to Cabinet when the information was available on the outcome of the Government's review for Lancashire with options provided on next steps including the continuation of any protective proceedings or withdrawal".
- Filing: a Local Democracy Reporting Service report of 23 October 2026, held in Reports (`LGR_County_Unitary_work/research/current_position.md` on `origin/docs/lgr-county-unitary-2026-11-04`, section 1.7), says the council "has lodged a so-called 'protective claim'" and began proceedings at the Administrative Court. That is a secondary report; no court record was read.
- S18, Cabinet 5 November 2026: items 1 to 13 hold no reorganisation item and no update report; item 8 records no urgent decisions since the last meeting. The next Cabinet is 3 December 2026 (S18, item 10); its agenda page carried no reorganisation item on 9 November 2026.
- No council record of withdrawal or discontinuance was found.

**Status: treated as live.** Unknown is not concluded. While it is live, Lancashire lines carry the dated documents only: each entry is a date, the document's title as published, its publisher and link, with no sentence that summarises, characterises or links the claim, the withdrawal or the proposals, and no mention of the claim at all. This applies to the 14 Lancashire, Blackburn with Darwen and Blackpool pages. Before any further Lancashire wording ships, someone rechecks the claim (Cabinet minutes, the council's news page) and records the date of the check in the data file.

The 14 pages: E06000008, E06000009, E07000117 to E07000128.

## 7. The held field and the seven election quotes

`data/registry/councils.json` holds a `reorganisation` object for the 14 Lancashire codes (status "government-decided", a note, `sourceUrl` news.lancashire.gov.uk, `sourceDate` 2026-07-16), built by UK Places from `ukelections/data/geography/lancashire-unitaries.json` (`scripts/build-registry.mjs` in UK Places, lines 21 and 159 to 167). UK Places still publishes it (S19: 14 records). It describes a decision S4 withdrew. The panel replaces it; it never reads it. The seven quotes B2 withholds (Test Valley, Oxford, Babergh, Mid Suffolk, Worthing, South Oxfordshire, Vale of White Horse) are election order quotes, not panel sources; they stay withheld.

## 8. Where `data/registry/councils.json` comes from, and the UK Places refresh dry run

**ukcouncils.** `scripts/build-registry.mjs` (`npm run data:registry`) fetches UK Places' published `https://ukplaces.co.uk/data/registry/places.json`, keeps `gss, slug, name, officialName, type, country, region, county, parentGss, reorganisation`, and adds sister links that pass a mapping test and a live sitemap test. The committed file is `generated` 2026-09-27, one commit (`92a2cf3`), 361 councils.

**ukcounciltax.** `data/registry/councils.json` is byte identical to ukcouncils' file (`cmp`), committed once in `ce8d72e` (5 October 2026). Its `scripts/sync-registry.mjs` (`npm run data:registry`) imports "an explicitly supplied shared registry export" and sets every `sisters.ukfoodhygiene` to null and `counts.ukfoodhygiene` to 0. The committed file has 356 UK Food Hygiene links, so it was not produced by that script as it stands; running it now would null them, and UK Food Hygiene has been a public network site since 6 October 2026 (ukcounciltax `CLAUDE.md`). `tests/registry.test.ts` line 62 asserts no UK Food Hygiene sister link renders. ukcounciltax prints `officialName` in JSON-LD (`src/pages/councils/[slug].astro` line 103) and the finder's `data-name`; it has no reorganisation hold test.

**UK Places itself** builds `officialName` as `aidogeMatch?.summary.name ?? exactCrosswalk?.name ?? area.areaName` (UK Places `scripts/build-registry.mjs`, line 205), so the value is AI DOGE's display name where one exists. That is why it reads "Birmingham Council", "Barnsley" and "Isles of Scilly Council".

**Dry run: refresh from UK Places as published (S19).** Compared field by field with both registries for all 361 codes (`docs/reorganisation-sources/registry-refresh-dry-run.tsv`):

| Field | Records that would change |
|---|---|
| `slug` | 0 |
| `name` | 0 |
| `officialName` | 0 |
| `type`, `country`, `region`, `parentGss` | 0 |
| `county` | 97: 62 unitaries (E06) and the two new South Yorkshire codes (E08000038, E08000039) gain a ceremonial county where the registry has null (for example E06000001 Hartlepool, null to Durham); 32 London boroughs change from "Inner London" or "Outer London" to "Greater London", and E09000001 from "Inner London" to "City of London". Source: UK Places PR 39, "Correct ceremonial counties using Schedule 1" (`26d3c15`, 3 November 2026) |
| `reorganisation` | 0: the 14 held Lancashire objects are unchanged |

**So a refresh from UK Places today changes no name.** Every name that decision 4 was meant to fix is wrong in UK Places too. The names that differ from an official source, from `docs/reorganisation-sources/registry-names-comparison.tsv`:

- `name` against ONS "Local Authority Districts (May 2026) Boundaries UK BSC" `LAD26NM`, already committed in this repo (`data/geography/lad26-england.geojson`, SHA-256 `b2c54790c27cbacad55228ec574926d855eacfe0d7cab3f2990af85acc888a23`): 2 of 296 English codes differ. E07000112 "Shepway" against ONS "Folkestone and Hythe" (the district was renamed; MHCLG's own council tax Table 9 also says "Folkestone and Hythe"); E08000013 "St Helens" against "St. Helens" (punctuation only).
- `name` against MHCLG "Council Tax levels set by local authorities in England 2026 to 2027", Table 9 names (`data/council-tax/england-2026-27.json`): 6 differ, of which only Shepway is a different name; the others are ONS's inverted forms ("Bristol, City of" against "Bristol"; "County Durham" against "Durham"; "Herefordshire, County of"; "Kingston upon Hull, City of"; "King's Lynn and West Norfolk" against "Kings Lynn and West Norfolk").
- `officialName` against GOV.UK Local Links Manager's `Authority Name` (9 November 2026 export): 284 of the 353 codes the export holds differ, 1 of them only in punctuation. Examples: E08000025 "Birmingham Council" against "Birmingham City Council"; E06000053 "Isles of Scilly Council" against "Council of the Isles of Scilly"; E06000023 "Bristol Council" against "Bristol City Council"; E07000112 "Folkestone & Hythe Council" against "Folkestone and Hythe District Council". The export is not a clean authority either: it holds Barnsley, Sheffield, North Yorkshire, Somerset and four Scottish councils only under their old codes (E08000016 "Barnsley Metropolitan Borough Council", E08000019, E10000023, E10000027, S12000015, S12000024, S12000044, S12000046), and it still lists Christchurch and Poole.

Conclusion for the brief: the refresh is a **UK Places change first** (a named official source for `officialName` and the ONS name for E07000112), then the regenerated file in ukcouncils and in ukcounciltax as separate PRs. Tom chose the source for `officialName` on 9 November 2026: GOV.UK Local Links Manager's `Authority Name` (brief, item 1a and D1). The `county` change rides the refresh and changes printed text on 97 pages (`ProfileAbout` prints `county`), which the PR must list.

## 9. GSS join dry run

`docs/reorganisation-sources/gss-join-dry-run.tsv`, 205 lines (204 addressees and West Berkshire):

| Group | Councils | Joined to registry and UK Places on exact GSS | Have a 2026/27 council tax row, so a page |
|---|---|---|---|
| Order made (Surrey districts) | 11 | 11 | 11 |
| Minded to (five areas, with West Berkshire) | 29 | 29 | 29 |
| Under review (fifteen areas): 91 in the nine withdrawn on 29 October 2026 (14 of them Lancashire), 40 in the four withdrawn on 7 September 2026, 13 in the two undecided | 144 | 144 | 144 |
| County councils | 21 | not in the registry (it holds 361 districts and unitaries) | 0: no county page exists or may be built (B2 decision 5) |
| **Total** | **205** | **184** | **184** |

Names after the refresh are the same as before it (section 8), so the join is the same against either file. All 184 codes are in the ONS May 2026 boundary file the site's maps use (0 missing). Of the 184, 14 are Lancashire (section 6). The Isle of Wight (E06000046) joins; S2 says no change is proposed for it.

## 10. Reproducing

Every fetch used `curl` with a plain user agent; GOV.UK pages were fetched from the Content API. The county council's document store (`council.lancashire.gov.uk/documents/...`) answered scripts with an Azure WAF challenge page, so the Cabinet PDFs were not saved; the agenda and minutes pages (`ieListDocuments.aspx`), which carry the minute text, were saved instead and read in the app's browser. Commands, in order: the GOV.UK search API query in section 1; Content API fetches of the 21 collections, S1, the publications and consultations; `curl -O` of every PDF attachment listed in those JSON files; legislation.gov.uk `made/data.xml`, the PDF and the changes feed; UK Places `places.json`; then the join and comparison scripts, which read only the saved files and the two registries. The comparisons are reproducible from the TSV files and the saved raw files.
