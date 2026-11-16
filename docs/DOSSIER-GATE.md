# Dossier completion gate

Definition agreed for implementation in Tom's task of 15 November 2026. Applies to the 296 English billing profiles in the pinned 2026/27 council tax table. The denominator is not the 361-body UK Places registry. Completion is due by mid January 2027 and is a necessary gate for the May to June 2027 reversal. Passing this gate does not authorise the reversal, a merge or a deployment; Search Console evidence before and after remains a separate condition.

Read with [the dossier audit](DOSSIER-STATE-2026-11-14.md), [the source decisions](DOSSIER-SOURCES-2026-11.md) and [the two-site plan, section 10](https://github.com/tompickup23/ukcounciltax/blob/docs/plan-lookahead-2026-11-15/docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md#10-look-ahead-from-15-november-2026-late-evening). The branch link is the planning version requested for this work.

## What complete means

Every required part of D1, D3 and C1 to C9 on every billing profile must have exactly one state:

1. **Built from a pinned source (`built`).** The expected content is present in the built HTML, with its existing source lines. The build report records the committed input paths and SHA-256 hashes. Existing source integrity, figure, citation and held-data checks still apply. A marker without content, a missing source pin or an unexplained missing section fails.
2. **Absent with a stated reason (`absent`).** The content is absent and exactly one visible explanation appears in the profile's coverage section. Reason kinds are `no-source`, `not-published` or `held`. No source means no usable source in this site's pinned holdings; it does not assert that the council has published nothing. `not-published` requires specific publisher evidence and is not used for any current gap. Held means an unresolved source, identity, reuse or scope decision. A blank, hidden, duplicated or missing explanation fails.
3. **Out of the January scope by Tom's decision (`out-of-scope`).** The content remains absent, the same visible explanation remains, and the report records the authority and effective date of the scope decision. The only encoded decisions are the defaults Tom authorised in this task, effective after the deadline below. A different decision requires a reviewed change to the state rules and, where applicable, pinned data. No live research is read by the build.

An item with several parts is `absent` if any part is absent, otherwise `out-of-scope` if any part is excluded, otherwise `built`. This conservative roll-up does not hide built parts: their individual states and counts are reported separately. For example, C3 has built budgets but remains absent as a whole because audit and notices are held. Completion means every part is accounted for in one of the three states, not that every possible figure exists.

The build must fail if any expected profile or item is missing, any part has conflicting states, a built part is missing or unpinned, or an absent or excluded part has no visible reason. The current absence wording describes the site's holdings only. It does not name people, infer a financial status or turn an EFS omission into a negative claim.

## Item boundaries and measured counts

Measured on 15 November 2026 from full builds of base `10febebf426fa8f998158a04792c029a1b1dc088` and this change, using Node 22.23.4. Both builds contain 329 HTML pages and 296 billing profiles. The source coverage is unchanged. The baseline has unexplained omissions; the candidate supplies the reasons required by this definition. The table records candidate states after checking the built content and explanations.

| Item | Required parts | Built | Absent with reason | Out of scope |
|---|---|---:|---:|---:|
| D1 | Band D first, summary, type and tier, actions, population where held, sourced budget headline; election, collection and EFS facts are also checked under C2, C3 and C8 | 285 | 11 | 0 |
| D3 | Processed source citations and bibliography, including summary first use | 296 | 0 | 0 |
| C1 | Dossier shell, register and nearby and alike on each English billing profile | 296 | 0 | 0 |
| C2 | Verified election schedule plus seats by party and control | 0 | 296 | 0 |
| C3 | Budget and reserves, EFS, published payments, audit status and original statutory financial notices | 0 | 296 | 0 |
| C4 | Independently sourced programme panel where held | 184 | 112 | 0 |
| C5 | School calendar and reviewed council responsibilities | 287 | 9 | 0 |
| C6 | Checked official service links | 272 | 24 | 0 |
| C7 | Extension to additional body types, assessed as a dependency for each existing profile | 0 | 296 | 0 |
| C8 | Official collection observations and same-class Band D comparison | 296 | 0 | 0 |
| C9 | Sourced contracts and verified public referral | 0 | 296 | 0 |

D1's eleven partial profiles are the nine without a budget return plus Barnsley and Sheffield without matching population observations. C5's two responsibilities exceptions are City of London and Isles of Scilly, both already among the nine missing calendars.

| Part | Built profiles | Profiles needing a reason | Reason or boundary |
|---|---:|---:|---|
| Summary, actions, register and nearby and alike | 296 | 0 | Existing structural checks retained |
| Population | 294 | 2 | No matching observation held |
| Budget summary and budget section | 287 | 9 | No return or non-zero headline in the pinned release |
| Election schedule | 174 | 122 | No pinned verified schedule |
| Seats by party and control | 0 | 296 | Source decision held |
| EFS | 51 | 245 | Not in the pinned list; no negative inference |
| Published payments | 234 | 62 | No dated summary held |
| Audit status | 0 | 296 | Identity, measure and reuse decision held |
| Section 114 original notices | 0 | 296 | Register decision held; no negative inference |
| Independent programme panels | 184 | 112 | No independently sourced panel held |
| School holidays | 287 | 9 | No publishable calendar in the pinned snapshot |
| Responsibilities | 294 | 2 | Special authorities have no reviewed generic mapping |
| Official service links | 272 | 24 | No checked link held; 266 pay links and 218 bin links |
| Additional body types | 0 | 296 | Scope and suitable registry pending |
| Collection and Band D comparison | 296 | 0 | Observed collection is not a composite quality score |
| Contracts | 0 | 296 | Scope, source and public destination pending |

The nine missing budget returns are Castle Point, Coventry, Cumberland, Dudley, Epping Forest, Greenwich, Guildford, South Gloucestershire and Warwick. Whole-county budget sections remain separately sourced on 160 profiles. A county budget is not apportioned to a district. C7 does not add county, combined authority, Scottish, Welsh or Northern Irish routes to the denominator. The existing 296 English profiles are already built under C1. C8 adds no new indicator, composite score or payments ranking.

The registry reorganisation field remains held everywhere under `CLAUDE.md`; it is not an input to C4's panel assessment. Restoring it still requires the corrected UK Places source, Tom's decision and two supporting sources. No private sister referral is introduced. Contracts are distinct from payments, including any future same-buyer or supplier link.

## Open decisions and the default

All five decisions have **15 December 2026** as their decide-by date. If Tom does not decide by the end of that day in Europe/London, the named part is **out of the January gate**, with its absence explanation retained on every affected page. This fallback is authorised by this task. It is not a claim that Tom has selected a source. Before 16 December all five remain held absences. The build uses the London calendar date and tests both sides of the boundary. No public page text changes when the fallback takes effect.

| Decision | What Tom must settle | Default from 16 December 2026 |
|---|---|---|
| Composition source | Option A, Open Council Data with the website's CC BY-SA terms and dated snapshot, or option B, council sources with an accepted dating rule. No composition dataset is admitted by this PR. | Composition out of January scope; seats and control remain visibly held |
| Audit identity method | Accept or reject the measured official-name method, review the residual identities, select the measure and resolve PSAA reuse if needed. Research has no adopted crosswalk. | Audit status out of January scope; identity and reuse absence remains |
| Section 114 register | Approve a non-exhaustive register of inspected original notices, evidenced identities and maintenance responsibility. EFS is not evidence of a notice. | Notices out of January scope; register absence remains |
| C7 scope | Decide which additional body types need profiles, with a suitable registry, routes and sources. | Additional body types out of January scope; existing English billing profiles remain the denominator |
| C9 scope | Decide whether contracts are required for January, with a pinned figure, scope and date and verified live UK Public Contracts destinations. | Contracts out of January scope; contracts absence remains |

Accepting a source or scope does not itself make a section built. The implementation must pin the approved evidence, update the expected parts and remove the corresponding reason only when the content actually renders. Silence does not lift any data hold. The reorganisation hold remains a separate standing decision and has no automatic expiry.

## School holiday source search

Retrieved or attempted **15 November 2026**, Europe/London. These are research links only. No calendar is built, imported, inferred or corrected. A date shown by a source is separate from the retrieval date. A missing publication date is recorded as such; search crawl dates and URL upload folders are not publication dates. School-specific dates are not promoted to authority-wide dates.

| Profile | Council's own page or publication | Date shown and scope | Retrieval date and outcome |
|---|---|---|---|
| Barnsley | [School terms and holidays](https://www.barnsley.gov.uk/services/schools-and-education/school-terms-and-holidays/) | 2026 to 2027 heading; autumn starts 1 September 2026 and summer term ends 21 July 2027. No publication or update date shown. Community and voluntary controlled schools. | 15 November 2026; council calendar verified |
| Blackpool | [School dates](https://www.blackpool.gov.uk/Residents/Education-and-schools/Blackpool-schools/School-dates.aspx) | Last modified 4 September 2023. No 2026/27 calendar on this page; it directs families to each school's own dates and INSET days. | 15 November 2026; council referral verified, no council-wide dated calendar located |
| City of London | [City of London schools](https://www.cityoflondon.gov.uk/services/education-and-learning/schools) | Updated 15 January 2026. School directory, including the maintained Aldgate School; no 2026/27 term dates on this page. | 15 November 2026; council directory verified, no council-wide term dates publication located |
| Enfield | [School term dates](https://www.enfield.gov.uk/services/children-and-education/term-dates) | Academic year 2026 to 2027; autumn starts 2 September 2026 and summer ends 22 July 2027. No publication or update date shown. The linked calendar PDF still labels its dates proposed. | 15 November 2026; council table verified, PDF status caveat retained |
| Halton | [School Term Dates](https://www.halton.gov.uk/education-and-families/schools/school-term-dates), [2026/27 PDF](https://www.halton.gov.uk/sites/default/files/2026-07/Halton%20LA%202026-27%20Term%20Dates.pdf) | Page says dates for 2026/27 are determined; PDF heading says proposed term dates, academic year 2026/27. No publication or update date shown. Community and voluntary controlled schools. | 15 November 2026; council publication verified, page/PDF status discrepancy retained |
| Isles of Scilly | [Schools and Colleges](https://www.scilly.gov.uk/childrens-services/schools-colleges) | Page update 6 May 2025 concerns transport policy. Council directs term date enquiries to Five Islands Academy, its one all-through school. No council calendar printed. | 15 November 2026; council referral verified, academy publication separately checked below |
| Newham | [School Term and Holiday Dates](https://www.newham.gov.uk/downloads/download/2922/school-term-and-holiday-dates-20262027), [2026/27 PDF](https://www.newham.gov.uk/downloads/file/8985/school-term-and-holiday-dates-calendar-2026-2027) | Academic year 2026/2027; autumn starts 2 September 2026 and summer ends 22 July 2027. No publication or update date shown. The PDF describes a framework for governing bodies, with individual school dates potentially different. | 15 November 2026; council publication verified |
| Sheffield | [School holidays and term dates](https://www.sheffield.gov.uk/schools-childcare/school-information-term-dates) | 2026/27 calendar approved 7 May 2025; autumn starts 1 September 2026 and final term ends 21 July 2027. Approval date, not a page update date. Community, voluntary controlled and special schools. | 15 November 2026; council calendar verified |
| South Tyneside | [Find a school and school holiday dates](https://www.southtyneside.gov.uk/article/1098/Find-a-school-and-school-holiday-dates), [Mortimer Primary School council entry](https://www.southtyneside.gov.uk/article/11269/Mortimer-Primary-School-and-Nursery-Unit) | No date verified: both council URLs returned HTTP 403. The school entry is a retrieval lead, not evidence for a borough calendar. | 15 November 2026; retrieval attempted in the web reader and direct HTTP, blocked; original date verification remains outstanding |

The council-linked [Five Islands Academy term dates page](https://fiveislands.scilly.sch.uk/term-dates/) links its [2026/27 academic calendar](https://fiveislands.scilly.sch.uk/wp-content/uploads/2026/04/Term-dates-2026_27.pdf). The PDF shows autumn 1 September to 18 December 2026, spring 4 January to 25 March 2027 and summer 12 April to 23 July 2027, with school closure days separately identified. Neither page nor PDF shows a publication or update date. Retrieved 15 November 2026. This is an academy source reached through the council, not a council-published authority calendar.

Five council calendar publications are verified. Scilly provides a verified council referral and a separate academy calendar. Blackpool and City of London provide council referral or directory evidence, not an authority calendar. South Tyneside remains blocked. Those limits explain why this research cannot honestly supply nine council-published calendars. Tom decides whether and how any of these sources enters the calendar pipeline. All nine profile calendars remain absent in this PR.

## Page text exceptions and verification

**All 296 billing profiles** currently omit the held composition, audit, statutory notice, additional body-type and contracts parts without a page explanation. Conditional source gaps also lack a specific reason. Therefore each `/councils/<slug>/` gains only the coverage section headed "What is not shown on this profile", with its applicable reasons. The profile inventory below lists every affected slug and its item states. No existing figure, source line, calendar, title, canonical, route or registry field changes. No other page text is changed.

The build runs `scripts/check-dossier.mjs` after citation processing and writes the full per-profile, per-part state, reason, decision and input-hash report to ignored `.ops/dossier-coverage.json`. `npm run test:dist` also calls the coverage validator through the existing dossier gate. To reproduce:

```sh
npm test
npm run check
npm run build
npm run test:dist
node scripts/diff-numbers.mjs .ops/baseline-dist dist
```

The baseline is a full build at the base commit before these edits. Keep it outside `dist` before building the candidate. The appendix is a frozen measurement, not the build's input. The current report must be regenerated for the January decision. No network research or document appendix is used to decide what renders.

Final local verification: 360 tests passed across 52 files with none skipped; Astro check reported zero errors and warnings; the build produced 329 pages and the dossier gate passed all 296 profiles; the dist check passed 329 pages and 328 sitemap URLs. The number comparison found zero differing, added or removed pages. A separate HTML comparison found exactly 296 changed profiles and no changes outside the new coverage section after normalising inter-tag whitespace. Mobile and desktop checks found no overflow; the reasons also rendered with JavaScript disabled. Verification details are recorded in the PR body. Regression tests remove content, source pins and explanations, hide and duplicate explanations, put them outside main, introduce contradictory content, and remove the scope authority. They also test 15 and 16 December and the January default. Existing composition and withdrawn-registry guards are unchanged.

## Every profile

`B` means built from a pinned source. `A` means at least one absent part, with each reason on the page. `O` means out of January scope under the recorded decision. Partial items use the conservative roll-up above; the full generated report lists their built and absent parts. All rows below are measured on 15 November 2026, before the fallback date.

| Profile | D1 | D3 | C1 | C2 | C3 | C4 | C5 | C6 | C7 | C8 | C9 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| adur | B | B | B | A | A | B | B | B | A | B | A |
| amber-valley | B | B | B | A | A | B | B | B | A | B | A |
| arun | B | B | B | A | A | B | B | B | A | B | A |
| ashfield | B | B | B | A | A | B | B | B | A | B | A |
| ashford | B | B | B | A | A | B | B | B | A | B | A |
| babergh | B | B | B | A | A | B | B | B | A | B | A |
| barking-and-dagenham | B | B | B | A | A | A | B | B | A | B | A |
| barnet | B | B | B | A | A | A | B | B | A | B | A |
| barnsley | A | B | B | A | A | A | A | B | A | B | A |
| basildon | B | B | B | A | A | B | B | A | A | B | A |
| basingstoke-and-deane | B | B | B | A | A | B | B | B | A | B | A |
| bassetlaw | B | B | B | A | A | B | B | B | A | B | A |
| bath-and-north-east-somerset | B | B | B | A | A | A | B | B | A | B | A |
| bedford | B | B | B | A | A | A | B | B | A | B | A |
| bexley | B | B | B | A | A | A | B | B | A | B | A |
| birmingham | B | B | B | A | A | A | B | B | A | B | A |
| blaby | B | B | B | A | A | B | B | B | A | B | A |
| blackburn-with-darwen | B | B | B | A | A | B | B | B | A | B | A |
| blackpool | B | B | B | A | A | B | A | B | A | B | A |
| bolsover | B | B | B | A | A | B | B | B | A | B | A |
| bolton | B | B | B | A | A | A | B | B | A | B | A |
| boston | B | B | B | A | A | B | B | B | A | B | A |
| bournemouth-christchurch-and-poole | B | B | B | A | A | A | B | B | A | B | A |
| bracknell-forest | B | B | B | A | A | A | B | B | A | B | A |
| bradford | B | B | B | A | A | A | B | B | A | B | A |
| braintree | B | B | B | A | A | B | B | B | A | B | A |
| breckland | B | B | B | A | A | B | B | B | A | B | A |
| brent | B | B | B | A | A | A | B | B | A | B | A |
| brentwood | B | B | B | A | A | B | B | B | A | B | A |
| brighton-and-hove | B | B | B | A | A | B | B | B | A | B | A |
| bristol-city-of | B | B | B | A | A | A | B | B | A | B | A |
| broadland | B | B | B | A | A | B | B | B | A | B | A |
| bromley | B | B | B | A | A | A | B | B | A | B | A |
| bromsgrove | B | B | B | A | A | B | B | B | A | B | A |
| broxbourne | B | B | B | A | A | B | B | B | A | B | A |
| broxtowe | B | B | B | A | A | B | B | B | A | B | A |
| buckinghamshire | B | B | B | A | A | A | B | B | A | B | A |
| burnley | B | B | B | A | A | B | B | B | A | B | A |
| bury | B | B | B | A | A | A | B | B | A | B | A |
| calderdale | B | B | B | A | A | A | B | B | A | B | A |
| cambridge | B | B | B | A | A | B | B | B | A | B | A |
| camden | B | B | B | A | A | A | B | B | A | B | A |
| cannock-chase | B | B | B | A | A | B | B | B | A | B | A |
| canterbury | B | B | B | A | A | B | B | B | A | B | A |
| castle-point | A | B | B | A | A | B | B | B | A | B | A |
| central-bedfordshire | B | B | B | A | A | A | B | B | A | B | A |
| charnwood | B | B | B | A | A | B | B | B | A | B | A |
| chelmsford | B | B | B | A | A | B | B | B | A | B | A |
| cheltenham | B | B | B | A | A | B | B | B | A | B | A |
| cherwell | B | B | B | A | A | B | B | B | A | B | A |
| cheshire-east | B | B | B | A | A | A | B | B | A | B | A |
| cheshire-west-and-chester | B | B | B | A | A | A | B | B | A | B | A |
| chesterfield | B | B | B | A | A | B | B | B | A | B | A |
| chichester | B | B | B | A | A | B | B | A | A | B | A |
| chorley | B | B | B | A | A | B | B | B | A | B | A |
| city-of-london | B | B | B | A | A | A | A | B | A | B | A |
| colchester | B | B | B | A | A | B | B | B | A | B | A |
| cornwall | B | B | B | A | A | A | B | B | A | B | A |
| cotswold | B | B | B | A | A | B | B | B | A | B | A |
| county-durham | B | B | B | A | A | A | B | B | A | B | A |
| coventry | A | B | B | A | A | A | B | B | A | B | A |
| crawley | B | B | B | A | A | B | B | B | A | B | A |
| croydon | B | B | B | A | A | A | B | B | A | B | A |
| cumberland | A | B | B | A | A | A | B | A | A | B | A |
| dacorum | B | B | B | A | A | B | B | B | A | B | A |
| darlington | B | B | B | A | A | A | B | B | A | B | A |
| dartford | B | B | B | A | A | B | B | B | A | B | A |
| derby | B | B | B | A | A | B | B | B | A | B | A |
| derbyshire-dales | B | B | B | A | A | B | B | B | A | B | A |
| doncaster | B | B | B | A | A | A | B | B | A | B | A |
| dorset | B | B | B | A | A | A | B | B | A | B | A |
| dover | B | B | B | A | A | B | B | B | A | B | A |
| dudley | A | B | B | A | A | A | B | B | A | B | A |
| ealing | B | B | B | A | A | A | B | B | A | B | A |
| east-cambridgeshire | B | B | B | A | A | B | B | B | A | B | A |
| east-devon | B | B | B | A | A | B | B | B | A | B | A |
| east-hampshire | B | B | B | A | A | B | B | B | A | B | A |
| east-hertfordshire | B | B | B | A | A | B | B | B | A | B | A |
| east-lindsey | B | B | B | A | A | B | B | B | A | B | A |
| east-riding-of-yorkshire | B | B | B | A | A | A | B | B | A | B | A |
| east-staffordshire | B | B | B | A | A | B | B | B | A | B | A |
| east-suffolk | B | B | B | A | A | B | B | B | A | B | A |
| eastbourne | B | B | B | A | A | B | B | B | A | B | A |
| eastleigh | B | B | B | A | A | B | B | A | A | B | A |
| elmbridge | B | B | B | A | A | B | B | B | A | B | A |
| enfield | B | B | B | A | A | A | A | A | A | B | A |
| epping-forest | A | B | B | A | A | B | B | B | A | B | A |
| epsom-and-ewell | B | B | B | A | A | B | B | B | A | B | A |
| erewash | B | B | B | A | A | B | B | B | A | B | A |
| exeter | B | B | B | A | A | B | B | B | A | B | A |
| fareham | B | B | B | A | A | B | B | B | A | B | A |
| fenland | B | B | B | A | A | B | B | B | A | B | A |
| forest-of-dean | B | B | B | A | A | B | B | B | A | B | A |
| fylde | B | B | B | A | A | B | B | B | A | B | A |
| gateshead | B | B | B | A | A | A | B | B | A | B | A |
| gedling | B | B | B | A | A | B | B | B | A | B | A |
| gloucester | B | B | B | A | A | B | B | B | A | B | A |
| gosport | B | B | B | A | A | B | B | B | A | B | A |
| gravesham | B | B | B | A | A | B | B | B | A | B | A |
| great-yarmouth | B | B | B | A | A | B | B | B | A | B | A |
| greenwich | A | B | B | A | A | A | B | B | A | B | A |
| guildford | A | B | B | A | A | B | B | B | A | B | A |
| hackney | B | B | B | A | A | A | B | B | A | B | A |
| halton | B | B | B | A | A | A | A | A | A | B | A |
| hammersmith-and-fulham | B | B | B | A | A | A | B | A | A | B | A |
| harborough | B | B | B | A | A | B | B | B | A | B | A |
| haringey | B | B | B | A | A | A | B | B | A | B | A |
| harlow | B | B | B | A | A | B | B | B | A | B | A |
| harrow | B | B | B | A | A | A | B | B | A | B | A |
| hart | B | B | B | A | A | B | B | B | A | B | A |
| hartlepool | B | B | B | A | A | A | B | B | A | B | A |
| hastings | B | B | B | A | A | B | B | B | A | B | A |
| havant | B | B | B | A | A | B | B | B | A | B | A |
| havering | B | B | B | A | A | A | B | B | A | B | A |
| herefordshire-county-of | B | B | B | A | A | A | B | B | A | B | A |
| hertsmere | B | B | B | A | A | B | B | B | A | B | A |
| high-peak | B | B | B | A | A | B | B | B | A | B | A |
| hillingdon | B | B | B | A | A | A | B | B | A | B | A |
| hinckley-and-bosworth | B | B | B | A | A | B | B | B | A | B | A |
| horsham | B | B | B | A | A | B | B | B | A | B | A |
| hounslow | B | B | B | A | A | A | B | B | A | B | A |
| huntingdonshire | B | B | B | A | A | B | B | B | A | B | A |
| hyndburn | B | B | B | A | A | B | B | B | A | B | A |
| ipswich | B | B | B | A | A | B | B | B | A | B | A |
| isle-of-wight | B | B | B | A | A | B | B | B | A | B | A |
| isles-of-scilly | B | B | B | A | A | A | A | B | A | B | A |
| islington | B | B | B | A | A | A | B | B | A | B | A |
| kensington-and-chelsea | B | B | B | A | A | A | B | B | A | B | A |
| king-s-lynn-and-west-norfolk | B | B | B | A | A | B | B | B | A | B | A |
| kingston-upon-hull-city-of | B | B | B | A | A | A | B | B | A | B | A |
| kingston-upon-thames | B | B | B | A | A | A | B | B | A | B | A |
| kirklees | B | B | B | A | A | A | B | B | A | B | A |
| knowsley | B | B | B | A | A | A | B | B | A | B | A |
| lambeth | B | B | B | A | A | A | B | B | A | B | A |
| lancaster | B | B | B | A | A | B | B | B | A | B | A |
| leeds | B | B | B | A | A | A | B | B | A | B | A |
| leicester | B | B | B | A | A | B | B | B | A | B | A |
| lewes | B | B | B | A | A | B | B | B | A | B | A |
| lewisham | B | B | B | A | A | A | B | B | A | B | A |
| lichfield | B | B | B | A | A | B | B | B | A | B | A |
| lincoln | B | B | B | A | A | B | B | B | A | B | A |
| liverpool | B | B | B | A | A | A | B | B | A | B | A |
| luton | B | B | B | A | A | A | B | B | A | B | A |
| maidstone | B | B | B | A | A | B | B | A | A | B | A |
| maldon | B | B | B | A | A | B | B | B | A | B | A |
| malvern-hills | B | B | B | A | A | B | B | B | A | B | A |
| manchester | B | B | B | A | A | A | B | A | A | B | A |
| mansfield | B | B | B | A | A | B | B | B | A | B | A |
| medway | B | B | B | A | A | B | B | B | A | B | A |
| melton | B | B | B | A | A | B | B | B | A | B | A |
| merton | B | B | B | A | A | A | B | B | A | B | A |
| mid-devon | B | B | B | A | A | B | B | B | A | B | A |
| mid-suffolk | B | B | B | A | A | B | B | B | A | B | A |
| mid-sussex | B | B | B | A | A | B | B | B | A | B | A |
| middlesbrough | B | B | B | A | A | A | B | A | A | B | A |
| milton-keynes | B | B | B | A | A | A | B | B | A | B | A |
| mole-valley | B | B | B | A | A | B | B | B | A | B | A |
| new-forest | B | B | B | A | A | B | B | B | A | B | A |
| newark-and-sherwood | B | B | B | A | A | B | B | B | A | B | A |
| newcastle-under-lyme | B | B | B | A | A | B | B | B | A | B | A |
| newcastle-upon-tyne | B | B | B | A | A | A | B | B | A | B | A |
| newham | B | B | B | A | A | A | A | B | A | B | A |
| north-devon | B | B | B | A | A | B | B | B | A | B | A |
| north-east-derbyshire | B | B | B | A | A | B | B | B | A | B | A |
| north-east-lincolnshire | B | B | B | A | A | B | B | B | A | B | A |
| north-hertfordshire | B | B | B | A | A | B | B | B | A | B | A |
| north-kesteven | B | B | B | A | A | B | B | B | A | B | A |
| north-lincolnshire | B | B | B | A | A | B | B | B | A | B | A |
| north-norfolk | B | B | B | A | A | B | B | B | A | B | A |
| north-northamptonshire | B | B | B | A | A | A | B | B | A | B | A |
| north-somerset | B | B | B | A | A | A | B | B | A | B | A |
| north-tyneside | B | B | B | A | A | A | B | A | A | B | A |
| north-warwickshire | B | B | B | A | A | B | B | B | A | B | A |
| north-west-leicestershire | B | B | B | A | A | B | B | B | A | B | A |
| north-yorkshire | B | B | B | A | A | A | B | A | A | B | A |
| northumberland | B | B | B | A | A | A | B | B | A | B | A |
| norwich | B | B | B | A | A | B | B | B | A | B | A |
| nottingham | B | B | B | A | A | B | B | B | A | B | A |
| nuneaton-and-bedworth | B | B | B | A | A | B | B | B | A | B | A |
| oadby-and-wigston | B | B | B | A | A | B | B | B | A | B | A |
| oldham | B | B | B | A | A | A | B | B | A | B | A |
| oxford | B | B | B | A | A | B | B | B | A | B | A |
| pendle | B | B | B | A | A | B | B | B | A | B | A |
| peterborough | B | B | B | A | A | B | B | B | A | B | A |
| plymouth | B | B | B | A | A | B | B | B | A | B | A |
| portsmouth | B | B | B | A | A | B | B | B | A | B | A |
| preston | B | B | B | A | A | B | B | B | A | B | A |
| reading | B | B | B | A | A | A | B | B | A | B | A |
| redbridge | B | B | B | A | A | A | B | B | A | B | A |
| redcar-and-cleveland | B | B | B | A | A | A | B | B | A | B | A |
| redditch | B | B | B | A | A | B | B | B | A | B | A |
| reigate-and-banstead | B | B | B | A | A | B | B | B | A | B | A |
| ribble-valley | B | B | B | A | A | B | B | B | A | B | A |
| richmond-upon-thames | B | B | B | A | A | A | B | B | A | B | A |
| rochdale | B | B | B | A | A | A | B | B | A | B | A |
| rochford | B | B | B | A | A | B | B | B | A | B | A |
| rossendale | B | B | B | A | A | B | B | B | A | B | A |
| rother | B | B | B | A | A | B | B | B | A | B | A |
| rotherham | B | B | B | A | A | A | B | B | A | B | A |
| rugby | B | B | B | A | A | B | B | B | A | B | A |
| runnymede | B | B | B | A | A | B | B | B | A | B | A |
| rushcliffe | B | B | B | A | A | B | B | B | A | B | A |
| rushmoor | B | B | B | A | A | B | B | B | A | B | A |
| rutland | B | B | B | A | A | B | B | B | A | B | A |
| salford | B | B | B | A | A | A | B | B | A | B | A |
| sandwell | B | B | B | A | A | A | B | B | A | B | A |
| sefton | B | B | B | A | A | A | B | B | A | B | A |
| sevenoaks | B | B | B | A | A | B | B | B | A | B | A |
| sheffield | A | B | B | A | A | A | A | B | A | B | A |
| shepway | B | B | B | A | A | B | B | B | A | B | A |
| shropshire | B | B | B | A | A | A | B | B | A | B | A |
| slough | B | B | B | A | A | A | B | B | A | B | A |
| solihull | B | B | B | A | A | A | B | B | A | B | A |
| somerset | B | B | B | A | A | A | B | A | A | B | A |
| south-cambridgeshire | B | B | B | A | A | B | B | B | A | B | A |
| south-derbyshire | B | B | B | A | A | B | B | B | A | B | A |
| south-gloucestershire | A | B | B | A | A | A | B | B | A | B | A |
| south-hams | B | B | B | A | A | B | B | B | A | B | A |
| south-holland | B | B | B | A | A | B | B | A | A | B | A |
| south-kesteven | B | B | B | A | A | B | B | B | A | B | A |
| south-norfolk | B | B | B | A | A | B | B | B | A | B | A |
| south-oxfordshire | B | B | B | A | A | B | B | B | A | B | A |
| south-ribble | B | B | B | A | A | B | B | B | A | B | A |
| south-staffordshire | B | B | B | A | A | B | B | B | A | B | A |
| south-tyneside | B | B | B | A | A | A | A | B | A | B | A |
| southampton | B | B | B | A | A | B | B | B | A | B | A |
| southend-on-sea | B | B | B | A | A | B | B | B | A | B | A |
| southwark | B | B | B | A | A | A | B | B | A | B | A |
| spelthorne | B | B | B | A | A | B | B | B | A | B | A |
| st-albans | B | B | B | A | A | B | B | B | A | B | A |
| st-helens | B | B | B | A | A | A | B | B | A | B | A |
| stafford | B | B | B | A | A | B | B | B | A | B | A |
| staffordshire-moorlands | B | B | B | A | A | B | B | A | A | B | A |
| stevenage | B | B | B | A | A | B | B | B | A | B | A |
| stockport | B | B | B | A | A | A | B | A | A | B | A |
| stockton-on-tees | B | B | B | A | A | A | B | A | A | B | A |
| stoke-on-trent | B | B | B | A | A | B | B | B | A | B | A |
| stratford-on-avon | B | B | B | A | A | B | B | B | A | B | A |
| stroud | B | B | B | A | A | B | B | B | A | B | A |
| sunderland | B | B | B | A | A | A | B | A | A | B | A |
| surrey-heath | B | B | B | A | A | B | B | B | A | B | A |
| sutton | B | B | B | A | A | A | B | B | A | B | A |
| swale | B | B | B | A | A | B | B | A | A | B | A |
| swindon | B | B | B | A | A | A | B | B | A | B | A |
| tameside | B | B | B | A | A | A | B | B | A | B | A |
| tamworth | B | B | B | A | A | B | B | B | A | B | A |
| tandridge | B | B | B | A | A | B | B | B | A | B | A |
| teignbridge | B | B | B | A | A | B | B | B | A | B | A |
| telford-and-wrekin | B | B | B | A | A | A | B | B | A | B | A |
| tendring | B | B | B | A | A | B | B | B | A | B | A |
| test-valley | B | B | B | A | A | B | B | B | A | B | A |
| tewkesbury | B | B | B | A | A | B | B | B | A | B | A |
| thanet | B | B | B | A | A | B | B | B | A | B | A |
| three-rivers | B | B | B | A | A | B | B | B | A | B | A |
| thurrock | B | B | B | A | A | B | B | B | A | B | A |
| tonbridge-and-malling | B | B | B | A | A | B | B | B | A | B | A |
| torbay | B | B | B | A | A | B | B | B | A | B | A |
| torridge | B | B | B | A | A | B | B | B | A | B | A |
| tower-hamlets | B | B | B | A | A | A | B | B | A | B | A |
| trafford | B | B | B | A | A | A | B | A | A | B | A |
| tunbridge-wells | B | B | B | A | A | B | B | A | A | B | A |
| uttlesford | B | B | B | A | A | B | B | B | A | B | A |
| vale-of-white-horse | B | B | B | A | A | B | B | B | A | B | A |
| wakefield | B | B | B | A | A | A | B | B | A | B | A |
| walsall | B | B | B | A | A | A | B | B | A | B | A |
| waltham-forest | B | B | B | A | A | A | B | B | A | B | A |
| wandsworth | B | B | B | A | A | A | B | B | A | B | A |
| warrington | B | B | B | A | A | A | B | B | A | B | A |
| warwick | A | B | B | A | A | B | B | B | A | B | A |
| watford | B | B | B | A | A | B | B | B | A | B | A |
| waverley | B | B | B | A | A | B | B | B | A | B | A |
| wealden | B | B | B | A | A | B | B | B | A | B | A |
| welwyn-hatfield | B | B | B | A | A | B | B | B | A | B | A |
| west-berkshire | B | B | B | A | A | B | B | A | A | B | A |
| west-devon | B | B | B | A | A | B | B | B | A | B | A |
| west-lancashire | B | B | B | A | A | B | B | B | A | B | A |
| west-lindsey | B | B | B | A | A | B | B | B | A | B | A |
| west-northamptonshire | B | B | B | A | A | A | B | B | A | B | A |
| west-oxfordshire | B | B | B | A | A | B | B | B | A | B | A |
| west-suffolk | B | B | B | A | A | B | B | B | A | B | A |
| westminster | B | B | B | A | A | A | B | B | A | B | A |
| westmorland-and-furness | B | B | B | A | A | A | B | A | A | B | A |
| wigan | B | B | B | A | A | A | B | B | A | B | A |
| wiltshire | B | B | B | A | A | A | B | B | A | B | A |
| winchester | B | B | B | A | A | B | B | B | A | B | A |
| windsor-and-maidenhead | B | B | B | A | A | A | B | B | A | B | A |
| wirral | B | B | B | A | A | A | B | B | A | B | A |
| woking | B | B | B | A | A | B | B | B | A | B | A |
| wokingham | B | B | B | A | A | A | B | B | A | B | A |
| wolverhampton | B | B | B | A | A | A | B | B | A | B | A |
| worcester | B | B | B | A | A | B | B | B | A | B | A |
| worthing | B | B | B | A | A | B | B | B | A | B | A |
| wychavon | B | B | B | A | A | B | B | A | A | B | A |
| wyre | B | B | B | A | A | B | B | B | A | B | A |
| wyre-forest | B | B | B | A | A | B | B | B | A | B | A |
| york | B | B | B | A | A | A | B | B | A | B | A |
