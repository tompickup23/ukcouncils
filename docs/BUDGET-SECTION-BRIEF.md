# C3: council budget section | build brief

Refreshed 9 November 2026. Work only in `/Users/tompickup/wt/ukc-budget`, branch `feat/council-budget-section`. This preparation fetched and rebased onto UK Councils `origin/main` at `2c7c9c0`, which includes B1. PR 26 is merged in UK Council Tax as `85f7e33ef2cdc5c4f0a69b6c35209c86cc0cad5f`. The data dry run used that main commit, not the feature branch. `C3-DATA-DRY-RUN.json` records the results and input hashes.

This replaces the earlier C3 brief, including its instruction to omit Table 10 reconciliation and county tables. Read this repo's `CLAUDE.md`, B2's `B2-FRONT-DOOR-SOURCE-NOTES.md` and `B2-FRONT-DOOR-BRIEF.md`, then the donor's `BUDGET-GAME-SOURCE-NOTES.md` and `BUDGET-GAME-REVIEW.md`. The merged PR 26 corrections to display names and the DSG guard supersede the older source notes' wording. No game or scenario is added to UK Councils.

## Start conditions

1. Fetch and rebase onto `origin/main` again before implementation. B2 must have merged. Confirm its population, collection, elections, Local Links, profile sources and section order exist. B2 is currently preparation only; do not implement parallel versions to bypass it.
2. Confirm the UK Council Tax budget game has deployed and its live sitemap lists the billing council routes needed here. A merge alone is not deployment evidence. Save the verified link snapshot in item 5; do not guess sister URLs.
3. Confirm the donor files at the pinned merge above, the three original workbook hashes and the reconciliation fixture. A newer donor edition requires a fresh source review, not an automatic refresh.
4. Confirm the existing reorganisation hold still passes. Neither this budget section nor its source detail relaxes it.

## Fixed scope and B2 integration

Use B2's `data/population/mye25-population.json`, `data/collection/collection-rates-2025-26.json`, `data/elections/next-elections.json`, `data/links/local-links.json` and the existing `data/efs/statements.json` through their existing libraries. C3 does not copy or regenerate them, add another population section, calculate spending per resident, repeat the collection rate or introduce election facts.

Insert budget after elections and before spending. The profile section sequence becomes `about`, `tax-summary`, `collection`, `exceptional-financial-support`, `elections`, `budget`, `spending`, `school-holidays`, `sources`, using B2's actual EFS id if it differs. Preserve the rest of B2's document order: hero and extended about; tax answer and map; actions and band links; PageContents; profile sections; England and area averages; previous years; who sets the charge; sources; similar councils; sister links. PageContents follows document order and omits absent sections. Add `budget` once. Add `county-budget` immediately after it only when that subsection exists.

There are no standalone county pages. A district with a return shows its own tables, followed by its county's full tables, explicitly labelled as the whole county council budget. Nothing divides a county amount by population, districts or taxpayers. Counties appear on district pages only. A missing district return suppresses the entire budget section, including the county subsection. This gives 160 county subsections, not 164.

The budget and existing spending record describe different money. Say the former is the budget returned to MHCLG and the latter records published payments. No subtraction, ratio, overspend claim, budget rank, receipt or comparison joins the two.

## Item 1: pinned data and local copies

Copy, do not import across repositories. Pin all donor copies to the merge above. Copy `src/lib/budget.ts`, `src/lib/budget-game.ts`, `scripts/import-ra-budget.mjs`, the relevant budget tests and `tests/fixtures/budget-ct-reconciliation.json`. The pure game module is retained as the donor's tested calculation helper; no client game module or game component is mounted. Inspect `scripts/lib/ods.mjs` for byte equality and reuse the local copy when equal.

Use these local paths:

| Purpose | Local path |
|---|---|
| Three RA source manifest entries | `data/budget/sources.json` |
| RA output, unchanged schema and values | `data/budget/ra-2026-27.json` |
| Table 10 reconciliation inputs | `data/budget/table-10-2026-27.json` |
| Reviewed exceptions | `tests/fixtures/budget-ct-reconciliation.json` |
| Raw originals, ignored by Git | `data/raw/` |

Create the Table 10 file as a literal structural copy of `schemaVersion`, `year`, `sources.components` and `components` from the donor's `data/national/england.json`. Retain the complete components records, source block, notes, tax bases and integer pence. Add a `copiedFrom` block with donor commit, path and whole donor file SHA-256. No numbers are recomputed. This avoids importing unrelated parish and history data and supplies the reconciliation inputs the old brief omitted. Record the new local file hash in the copy manifest. The donor national file hash is `81e6926afd4f4e1c226a1333ee7e5c7be2aa4c2d6f6bbc4c87b52e80ebb36c0f`.

Adapt only paths and local source adapters in the copied importer and libraries. Replace `national-data` dependencies with the local Table 10 snapshot and existing council tax library. Keep the source hash checks, asset ids, missing markers, signed values, unit conversion and every validation. No build, test or refresh reads a sibling checkout. The preparation copy is explicit and recorded; subsequent work uses committed local inputs and pinned original URLs.

| Workbook | SHA-256 |
|---|---|
| `RA_2026-27_data_Part_1.ods` | `3ea4d4c2218bc9f49bbf59a6fc82481acb6a3494d5b0f4e114cdb945730653db` |
| `RA_2026-27_data_Part_2.ods` | `55c34505c69513fcba446f3484061d2bd115c4ce06bb5bafba7b36e330be4d65` |
| `SG_2026-27.ods` | `6150792dcea97ca58b912a5fbf9fdc99562ba782fb7d6f5c8885e6ca1a17e3b5` |

Publisher is MHCLG; release is Local authority revenue expenditure and financing England: 2026 to 2027 budget individual local authority data; published 11 June 2026; licence is Open Government Licence v3.0. Preserve URLs, sheet names and retrieval dates from the manifest. Dates in reader copy come from the manifest, not repeated literals. Source hash detail belongs in sources or methodology, not the headline.

Assertions already dry run: 317 retained authorities, 308 available, 296 billing authorities, 287 available billing returns and 21 available counties. All service headings sum exactly to line 799 in this edition; all sub-lines sum exactly; every financing identity reconciles; required cells in available returns are non-null. Preserve the importer tolerance of two printed thousands for the service total check, while recording that this edition has zero difference. Do not weaken an existing check. The output must reproduce donor budget SHA-256 `704c213738abbff846e9210a6fbb9eda058efb3d72beb5467fd7755cfeefdd0a` byte for byte. The unchanged fixture hash is `730a5ae7066eb22a2509974265779fa1d99ec7f83e5e46a7d07aab03ffac0e90`.

## Item 2: reconciliation and joins

Keep all 16 reviewed Table 10 exception rows. A council outside the fixture must be within 0.05 per cent; a listed difference must remain within 0.01 percentage points of its reviewed value. Never alter either return to force agreement. Note 4 membership must match the fixture. These are validation calculations, not new public observations.

Join by exact GSS. All 164 RA district county codes equal registry `parentGss`; every code resolves to an SC row and a name in the existing council tax table's `counties` map. Every county serves at least one district. After missing district returns are excluded, 160 sections cover all 21 counties. No name join, predecessor population substitution or fallback to a different year.

Copy all donor anchor tests. These are printed GBP thousands, before display conversion:

| Field | Burnley | Birmingham | Westminster | Lancashire |
|---|---|---|---|---|
| Service expenditure, 799 | 17,246 | 2,700,482 | 552,973 | 2,759,432 |
| Revenue expenditure, 900 | 25,831 | 2,970,775 | 525,414 | 2,826,392 |
| Council tax requirement, 990 | 8,832 | 560,016 | 83,475 | 717,078 |
| Education, 190 | 0 | 1,117,292 | 147,311 | 1,409,030 |
| DSG, SG 102 | 0 | 884,812 | 116,704 | 1,174,566 |

The receipt also records the other eight donor anchor fields for all four authorities. Test them all, including reserve start and end balances. Count tests read the source sets as well as checking these pinned edition anchors.

## Item 3: profile adapter and presentation

Add `src/lib/council-budget.ts` and `ProfileBudget.astro`. The adapter returns null outside England or without a current billing return. Otherwise it returns the billing record, display name, optional separately named county record, sources and verified game link. Headings and captions use `tax.name`; county names use `loadYear(CURRENT_YEAR).counties[parentGss].name`. There are 22 billing display names different from RA names. Keep the RA name in source detail as `Printed in the RA return as` when different. Dorset must read Dorset in the heading and Dorset UA in source detail. Do not use the registry's `officialName` for new prose.

Use one section `id="budget"`, `data-profile-section="budget"`, headed `{name} council budget for 2026/27`. Adapt a local copy of `BudgetTables.astro` with nested heading levels, so council and county subsections have unique ids and accessible names. Render observed service totals, expandable service sub-lines, signed funding and reserves. No client script, new route or download. Preserve useful static HTML without JavaScript.

Specific assertions:

1. Drop zero service headings. Keep negatives with their signed amount and the words `net income`. This edition has 150 available authorities with at least one negative heading. Burnley includes transport minus £343,000 and planning minus £426,000. Use words rather than prohibited dash punctuation in prose.
2. State net current expenditure, net of sales, fees and charges, with the NHS funding exclusion. Label pounds converted from printed whole thousands. Keep observation and calculation record types separate.
3. Print the DSG sentence claiming that most schools spending is grant funded only when `grantindsg > 0`. Isles of Scilly has education £756,000 and DSG zero. Under this site's zero rule, omit the standalone DSG sentence when the grant is zero while retaining the printed education figure. Do not relabel the known zero as unknown. Omit zero education and special schools rows. Do not calculate SEND or subtract DSG.
4. Note 4 belongs beside council tax requirement in both the grouped funding row and the original financing row, not solely in a distant footnote. The seven councils are Barnet, Colchester, Enfield, Harborough, King's Lynn and West Norfolk, Reigate and Banstead, and Rugby.
5. Note 8 belongs directly below the signed funding table, with its source, on Runnymede and Windsor and Maidenhead. Preserve negative contributions and add or deduct labels. Runnymede's printed retained business rates line is positive 880 thousands, so its contribution is a deduction of £880,000. Never sum absolute values as funding.
6. Reserves use only other earmarked and unallocated balances, lines 1015 and 1016. Show the original balances and labelled calculated total. Keep the release caveat directly under the table: `It is not possible to identify usable revenue reserves in the current release.` No reserve ratio.
7. Zero standalone financial rows are absent under UK Councils rules. A zero cell in an otherwise present reserves row is `n/a`; do not change the stored zero. Null never becomes zero. A source line follows every table and every separately printed amount; every caveat stays with the figure it qualifies.

## Item 4: absent sections and county pages

The complete no return list is:

| Council | GSS |
|---|---|
| Castle Point | E07000069 |
| Coventry | E08000026 |
| Cumberland | E06000063 |
| Dudley | E08000027 |
| Epping Forest | E07000072 |
| Greenwich | E09000011 |
| Guildford | E07000209 |
| South Gloucestershire | E06000025 |
| Warwick | E07000222 |

Each retains its existing profile but has no budget heading, notice, placeholder, budget contents link or county budget subsection. No prior year substitution. Assert 287 `data-profile-section="budget"` sections and 160 `id="county-budget"` subsections across the 296 pages. `/councils/lancashire/` remains absent. Birmingham, Blackpool and all other non-district pages have no county budget. Burnley has its own £17,246,000 service total and the separately labelled Lancashire £2,759,432,000 service total. Never add them together.

## Item 5: verified links, sources and documentation

Add a manual sitemap snapshot script, `scripts/check-ukcounciltax-budget-links.mjs`. Read the live UK Council Tax sitemap, retain exact matching budget route locations, and join the already held billing slug and GSS only after membership is confirmed. Write `{fetched, source, urlsByGss}` to `data/links/ukcounciltax-budget.json`. Expect 296 verified billing routes; the index makes 297 budget locations in the donor route set. Recount the live sitemap before implementation; this preparation has not certified a future live snapshot. Publish `Play the budget game for {name} on UK Council Tax` only for available returns with a saved verified URL. Never link to an invented county route.

Extend B2's `profileSources()` in page order, deduplicating identical source entries while preserving source lines within each table. Extend its source catalogue coverage test for `data/budget`. Add the RA edition, signed financing method, county scope, absent return policy and reserves caveat to sources and methodology, and record the copied donor commit in `docs/RELEASE.md`.

## Item 6: CI workbook cache

Before every CI job that runs raw RA tests, restore only the three named files under `data/raw` with `actions/cache`, using the repository's compatible action version. Key it on runner OS and all three complete SHA-256 values from the committed manifest, in a fixed order. Do not use a broad restore prefix. The importer must always run after restore, rehash every restored file, fetch only missing files and reproduce the committed JSON. A cache hit must never bypass validation. Keep raw workbooks ignored and out of the built site.

Acceptance checks after implementation: cold cache downloads and validates; warm cache with network unavailable still passes; a tampered cached byte fails the hash check before parsing. Run this against temporary cache copies, then restore the verified originals. `git diff --exit-code` on the output must pass. Do not run a deployment workflow to test the cache.

## Self review and stop conditions

One local commit per item during implementation. Run `npm test`, `npm run check`, `npm run build`, `npm run test:dist`, `npm run test:e2e` and `npm run test:csp`; finish with `BUILD_OG=1` through the environment, then repeat dist checks against that output. Confirm the error count, no page overflow at 375px, no duplicate ids and no script permission change. Read Burnley, Birmingham, Blackpool, Dorset, Isles of Scilly, Runnymede, all seven Note 4 pages and all nine no return pages. Capture Burnley, Blackpool and Coventry at 375px and desktop in both themes, with the county heading and funding caveats in view. Check sources, section order, absent contents links and unchanged B2 coverage. Scan all added text and commit messages for prohibited punctuation and individual names.

The source counts, joins, hashes, reconciliation and anchor assertions above were dry run against merged main. Future component, browser, sitemap and CI behaviour are acceptance criteria, not claims of a completed build.

Stop on an unmet start condition, changed hash or edition, unlisted missing return, failed anchor or reconciliation, missing county join, B2 data contract drift, unavailable required sitemap route, a claim requiring another source, or any need for inline script permission. Do not fill gaps, infer figures or weaken a test. A routine layout choice uses the conservative option and is recorded. Nothing is pushed, merged or deployed without a separate instruction. A later authorised PR should carry the counts, local copy provenance, full checks, screenshots and any remaining fix list.

Preparation verification: the rebased documentation checkout passed 172 unit tests, with 12 existing distribution-dependent tests skipped because it has no built output; Astro check reported no errors or warnings. The separate pinned source dry run passed all assertions. No UI implementation was added here.
