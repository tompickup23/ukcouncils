# B2: front door content | source notes

Written 9 November 2026 in Claude Code, as preparation for the Codex build in `docs/B2-FRONT-DOOR-BRIEF.md`. Every count and anchor below was read from the files named, at the commits named, on 9 November 2026. Nothing here is an estimate. Where a source fails the site's rules it is held, and the reason is given.

The question each council page must answer once the council tax content canonicalises to UK Council Tax after the 2027 bill season: what is this council, who runs it, when are its elections, how many people does it serve, how well does it collect council tax, is it in financial support.

## Summary

| Question | Source | Verdict | Pages covered (of 296) |
|---|---|---|---|
| What is it | UK Places register, already in `data/registry/councils.json`; MHCLG class from the council tax table | Use (already on the page) | 296 |
| How many people | ONS mid-2025 population estimates, MYE25UK, pinned by hash | Use | 294; Barnsley and Sheffield held |
| How well it collects | MHCLG QRC4 2025/26, Table 9a, pinned by hash | Use | 296 |
| Is it in financial support | GOV.UK EFS pages, already in `data/efs/statements.json` | Use (B1 builds the section) | 51 |
| When are its elections | UK Elections council election register, verified records only, year stated in the quoted text | Use, in part | 174 |
| The council's own pages | GOV.UK Local Links Manager export via UK Places | Use (two service links, not a homepage) | 258 with at least one link |
| Who runs it (seats by party, control) | UK Elections composition and seat files | **Held** | 0 |
| The council's homepage | none dated | **Held** | 0 |
| Last election date | UK Elections cycles file | **Held** | 0 |

## 1. Population: ONS mid-2025

| | |
|---|---|
| Publisher | Office for National Statistics |
| Release | Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025 (MYE25UK) |
| Dataset page | https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland |
| File | `mye25tablesuk.xlsx`, https://www.ons.gov.uk/file?uri=/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/populationestimatesforukenglandandwalesscotlandandnorthernireland/mid2025/mye25tablesuk.xlsx |
| Size and sha256 | 1,026,940 bytes; `8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f` (rehashed on 9 November 2026 from `~/wt/uct-per-resident/data/raw/`) |
| Published | 1 October 2026 (the cover sheet: "originally published at 9.30am 1 October 2026") |
| Sheet and column | `MYE2 - Persons`, column `All ages` |
| Licence | Open Government Licence v3.0 |

The pattern to reuse is `~/wt/uct-per-resident/scripts/import-population.mjs` (ukcounciltax branch `feat/per-resident-i124`, commit `f427d7a`, not yet merged). It fetches once, checks the pinned hash, reads the sheet by its text headers, refuses a duplicate code, checks that single years sum to `All ages`, checks 333 English rows by geography (1 country, 9 regions, 63 unitary, 6 metropolitan county, 36 metropolitan district, 21 county, 164 non metropolitan district, 33 London borough) and checks anchors. UK Councils needs only `All ages`.

Anchors (`All ages`, mid-2025):

| Area | Code | Residents |
|---|---|---|
| Burnley | E07000117 | 100,946 |
| Birmingham | E08000025 | 1,176,960 |
| Lancashire (county) | E10000017 | 1,308,567 |
| City of London | E09000001 | 15,631 |
| Isles of Scilly | E06000053 | 2,299 |

Coverage: 294 of the 296 council pages join by exact GSS code. All 164 shire districts have a `parentGss` whose county row is in the file (21 counties), and the county names in the council tax file and the ONS file agree for all 21.

**Barnsley and Sheffield are held.** Their pages carry E08000038 and E08000039, the codes in the 2026/27 council tax tables. ONS MYE25UK still uses E08000016 and E08000019. The ONS Code History Database (June 2026, as UK Places records it in `src/data/registry/gss-predecessors.json`) gives the change as The Barnsley and Sheffield (Boundary Change) Order 2024 (SI 1328/2024), in force 1 April 2025. A new code means a changed boundary, so the mid-2025 count is for a different area from the council the page describes. No population is printed for either, and there is no name based join. This is the same decision `docs/PER-RESIDENT-SOURCE-NOTES.md` took on ukcounciltax.

Source line: "Source: Office for National Statistics, Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025, MYE2 Persons, all ages, published 1 October 2026."

## 2. Collection: MHCLG QRC4 2025/26, Table 9a

| | |
|---|---|
| Publisher | Ministry of Housing, Communities and Local Government |
| Title | Collection rates for Council Tax and non-domestic rates in England, 2025 to 2026 |
| Page | https://www.gov.uk/government/statistics/collection-rates-for-council-tax-and-non-domestic-rates-in-england-2025-to-2026 |
| File | `Table_9_2025-26.ods`, https://assets.publishing.service.gov.uk/media/6a6b302bbf4a7aca8f8976fe/Table_9_2025-26.ods |
| sha256 | `3937351a67bd12418301f97f504a5357566ecf3b6d375076119f1addb44d3d90` |
| Edition | first published 24 June 2026, revised 31 July 2026 to add Kensington & Chelsea and correct some arrears figures |
| Table | Table 9a: Council tax, total receipts and arrears information, England, 2025-26; and the Notes sheet |
| Licence | Open Government Licence v3.0 |

The importer to copy is `~/ukcounciltax/scripts/import-collection-rates.mjs` (last changed in ukcounciltax `636fed0`, on `main`). Its helper `scripts/lib/ods.mjs` is already in UK Councils and is byte identical to ukcounciltax's copy (checked with `diff` on 9 November 2026). The importer reads each column by its full printed header, keeps cells as displayed (whole thousands of pounds; the rate to 2 decimal places), keeps a bracketed code as null and checks seven printed anchors. Its output on ukcounciltax `main`, `data/national/collection-rates.json`, has sha256 `cecd26a16eb2123693596f4e34c7d10f1174d16f566771915043264b09def3a3`; a faithful copy of the importer run in UK Councils must write a byte identical file.

Coverage: 296 of 296, keyed by the same codes as the council tax table (Barnsley E08000038, Sheffield E08000039), so no boundary question arises. No council has a null in-year rate.

Anchors (Table 9a lines 5, 1, 4 and 24; amounts in £ thousand):

| Council | Rate | Collectable | Collected | Total arrears |
|---|---|---|---|---|
| Burnley | 94.09 | 60,689 | 57,102 | 15,841 |
| Birmingham | 90.04 | 629,022 | 566,351 | 272,682 |
| England | 95.60 | 44,981,384 | 43,002,543 | 7,423,938 |

The rate is MHCLG's own calculation (line 4 over line 1), printed to 2 decimal places. Print it as printed, `94.09%`, never re-rounded. Blackpool's printed `90.00` stays `90.00%`.

Source line: as ukcounciltax's `collectionSource()` builds it from the source block.

## 3. Exceptional Financial Support

Already in UK Councils as `data/efs/statements.json` (GOV.UK pages per year, each with a body hash). B1 item 3 builds the per council section. Counts on 9 November 2026: 57 authorities with a statement; **51** of them map to a council page, by `slug` and by `gss` alike. The other six are Copeland (abolished), three county councils (Norfolk, Worcestershire, East Sussex), South Yorkshire Mayoral Combined Authority and Kent Police and Crime Commissioner. **The B1 brief and the 9 November assessment both say 54; the data says 51.** B1's unit test reads the count from the data, so it will pass on 51, but B1's dry run line is wrong. Burnley has no statement; Birmingham has one.

B2 adds nothing to the EFS data. It places B1's section in the new order and mentions it in the elections and collection block only by link, never by figure.

## 4. Elections: UK Elections council election register

File: `~/ukelections/data/identity/council-next-elections.json`, last changed in ukelections `3cf7cf6` (24 October 2026), identical on `origin/main` at `4c48f42`. sha256 `e24e7ed63284de8577e2f11d0991af8b1402e6d93ca1b5a20a0756d703d4e27f`. The repository is public. File level `checked_at`: 2026-10-24.

Its `method`: each record's year was read from the council's electoral change order on legislation.gov.uk, another statutory instrument, or the council's own election pages, quoted verbatim; unverified records carry no year. Each verified record has `source_label`, `source_url` and a verbatim `quote`. That is citable: the primary document is named and linked, the words relied on are held, and the date checked is recorded. The `notes` field is working commentary ("STORED VALUE WRONG", references to reorganisation) and is never printed.

Join: by exact GSS (`lad24cd`) for 294 pages. Barnsley and Sheffield join through the ONS predecessor code (E08000038 to E08000016, E08000039 to E08000019, from the Code History Database as UK Places records it). The council is the same body after the 2025 boundary change, so its election timetable carries across, which is not true of a population count.

Coverage of the 296 pages: 220 verified, 65 unverified, 11 abolished, 0 absent. The register also holds verified records for seven county councils (East Sussex, Essex, Gloucestershire, Hampshire, Norfolk, Suffolk, West Sussex) with a null code; none for Lancashire. No county has a page, and using them on district pages would need a name join, so they are not used.

Quotes checked on 9 November 2026: none of the 174 printable quotes contains an em dash, en dash, spaced hyphen or motive word, or a person's name (four contain the words "councillors", "Councillor" or "Elected Mayor" as offices, with no name). Five quotes mention reorganisation (Test Valley, Oxford, Babergh, Mid Suffolk, Worthing); the brief prints their year and source line without the quote.

**Only 174 are printed.** In 46 verified records the year is not in the quoted text: the quote states a cycle ("in 1974 and every fourth year thereafter", "on 7 May 2026, and every fourth year afterwards") and UK Elections worked the year out from it. That is a reading of a rule, not a printed year, and an order can postpone an election. Those 46 are held for Tom's decision (brief, "Decisions for Tom"). They include all 32 London boroughs other than the City of London, Liverpool, Swindon, County Durham and Rossendale. The 174 whose quote contains the year:

| Next year | Pages |
|---|---|
| 2027 | 152 |
| 2028 | 8 |
| 2029 | 11 |
| 2030 | 2 |
| March 2029 (City of London, `date_label`) | 1 |

Patterns among the 174: whole 113, thirds 57, halves 4.

The 11 abolished records are the Surrey districts (Surrey (Structural Changes) Order 2026, SI 2026/264). Printing "abolished on 1 April 2027" is reorganisation content. UK Councils holds its reorganisation field (see "Held data" in `CLAUDE.md` and `tests/reorganisation-held.test.ts`), and although Surrey's order is made law, a council page that states abolition for Surrey and nothing for Lancashire needs a deliberate decision. Held for Tom.

Anchors:

| Council | Status | Year | Pattern | Printed |
|---|---|---|---|---|
| Burnley | verified | 2027 | thirds | yes |
| Birmingham | verified | 2030 | whole | yes ("Thursday 2 May 2030" in the quote) |
| Barnsley | verified, via E08000016 | 2027 | thirds | yes |
| Sheffield | unverified, via E08000019 | none | thirds | no |
| City of London | verified | March 2029 | whole | yes, as "March 2029" |
| Isles of Scilly | verified | 2029 | whole | yes |
| Westminster | verified | 2030 | whole | no (cycle reading) |

Source line, for a page whose record is printed: "Source: [source_label], linked to source_url, quoted in the UK Elections council election register, checked 24 October 2026." The link text is the primary document; UK Elections is named as the compiler.

**Last election date: held.** The only file holding it, `council-cycles.json`, covers the 154 councils of the May 2026 ballot, assumes the first Thursday in May, and says in its own metadata "Hand-audit before quoting publicly".

## 5. Who runs it: held

- `data/features/council-composition-history.json` (OpenCouncilData, "UK council seat composition 1973-2025"): the snapshot carries no URL, file date or hash; the CSVs it was built from sit in an uncommitted `.cache/` directory. Its latest year is 2025 for 370 of 575 councils, so it predates the 7 May 2026 elections and is out of date for every council that voted then (Burnley, Birmingham, Barnsley and Sheffield among them). Its `majority` field holds coalition descriptions such as "IND/GRN/LD", not a published control statement.
- `data/results/may-2026/council-control.json` is built by `scripts/build-council-control.mjs`, which for thirds and halves councils "approximates" the seats held over by scaling the 2025 snapshot. That is an estimate. Never usable.
- `data/identity/council-seat-counts.json` holds chamber size only, reconciled across OpenCouncilData, an AI DOGE roster and May 2026 ballots (`resolved_by`: 58 corroborated, 38 single source, 7 roster off by one, and so on). Birmingham's May 2026 declarations cover 60 of 101 seats. It is a reconciliation, not a published table.

No file holds current seats by party for every council from a document with a publisher, date and hash. The seats bar is specified in the brief so it can be built the day a source exists; B2 ships without it. A route to a source is Tom's call: a pinned, dated and hashed copy of Open Council Data's current composition table (a third party compilation, CC BY-SA) or each council's own published composition page. Both need a decision on whether a non official compilation meets the standard for this site.

## 6. The council's own pages

`~/ukplaces/src/data/local-links.json` on `origin/main` (last changed `b1a3262`, 6 October 2026; sha256 of the file `5c9e6a32e96fa0307ed077711ffb357922fa0c56052d368365ae68e488e181f9`). Source: GOV.UK Local Links Manager daily export, https://local-links-manager.publishing.service.gov.uk/data/links_to_services_provided_by_local_authorities.csv, export date 5 October 2026, Open Government Licence v3.0. UK Places keeps a link only when the export has exactly one URL for the service and its own check on 5 October 2026 reached it (HTTP 200 after redirects, not a home page). Two services: "Pay your Council Tax" (LGSL 57) and "Find out your rubbish collection day" (LGSL 524).

Coverage: council tax link on 254 pages, bin collection link on 207, at least one on 258, every page has an entry. Barnsley and Sheffield are listed through the previous code, and the file says so in its `notes`.

**No homepage.** Neither the UK Places register (`places.json` has no website field) nor the Local Links export as UK Places holds it carries a council homepage URL with a date. B1 item 4 also found no website field in `data/registry/councils.json`. The homepage is held; the two service links stand in for "the council's own site" and are labelled for what they are.

## 7. What is it, and a defect found on the way

The type sentence already on every page (`typeLine` in `src/pages/councils/[slug].astro`) is built from the MHCLG class in the council tax table and, for a shire district, the county in that table. B2 keeps it.

`officialName` in `data/registry/councils.json`, which the page prints as "Name in the register", is wrong for at least three councils: "Birmingham Council" (Birmingham City Council), "Barnsley" (Barnsley Metropolitan Borough Council) and "Isles of Scilly Council" (Council of the Isles of Scilly). It comes from the UK Places spine. B2 builds no new sentence on `officialName`; every new sentence uses the council tax table's `name`. The registry needs a refresh from UK Places, which is already owed for the reorganisation field. Not fixed here.

## 8. Band D position within class

The council tax table already in the repo, `data/council-tax/england-2026-27.json` (MHCLG, Council Tax levels set by local authorities in England 2026 to 2027, Table 9 area Band D including parish precepts, published 25 March 2026). Every one of the 296 has a Band D. Classes: SD 164, UA 63, MD 36, OLB 20, ILB 13 (the City of London is in ILB). `CLAUDE.md` permits sorting within class with the class labelled, because every body has the same complete official year. No ties at either end of any anchor class.

| Council | Class | Band D | Lowest in class | Highest in class |
|---|---|---|---|---|
| Burnley | SD (164) | £2,549.42 | Basingstoke and Deane £2,255.21 | Lewes £2,756.17 |
| Birmingham | MD (36) | £2,362.90 | Dudley £2,144.84 | Gateshead £2,715.81 |
| City of London | ILB (13) | £1,329.56 | Wandsworth £1,028.21 | Lewisham £2,237.33 |
| Isles of Scilly | UA (63) | £2,047.96 | Windsor and Maidenhead £1,952.62 | Dorset £2,765.02 |

The same classes for the collection rate (all 296 have a rate):

| Council | Class | Rate | Lowest in class | Highest in class |
|---|---|---|---|---|
| Burnley | SD | 94.09% | Preston 90.67% | Ribble Valley 99.63% |
| Birmingham | MD | 90.04% | Liverpool 86.85% | Stockport 97.25% |
| City of London | ILB | 98.09% | Kensington and Chelsea 91.16% | City of London 98.09% |
| Isles of Scilly | UA | 95.25% | Blackpool 90.00% | Wokingham 98.90% |

The findings page says councils are not ranked. The strips show position without an ordinal; no "35th highest" is printed anywhere, and the table behind each strip is in name order.

## 9. Reproducing these figures

`/private/tmp/claude-501/-Users-tompickup--claude-spares-spare-JIbBjX/ce3be0ee-8dbe-4e0b-93fa-106a7122b52c/scratchpad/b2-dry-run.mjs` reads every file above (through `git show` at the commits named for the three sister repositories) and prints each count and anchor. It is a scratch file and is not committed; the brief restates every assertion it checked.
