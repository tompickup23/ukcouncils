# C3 council budget section report

Implementation resumed on 9 November 2026 in `/Users/tompickup/wt/ukc-budget`, branch `feat/council-budget-section`.
The starting HEAD was `5eb4006d47216a7865c4e3220241d3f8a18be07a`. The committed items and all saved item 3 changes were preserved.
Fetched `origin/main` remained `151dc0fb8d5469dcce50a55eb5469ca92026cc48`, the B2 PR 35 merge and an ancestor of this branch.

## Delivery

1. `aae0b40`: pinned inputs, local donor libraries and tests.
2. `5eb4006`: all reconciliation anchors and exact county joins.
3. `a0e727e`: static profile tables and the narrow line 906 wording guard.
4. `b82fb7c`: absent return and county coverage checks.
5. `8783fb8`: verified game links, sources, methodology and documentation corrections.
6. The final acceptance commit adds CI workbook caching, cache acceptance checks, browser coverage, screenshot capture and this report.

The source set has 317 authorities, 308 available returns, 296 billing authorities, 287 available billing returns and 21 available counties.
The generated profiles contain 287 budget sections and 160 separately labelled county subsections. The nine absent returns have no budget section, contents link, notice or county subsection.
There is no standalone Lancashire page. Budget is after elections and before spending, with matching contents order.

## Decisions taken

1. Owner ruling, 9 November 2026: RA Part 1 line labels are MHCLG source text, treated like a cited document title. The exact label “Inter-authority transfers in respect of reorganisation”, with line number 906, is permitted only inside the original RA financing table. No new public prose uses that wording. The registry field remains held. The shared B2 and built output guard accepts only the exact observation cell with its line number inside `data-ra-financing` markup. Tests reject altered wording, a different line, prose, metadata, citations and other tables, and exercise all three built source pages: Bromsgrove, Redditch and Buckinghamshire. The original financing table is excluded from search snippets.
2. The saved permission to preserve the pinned Table 10 source strings applies only to their original punctuation: 36 component entries across eight distinct authority names. New prose and commit messages follow the punctuation rule.
3. Zero standalone financial rows are omitted. A zero cell in an otherwise present reserves row is n/a, without changing the stored zero. Where all four selected reserve cells are zero, the reserves subsection is absent. Bradford is the sole available return with this source pattern. Negative service observations retain their amount, use “minus” and carry “net income”. Funding keeps explicit Add and Deduct directions.
4. The county tables show the whole county council budget. They are never apportioned or added to the district total. Budget returns and published payment records describe different money and are not compared.
5. Source catalogue and profile citations accompanied the data and presentation changes to preserve existing source coverage checks. Sources remain directly below each table and separately printed grant figure.
6. All work stayed in this worktree. The external plan in another checkout was not changed. The previous stop note is superseded by this report and removed before the final commit.
7. Browser captures are ignored local output and CI artifacts. They are not committed. A dedicated local preview port is checked for this worktree before browser tests because Astro preview detaches on this machine.

## Provenance and links

The donor is UK Council Tax merge `85f7e33ef2cdc5c4f0a69b6c35209c86cc0cad5f`. Every donor hash in `data/budget/copy-manifest.json` was rechecked at that commit, and every local copy hash matches its file. The ODS reader is byte identical.

The RA output SHA-256 is `704c213738abbff846e9210a6fbb9eda058efb3d72beb5467fd7755cfeefdd0a`.
The unchanged reconciliation fixture SHA-256 is `730a5ae7066eb22a2509974265779fa1d99ec7f83e5e46a7d07aab03ffac0e90`.
The three workbook hashes match the committed manifest. All 16 reviewed Table 10 exceptions and all seven Note 4 memberships remain unchanged.

The manual sitemap check on 9 November 2026 found 297 budget locations, including the index, and saved 296 exact billing URLs. The Burnley budget game returned HTTP 200. Only the 287 available returns receive a game link. Builds and tests read local committed snapshots and never a sibling checkout.

## Workbook cache

Both CI validation and the deploy workflow restore only the three named RA workbooks. The cache key contains runner OS and all three complete manifest hashes in the fixed Part 1, Part 2, SG order. There is no restore prefix. The importer always runs after restore, rehashes every file, fetches only missing files and must reproduce the committed JSON before tests.

`node scripts/check-ra-cache.mjs` passed in disposable copies: cold download and byte identity; warm run with all network requests refused; a changed byte in each of the three workbooks rejected before parsing; restored verified bytes and a final identical import. The real raw cache was never changed. Raw workbooks remain ignored and outside the built site. No deployment workflow was run.

## Documentation corrections

The B2 suppression decision now cites `ce1408f`; the intro placement decision cites `7c48221`.
SI 1328/2024 is titled “The Barnsley and Sheffield (Boundary Change) Order 2024”.


## Prose and printed totals

Word counts use the rendered budget section, including its county subsection, headings, disclosure summaries and verified game link. Tables, source lines and source lists are excluded. Text nodes are separated before whitespace counting so adjacent HTML elements do not join words. The baseline has no budget section.

| Page | Before | Final budget prose words | Observed service expenditure, RA 799 | Observed revenue expenditure, RA 900 |
|---|---|---|---|---|
| Burnley | 0 | 167 | £17,246,000 | £25,831,000 |
| Birmingham | 0 | 100 | £2,700,482,000 | £2,970,775,000 |

Both are below 250 prose words. Burnley's separate Lancashire county service total is £2,759,432,000. No district and county amounts are added together.

The required page review covered Burnley, Birmingham, Blackpool, Dorset, Isles of Scilly, Runnymede, all seven Note 4 pages and all nine no return pages. The review checked the display names, signed figures, source lines, two Note 4 placements, Note 8, zero DSG omission, reserves caveat, county scope and absent sections.


## Final build and source gates

* `npm run build` passed during implementation. The final build passed with `BUILD_OG=1` supplied through the process environment.
* `npm test -- --maxWorkers=1`: 234 tests passed across 32 files against the final output.
* `npm run check`: zero errors, zero warnings and one existing unused variable hint in TaxTable.
* `npm run test:dist`: 329 HTML pages, 328 sitemap URLs and all 329 pages pointing to a built share card; all B2 and C3 coverage checks passed.
* Existing public script permissions are unchanged. No budget client script or inline script permission was added.
* The complete raw inputs, imported output, fixture, local copies and pinned donor hashes were rechecked. The protected B2 data inputs are unchanged.

The complete browser gates run sequentially on this machine with one worker after local resource contention caused timeout failures during overlapping attempts. No test assertion or timeout was weakened.


The shared Chromium executable disappeared during the full browser run after its initial browser checks had passed. Final local browser validation uses the pinned Playwright browser installed under ignored `.cache/c3/browsers`, with `PLAYWRIGHT_BROWSERS_PATH` supplied to both browser suites. This isolates the run from changes to the shared browser cache and changes no test or application behaviour.


## Browser and screenshot evidence

`npm run test:e2e -- --workers=1` passed all 178 tests against the corrected final build. Every one of the 296 billing profiles was visited at 375px and desktop with budget disclosures expanded. There was no page overflow beyond the existing two pixel tolerance, no duplicate ID and no missing table source placement. Every available budget section was below 250 prose words. Burnley's whole Band D amount remained on the 375 by 812 first screen.

The final run generated 56 PNG screenshots and two word count JSON files under ignored `output/playwright/c3/`. Captures cover Burnley, Blackpool and Coventry at both widths and in both themes. They include service figures and totals, county headings and totals, signed funding, reserves caveats and the absent Coventry contents entry. Additional Runnymede captures show Note 8 and its source. Representative captures were opened and visually reviewed. Wide tables retain the site's existing labelled, keyboard focusable scroll regions.

The PR's CI build uploads this directory as a screenshot artifact tied to its commit. The PR body links the artifact once the run succeeds. No PNG, raw workbook, browser binary or test log is staged or committed.


`npm run test:csp -- --workers=1` passed all 42 tests through local Wrangler with the production headers applied. The final tree contains 301 share card PNGs. All required local gates passed after the Bradford omission correction.

## Review handoff

Implementation and local acceptance are complete. The branch is prepared for the authorised push and PR. The PR body records the decisions, counts, validation and commit-specific screenshot artifact. Keep the worktree and its ignored evidence for review. Nothing is merged or deployed. Any later merge or deployment needs a separate instruction.
