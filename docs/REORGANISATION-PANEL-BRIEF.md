# B4: UK Councils reorganisation panel | Codex brief

Written 9 November 2026 in Claude Code. Worktree `~/wt/ukc-reorg`, branch `feat/reorganisation-panel`, cut from `origin/main` at `151dc0f` (PR 35). Read `CLAUDE.md`, then `docs/REORGANISATION-SOURCE-NOTES.md`, which holds every source, hash, quotation and count this brief relies on. The raw documents are in `docs/reorganisation-sources/raw/` with `SHA256SUMS`. Every count below was dry run against those files and the registry on 9 November 2026, so a mismatch is a fault in the build or a change at MHCLG, not in the brief.

**Start only after C3 has merged** (decision 8: "Yes, after C3"). Then `git fetch && git rebase origin/main` on this branch, and confirm the council page section order still matches B2 decision 1, before item 2.

Item 1 is three separate PRs in three repositories and may run before C3. Items 2 to 8 are one PR on this branch, one commit per item, in the order below.

## Goal

On each of the 184 council pages in MHCLG's local government reorganisation programme, a neutral panel answers: is this council in the programme, what was proposed, what has the government decided or said it is minded to decide, is there a representation window, is there a structural changes order, and when do new councils start. Every line comes from an MHCLG or legislation.gov.uk document, dated, with its source line under it. It replaces the held registry field, which stays unread.

## Rules that bind every item

- British English. No em dash, en dash or spaced hyphen as a dash anywhere: text, comments, JSON, commit messages. Where a source quotation contains a dash, cut the quotation at that point; never reword inside quotation marks.
- **No figures except dates, statutory instrument numbers, article numbers and counts of councils or proposals.** No cost, saving, funding, population, council tax, model or scenario figure in the panel, its map, its alt text or its JSON. The minded to letters print populations and transition funding; none of it is copied.
- Name no individual. Cite letters by title and date, never by signatory or office holder.
- A rule and a date, never a motive. No "scrapped", "cancelled", "U-turn", "delay", "chaos", "blow". MHCLG's own verbs only: proposed, minded to implement, withdrawn, under review, abolished, wound up and dissolved, established.
- Unknown is not zero and is never computed. A representation window without published dates prints "Not yet dated by MHCLG" and the minimum the letter states. Never add three weeks to anything.
- No inline script and no client JavaScript. The rail and the map are static HTML and SVG rendered at build time. No hex literal in `src/`.
- Data reads resolve from `process.cwd()`. The importer runs by hand, is committed with its output, and is never called by the build.
- Joins by exact GSS code only. Display names come from the council tax table (`tax.name`), never from the registry's `name` or `officialName` (source notes 8: "Shepway" is E07000112's registry name).
- The registry's `reorganisation` field is never read, by anything (the existing test stays).
- Stage named paths only. Never `git add -A` or `git add .`. Do not merge or deploy. Do not build in this worktree before C3 is rebased in.
- Stop and report only on the conditions in the last section. Any other question gets the most conservative choice (print less, never derive) and a line under "Decisions taken" in the PR body.

## Decisions already taken (do not reopen)

1. **21 areas** (source notes 1), **184 pages** (source notes 9). County councils get no page and no panel; the area's county council is named in the panel as text, not linked.
2. **Surrey** is carried by this panel (decision 3), in future tense until 1 April 2027 (source notes 3, "Effective wording").
3. **Lancashire, Blackburn with Darwen and Blackpool** (14 pages): dated documents only (source notes 6). The county council's protective claim is treated as live. The panel for these pages is the heading, the area name, the councils list, and the dated document list. No status sentence, no proposal list, no quotation, no mention of the claim.
4. **West Berkshire** gets the Oxfordshire panel, because the Oxfordshire minded to letter (S8) brings it in by name. Its councils list says so from S8, page 1.
5. **Isle of Wight** gets the Hampshire panel with MHCLG's own sentence from S2 Hampshire: "No changes have been proposed for the Isle of Wight, an existing unitary council." Quoted, with its source.
6. **No ranking, no comparison between areas,** no count of how many areas are "ahead".
7. **The UK Councils `/councils/<slug>/` URL does not change** for E07000112 (`/councils/shepway/`) or anything else in this work.

## Item 1: registry name refresh (decision 4), three PRs

Dry run result (source notes 8): refreshing from UK Places **as published on 5 November 2026 changes no name**: 0 changes to `slug`, `name` or `officialName`, 97 changes to `county`, 0 to `reorganisation`. The wrong names (E08000025 "Birmingham Council", E08000038 "Barnsley", E06000053 "Isles of Scilly Council", E07000112 "Shepway" and its `officialName` "Folkestone & Hythe Council") are wrong in UK Places too. So the refresh starts in UK Places.

**1a. UK Places (`~/ukplaces`, its own branch from `origin/main`, its own PR).** D1 is decided: GOV.UK Local Links Manager (Tom, 9 November 2026).
- `name` for E07000112 becomes "Folkestone and Hythe", from ONS `LAD26NM` (Local Authority Districts (May 2026) Boundaries UK BSC). Do not change any slug.
- `officialName` from the `Authority Name` column of GOV.UK Local Links Manager's export, `https://local-links-manager.publishing.service.gov.uk/data/links_to_services_provided_by_local_authorities.csv` (Open Government Licence v3.0), joined on its `GSS` column by exact code. UK Places already fetches this file in `scripts/build-local-links.mjs`; reuse that fetch. Pin the edition: record `last-modified`, retrieval date and SHA-256 in the registry's source block, and fail the build if a code yields two different names. The value is copied as GOV.UK prints it, with no tidying (it says "Middlesbrough Borough Council", "Hull City Council" and "Borough Council of Kings Lynn and West Norfolk"; those stand).
- The export lacks 8 current codes: E08000038 Barnsley, E08000039 Sheffield, E06000065 North Yorkshire, E06000066 Somerset, S12000047 Fife, S12000048 Perth and Kinross, S12000049 Glasgow City, S12000050 North Lanarkshire. It holds them only under predecessor codes (E08000016, E08000019, E10000023, E10000027, S12000015, S12000024, S12000046, S12000044). For these 8 only, join through the predecessor code using UK Places' own `src/data/registry/gss-predecessors.json`, record `officialNameVia: "<old code>"` on the record, and list each in the PR body. Barnsley and Sheffield changed boundary in 2025 (SI 2024/1328), but the council is the same body, so the name carries; checked 9 November 2026, the predecessor file maps 6 of the 8 (Barnsley, Sheffield and the four Scottish codes) and does not map E06000065 North Yorkshire or E06000066 Somerset, whose predecessors are county council codes: those 2 keep their existing value and are listed. No other code joins through a predecessor.
- Ignore export rows whose code is not one of UK Places' 361 places or 21 county councils (it still lists Christchurch and Poole). The 21 county councils' names in `county-councils.json` may take the export's name too, in the same way, listed separately.
- Leave `reorganisation` exactly as it is (the hold is separate, decision 4). Leave `county` as PR 39 set it.
- PR body: every changed `name` and `officialName` with old value, new value and source row. Expected by the dry run of 9 November 2026 (`docs/reorganisation-sources/registry-names-comparison.tsv` in ukcouncils): 284 `officialName` changes among the 353 codes the export holds directly, plus up to 6 through predecessors. A different count is not a stop if every difference is explained by a newer export edition; list them.

**1b. ukcouncils (branch `data/registry-refresh-<date>` from `origin/main`, its own PR).** After 1a is merged and UK Places has deployed.
- Run `node scripts/build-registry.mjs`. Commit only `data/registry/councils.json`.
- Diff field by field against the previous file for `slug, name, officialName, type, country, region, county, parentGss, reorganisation` (the comparison that produced `docs/reorganisation-sources/registry-refresh-dry-run.tsv`; write it as a one off check, not committed). Expected: the 97 `county` changes listed in `docs/reorganisation-sources/registry-refresh-dry-run.tsv`, plus exactly the 1a name changes, plus any sister link changes from live sitemaps, each listed in the PR body. Anything else: stop.
- `ProfileAbout` prints `county` and "Name in the register": list the pages whose printed text changes (97 county rows: 64 gain a County row, 33 London rows change text; plus every `officialName` change). B2 decision 9 stays: new sentences use `tax.name`.
- `tests/registry.test.ts` and `tests/reorganisation-held.test.ts` pass unchanged (361 councils; the 14 `reorganisation` objects still present and unread).

**1c. ukcounciltax (`~/ukcounciltax`, branch from `origin/main`, its own PR).** After 1b merges.
- The file there is byte identical to ukcouncils' today. `scripts/sync-registry.mjs` nulls every UK Food Hygiene sister link; UK Food Hygiene has been a live network site since 6 October 2026 and the committed file carries 356 of its links. Change the script to copy the reviewed export unchanged (keep the 361 and identity checks; drop the UK Food Hygiene nulling and the `counts.ukfoodhygiene = 0` line), then run it with ukcouncils' merged `data/registry/councils.json` as the argument. The result must be byte identical to ukcouncils' file; check with `cmp`.
- ukcounciltax prints `officialName` in JSON-LD (`src/pages/councils/[slug].astro`, `about.name`) and in the finder's `data-name`: list the changed pages in the PR body. `tests/registry.test.ts` line 62 (no UK Food Hygiene link renders) still passes, because rendering is gated elsewhere; if it fails, stop.
- ukcounciltax has no reorganisation hold test. Add one (copy of ukcouncils' `tests/reorganisation-held.test.ts` as it is before item 6, adjusted for paths and the 361 count), in the same PR.

Item 1 may run before C3 and before the panel. The panel does not depend on it: the GSS join is identical before and after (source notes 9).

## Item 2: `data/reorganisation/` and its importer

Write `scripts/import-reorganisation.mjs`. It reads only `docs/reorganisation-sources/raw/`, checks every file against `SHA256SUMS` first (any mismatch: exit non zero), and writes:

**`data/reorganisation/sources.json`**: the source register, one object per id S1 to S18 of the source notes (S19 is a registry input, not a panel source):

```json
{"id": "S4", "publisher": "Ministry of Housing, Communities and Local Government", "title": "Local government reorganisation: withdrawn letter to 9 areas", "parent": "Local government reorganisation: review update letters to council leaders", "date": "2026-10-29", "url": "https://assets.publishing.service.gov.uk/media/6ae36c6ed22fc5fecb3eb7f9/Local_government_reorganisation_-_withdrawn_letter_to_9_areas.pdf", "parentUrl": "https://www.gov.uk/government/publications/local-government-reorganisation-review-update-letters-to-council-leaders", "file": "raw/mhclg/Local_government_reorganisation_-_withdrawn_letter_to_9_areas.pdf", "sha256": "58f686f6cb85eeaf3dc678f0e00c92cf74c01ac2bec6f1b00473a621bd3f2656", "pages": 3, "retrieved": "2026-11-09"}
```

Titles are copied from the Content API `title` or the attachment `title` exactly, except that a dash in a title is the one place a dash may survive in a source: none of S1 to S18 has one in its title (the PDF file names contain `_-_`, which is not prose and stays in `url` and `file` only). S17 and S18 have publisher "Lancashire County Council"; they are recorded for the Lancashire status check, and no panel line cites them.

**`data/reorganisation/areas.json`**: `checked` (`"2026-11-09"`), `programmeSource` (`"S1"`), and `areas`, 21 objects in the order of source notes 1:

| Field | Content |
|---|---|
| `id` | the collection slug, for example `"lancashire-blackburn-with-darwen-and-blackpool"` |
| `name` | MHCLG's area name from S2 `title` before ": Local government reorganisation" |
| `collection` | S2 URL |
| `status` | one of `"order"`, `"minded-to"`, `"withdrawn-2026-10"`, `"withdrawn-2026-09"`, `"undecided"` |
| `documentsOnly` | `true` for Lancashire only |
| `councils` | array of `{gss, role}` with `role` `"county"`, `"district"` or `"unitary"`, from the invitation letter's "To:" block joined as in source notes 2 (three hand matches listed there), plus `{gss: "E06000037", role: "unitary", via: "S8"}` for Oxfordshire |
| `proposals` | array of `{by: [council names as MHCLG prints them], councils: <number of unitary councils proposed>, split: <true if MHCLG says "This includes a request to split existing district council areas">, submitted: <ISO date>, source: "S15:<slug>"}`, parsed from the consultation page body; empty for Lancashire |
| `mindedTo` | for the five: `{date: "2026-10-29", quote, newCouncils: [names], source: "S6", page: 1}`; else null |
| `window` | for the five: `{opens: null, closes: null, minimum: "three weeks", quote, source, page}`; Oxfordshire: `{opens: null, closes: null, minimum: "three weeks", quote: <S11 sentence>, source: "S11"}`; else null |
| `order` | Surrey: `{si: "2026/264", title: "The Surrey (Structural Changes) Order 2026", made: "2026-03-09", inForce: "2026-03-10", abolition: "2027-04-01", source: "S12", articles: {...}}`; else null |
| `vesting` | Surrey: `{date: "2027-04-01", basis: "order", source: "S12", article: "3"}`; the other 20: `{date: "2029-04-01", basis: "timetable", source: "S4" or "S5", page}` (S4 page 3 for the nine, S5 page 2 for the six, S6 to S10 page 1 for the five, which say "April 2029" without a day: use `month: "2029-04"` and no `date` for those five) |
| `timeline` | dated entries `{date, kind, label, source, page?}` where `kind` is one of `invitation`, `proposals`, `consultation`, `decision`, `withdrawn`, `minded-to`, `order`, `vesting`; `label` is the document title (for Lancashire, only titles) |
| `quotes` | every quotation the panel prints, `{text, source, page}`; `text` dash free |

Surrey's `order.articles` holds the four quotations of source notes 3 (articles 1(2), 3, 4(5), 5(5)) and the two district lists from article 2, each with its PDF page.

**`docs/reorganisation-sources/text/`**: the importer writes each cited PDF page as `<file stem>.p<N>.txt` (`pdftotext -f N -l N`, whitespace collapsed) and each cited Content API body as `<slug>.txt` (HTML to text as in source notes 10). These are committed; `docs/` is outside the house style test because they are verbatim sources. The build never reads them; the tests do.

Counts the importer asserts before writing (exit non zero otherwise): 21 areas; 204 invited councils (21 county, 183 district or unitary) plus 1 via S8; status counts `order` 1, `minded-to` 5, `withdrawn-2026-10` 9, `withdrawn-2026-09` 4, `undecided` 2; proposals per area exactly as the table in source notes 5 and section 5's paragraph on the five (Cambridgeshire and Peterborough 4, Derbyshire and Derby 5, Devon 5, East Sussex and Brighton and Hove 2, Essex 4, Gloucestershire 3, Hampshire 4, Hertfordshire 3, Kent 5, Lancashire 0 recorded, Leicestershire 3, Lincolnshire 4, Norfolk 3, Nottinghamshire 3, Oxfordshire 3, Staffordshire 5, Suffolk 2, Surrey 2, Warwickshire 2, West Sussex 2, Worcestershire 2); no GSS in two areas; every district's registry `parentGss` equals its area's county code.

## Item 3: `src/lib/reorganisation.ts`

Loads `data/reorganisation/areas.json` and `sources.json`; exports `reorganisationFor(gss): {area, council, sources} | null`. Validates at load (throw, failing the build): every `source` id exists; every quote is dash free; no field outside `order.si`, dates, `page`, `article` and `councils` (the number of proposed councils) holds a digit sequence of 3 or more digits other than a four digit year from 2024 to 2029 and `264`; no `£`, `%` or the words "population", "saving", "cost" or "funding" in any `quote` or `label`.

## Item 4: the panel component

`src/components/ReorganisationPanel.astro`, rendered on `/councils/<slug>/` when `reorganisationFor(gss)` is not null, as `<section class="section" id="reorganisation" aria-labelledby="reorganisation-heading" data-reorganisation-panel={area.id} data-reorganisation-status={area.status}>`. Placement: after "Elections in X" (B2) and before spending; add it to `PageContents` in the same position, omitted when absent.

Contents, in order. Every element that states something carries `data-claim` and `data-source="S<n>"` (or `"S15:<slug>"`), and a `.source-line` follows each claim group before the next claim group, printed as B2 prints source lines: publisher, title linked to `url`, date in words, and "page N" for PDFs.

1. **Heading**: "Local government reorganisation in {area.name}".
2. **Status sentence** (not for `documentsOnly`). Fixed templates, nothing else:
   - `order`: "Under the Surrey (Structural Changes) Order 2026 (SI 2026/264), on 1 April 2027 the district of {tax.name} is abolished as a local government area and {council name as in the order} is wound up and dissolved. {East|West} Surrey Council becomes the council for the area." Source S12, articles 4(5) and 4(2), or 5(5) and 5(2). The council name is the order's (for example "Elmbridge Borough Council" from article 2's list of "the East Surrey councils"), never the registry's.
   - `minded-to`: "On 29 October 2026 the government said it is minded to implement " + the letter's own words after "minded to implement " up to the full stop, quoted. Source S6 to S10, page 1. Then: "This is not a final decision. The letter says it does not itself establish any new council or alter any boundary." Source, the "Statutory process" page listed in source notes 4.
   - `withdrawn-2026-10`: "On 29 October 2026 the government withdrew the decision it announced for {area.name} in July 2026. All options and proposals remain under consideration." Source S4, page 2.
   - `withdrawn-2026-09`: "On 7 September 2026 the government withdrew the decision it announced for {area.name} in March 2026. The area is in the review the government began that day." Source S1 ("7 September 2026") and S5, page 2.
   - `undecided`: "The government has not decided on the proposals for {area.name}. The area is in the review the government began on 7 September 2026." Source S5, page 2.
   - Isle of Wight adds the S2 Hampshire sentence (decision 5). West Berkshire adds: "West Berkshire was not part of the original invitation. The Oxfordshire minded to letter includes it in the proposed Ridgeway council." with S8, pages 1 and 3.
3. **Dated status rail**: an `<ol class="reorg-rail">` of five steps, each `<li data-step="proposals|minded-to|window|order|vesting" data-state="done|current|future|none">` with a date (`<time datetime>`) or the words "Not yet dated by MHCLG", a label and its source line. Labels are fixed: "Proposals submitted", "Minded to decision", "Representation window", "Structural changes order", "New councils start". State rules: proposals is `done` with the submission date for every area; minded to is `done` for the five, `none` elsewhere ("No minded to decision") except Surrey, whose step reads "Decision" with 28 October 2025 from S1; window: for the five `current` with "Not yet dated by MHCLG. The letter says a minimum of three weeks."; for Surrey `none`; elsewhere `future` with no text beyond the label; order: Surrey `done` with "Made 9 March 2026"; elsewhere `future` with "None made by 9 November 2026", sourced to a register entry `L1` in `sources.json`: publisher "legislation.gov.uk", title "UK Statutory Instruments and UK Draft Statutory Instruments, 2025 and 2026, titles containing Structural Changes", URLs `https://www.legislation.gov.uk/uksi/2026/data.feed?title=structural%20changes` and the `ukdsi` and 2025 equivalents, retrieved 2026-11-09, result as in source notes 3 (the only order is SI 2026/264). The five minded to pages add, from their letter's "Statutory process" page, that any change "would need to be provided for in a structural changes order"; vesting: Surrey "1 April 2027" (`basis` order); the five "April 2029, the date the government gives for new councils" from the letter page 1; the fifteen "1 April 2029, the government's stated timetable" from S4 page 3 or S5 page 2. Never "will" for a timetable date: "the government's stated timetable". Under the rail: "Checked against MHCLG and legislation.gov.uk on 9 November 2026." from `areas.json` `checked`.
   CSS only: a vertical rail at 375px, horizontal from 48rem; tokens `--accent`, `--border-strong`, `--text-muted`; `data-state` styles only colour and the marker shape, and each state also has its words, so nothing depends on colour.
4. **Proposals** (not for `documentsOnly`; for Surrey only the two proposals with "The order implements the proposal made by Surrey County Council, Elmbridge Borough Council and Mole Valley District Council." from S12 page 1): a list, one item per proposal, "{by, joined with commas and "and"} proposed {n} unitary council(s)", plus " with a request to split existing district areas" where `split`. Source line: the consultation page title and date. No assessment, no "preferred", no order of merit; list in MHCLG's order.
5. **Councils in this area**: the area's councils, each linked to `/councils/<slug>/` with its `tax.name`, the page's own council marked "this council" and not linked, the county council as plain text with its name from UK Places' county council file. Source line: the invitation letter (S3), 5 February 2025.
6. **Locator map**: the area's district and unitary councils marked, the page's council outlined, neighbours outside the area plain. Use the estate kit's `LocatorMap` only if the kit is vendored into this repo at a tag with a hash test (K1) **and** that tag offers a membership mode (areas marked in or out, not a value ramp). The kit at `v0.2.0` has only the value ramp, which would hatch every area as "no figure": do not use it that way. If no tag offers membership, draw the map with the site's own `src/lib/boundaries.ts` (add `areaMap(codes, focus)`, same projection and ONS May 2026 file, `fill: var(--accent-wash)` style tokens for area members, `var(--accent)` for the focus) and say so in the PR body for kit 0.3.0 to absorb. Either way: `role="img"`, an `aria-label` naming the area and the page's council, the ONS source and OS attribution lines as `MiniMap` prints them, no values. All 184 codes are in the boundary file (source notes 9).
7. **Lancashire only, instead of items 2 and 4**: "Documents" as a list of `timeline` entries, each "{date in words}: {title}" linked, with publisher. Exactly these, oldest first: S3 Lancashire letter (5 February 2025); the consultation (5 February 2026); S16 Lancashire decision letter (16 July 2026); S4 (29 October 2026). Nothing else in the section except the heading, the rail (with labels and dates only, no sentences beyond the step labels and "Not yet dated by MHCLG"), the councils list and the map.

No `<details>` hides any claim. No JSON-LD and no OG text from the panel. The search index may include the panel text.

## Item 5: methodology and sources pages

- `src/pages/sources.astro`: a "Local government reorganisation" entry listing S1 to S16 with dates and the checked date, and the sentence "The panel prints no costs, savings, funding or population figures."
- The methodology page: one paragraph on what the panel shows, that the status is as published by MHCLG on the checked date, that representation windows are printed only when MHCLG dates them, and that a council's page does not change until the data file is updated by hand.

## Item 6: rewrite `tests/reorganisation-held.test.ts`

Keep: 361 councils load; the registry field is not read by the council page or anywhere under `src` (the two existing tests, unchanged). Replace the dist test with these (all skip when `dist/` is absent, as now):

1. `HELD_PHRASES` ("government-decided", "four-unitary", "Structural Change Order") appear in no built file. "Structural Changes Order" (with an s, the statutory phrase) is allowed only inside `section#reorganisation` and in a cited document title.
2. Exactly the 184 pages of `docs/reorganisation-sources/gss-join-dry-run.tsv` with a page carry `section#reorganisation`; no other page does; `/councils/lancashire/` and every other county slug do not exist.
3. Inside every panel, every element with `data-claim` has a `data-source` that exists in `data/reorganisation/sources.json` and whose publisher is MHCLG or legislation.gov.uk (never S17 or S18), and is followed by a `.source-line` linking that source's `url` before the next `data-claim` group.
4. Every quotation inside a panel (`<q>` or `<blockquote>`) is, after whitespace collapse, a substring of the cited page text in `docs/reorganisation-sources/text/`, and that page is the one named in the source line.
5. Every non quotation sentence inside a panel matches one of the templates in item 4 (export the templates from `src/lib/reorganisation.ts` as data; the test fills them from `areas.json` and compares).
6. No panel contains `£`, `%`, "population", "saving", "cost", "funding", "cancel", "scrap", "delay", or a digit sequence outside the allowed set of item 3.
7. On the 14 `documentsOnly` pages the panel holds no `data-step` text beyond the fixed labels, dates and "Not yet dated by MHCLG", no `<q>`, no `<blockquote>`, no proposals list, and no word from "withdraw", "claim", "court", "review", "decision" outside document titles.
8. Outside `section#reorganisation`, no built page prints `/re-?organi[sz]|unitary|abolish|structural change/i` except in a cited document title inside a `.source-line` (B2's seven held election quotes stay held).

## Item 7: dist checks

Extend `scripts/check-dist.mjs` and `scripts/lib/front-door-checks.mjs`. B2's Woking check (`!built.get('woking')?.toLowerCase().includes('abolished')`) and the `held` regex now apply only outside `section#reorganisation`; change them so, and leave every other B2 check as it is.

| Page | Must contain | Must not contain |
|---|---|---|
| `/councils/elmbridge/` | `data-reorganisation-status="order"`, "SI 2026/264", "1 April 2027", "Elmbridge Borough Council", "East Surrey Council", "wound up and dissolved" | "will be abolished on" (paraphrase), "£" |
| `/councils/woking/` | "West Surrey Council", "Woking Borough Council", "1 April 2027" | "abolished" outside the panel |
| `/councils/cheltenham/` | `data-reorganisation-status="minded-to"`, "29 October 2026", "minimum of three weeks", "Not yet dated by MHCLG", "April 2029" | any date for the window, "£", "659,000" |
| `/councils/west-berkshire/` | the Oxfordshire panel, "Ridgeway", "was not part of the original invitation" | "265,000", "£" |
| `/councils/lewes/` | the East Sussex and Brighton and Hove panel, "four wards" | "537,000" |
| `/councils/burnley/` | `data-reorganisation-panel="lancashire-blackburn-with-darwen-and-blackpool"`, the four document titles of item 4.7, "Not yet dated by MHCLG" | `<q`, `<blockquote` inside the panel, "withdr" outside a title, "claim", "four unitary", "minded" |
| `/councils/isle-of-wight/` | the Hampshire panel, "No changes have been proposed for the Isle of Wight" | |
| `/councils/norwich/` | `data-reorganisation-status="withdrawn-2026-09"`, "7 September 2026", "1 April 2029, the government's stated timetable" | |
| `/councils/adur/` | `data-reorganisation-status="undecided"` | |
| `/councils/birmingham/` | | `id="reorganisation"` |
| `/councils/shepway/` | the Kent panel, "Folkestone and Hythe" (the `tax.name`) | "Shepway" inside the panel |

Counts over all built council pages: 184 with `id="reorganisation"`; 112 without; by status 11 `order`, 29 `minded-to`, 91 `withdrawn-2026-10` (77 plus the 14 Lancashire pages, which carry the status attribute but print no status sentence), 40 `withdrawn-2026-09`, 13 `undecided`. Check the split from the TSV at test time and assert these fixed totals too: 11 + 29 + 91 + 40 + 13 = 184. Every panel has exactly five `data-step` items. 14 panels with `data-documents-only`. 184 locator maps inside panels. 0 occurrences of `£` inside any panel.

Text check on the built panels (the same rules `npm run test:text` applies in ukcounciltax; ukcouncils has no such script, so add the panel scope to the existing house style and dist checks): no em dash, en dash, entity, or spaced hyphen; no motive word from the rules above.

## Item 8: captures and self review

Run and keep the summaries: `npm run check` (grep the `- N errors` line), `npm test`, `npm run build`, `npm run test:dist`, `npm run test:e2e` (375px and desktop layout on every static path, which includes all 184 panels), `npm run test:csp`, and `BUILD_OG=1` for the final build through its `env:` block. Confirm the OG cards are unchanged (the panel adds nothing to them).

Captures, 375px and desktop, light and dark, attached to the PR body or linked at a commit sha (not committed to the repo): Elmbridge, Cheltenham, West Berkshire, Lewes, Burnley, Isle of Wight, Norwich, Adur, and Birmingham (no panel). At 375 by 812 the rail must not scroll horizontally and the whole Band D amount must still be on Burnley's first screen.

Read every one of the 21 areas' rendered panels once against the source notes and confirm in the PR body that each quotation matches its page. PR title: "Council pages: local government reorganisation panel from MHCLG sources". End the body with "Built with Codex from a brief prepared in Claude Code." Do not merge.

## Stop and report, rather than work around it, if

- any file in `docs/reorganisation-sources/raw/` fails `SHA256SUMS`;
- before starting item 2, the S1 Content API `public_updated_at` is later than `2026-10-29T`, the minded to publication or any area collection has been updated after 29 October 2026, or the GOV.UK search API finds a reorganisation document dated after 29 October 2026: MHCLG has moved (a window dated, a final decision, a new minded to letter), and the source notes need an update before any build;
- legislation.gov.uk lists an amendment to SI 2026/264 or a new structural changes order or draft order;
- any Lancashire County Council record (Cabinet minutes, an officer decision, the council's news) shows the protective claim withdrawn, discontinued, stayed with a new date or decided: stop, because decision 3's Lancashire rule then needs Tom's review, in either direction;
- a count in item 2 or item 7 differs from the data;
- a line would need a figure, or a source other than MHCLG or legislation.gov.uk (S17 and S18 are status checks, never panel sources);
- the kit question in item 4.6 cannot be answered from the vendored tag;
- C3 has not merged, or the B2 section order has changed;
- for item 1: the export cannot be fetched or a code yields two names, the 1b diff holds anything other than the expected changes, or 1c is not byte identical to 1b.

## Decisions for Tom (not for Codex)

- **D1. Source for `officialName`. Decided 9 November 2026: GOV.UK Local Links Manager's `Authority Name`** (Tom, in chat). Item 1a sets out the join, including the 8 codes reached through predecessors.
- **D2. Surrey after vesting.** From 1 April 2027 the 11 district pages describe councils that no longer exist and East Surrey and West Surrey have no council tax row until MHCLG's 2027/28 tables. Whether the pages stay with a past tense panel or redirect is a 2027 decision; this brief prints future tense only and the data file's `checked` date.
- **D3. The `reorganisation` registry field.** Once the panel ships, `scripts/build-registry.mjs` could stop copying the field. That is a change to the hold, so it is not in this brief.
- **D4. Lancashire wording.** When the claim's status is known (the county Cabinet's next update report, under resolution (iii) of 1 October 2026), decide whether Lancashire pages get the same status sentence as the other eight withdrawn areas.
- **D5. The URL `/councils/shepway/`.** The slug comes from UK Places and is used across six sites. Changing it is a cross site redirect job, not part of decision 4.
