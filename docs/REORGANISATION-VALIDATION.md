# Reorganisation panel validation

Validated 10 November 2026 in `/Users/tompickup/wt/ukc-reorg`, branch `feat/reorganisation-panel`, with Node 22.23.4. The programme data retains its checked date of 9 November 2026.

## Base and scope

The branch was rebased with `git rebase --onto origin/main 2ea2439`. All 11 PR commits replayed without conflicts onto `7454e902b1018c3e23c63317c39a20c165b023bb`. PR 36 is already included in main as squash commit `34d5e9b`. This PR no longer includes the budget changes as a stacked dependency. The panel remains immediately after elections and before budget and spending.

The five requested corrections have one commit each. A sixth commit makes the order absence text use the data's checked date and adds `unitary` to the held wording pattern. The separately requested registry refresh remains outside this PR.

## Corrections

The methodology now says that Lancashire, Blackburn with Darwen and Blackpool carry dated documents only, and its date reads “published by MHCLG on 9 November 2026”.

The minded to order sentence now reads “Any change ‘would need to be provided for in a structural changes order’.” The lead in is an exported fixed template. The quoted words retain their original source and statutory process page. Every rendered quotation is compared with the saved source page.

The importer removes U+200B from the collection title before using it for the S2 title and area name. Regeneration changed only Surrey's area name and S2 title. A recursive test checks every string and key in both generated data files for zero width characters. All 132 saved source hashes passed before regeneration.

All 14 documents only panels contain the heading, four dated documents, councils list and map. They have no rail. Both rendered tests and dist checks reject “New councils start” and “Not yet dated” anywhere on those pages.

The order absence template receives `longDate(reorganisationData.checked)`. A regression test changes the in-memory checked date, verifies the resulting text, and restores it. The saved checked date is unchanged.

The expanded held wording pattern rejects `unitary` outside permitted panel and source contexts. Existing council classifications and tax comparison labels are preserved through exact wording and markup exceptions, without changing reader text. Tests reject altered labels, additional sentences and new wording inside those elements. Burnley's complete built page passes.

## Data and rendered review

The reviewed data contains 21 areas and 204 invited councils plus West Berkshire. There are 184 programme council pages and 21 county councils without pages. The built status totals remain 11 order, 29 minded to, 91 October withdrawal, 40 September withdrawal and 13 undecided. There are 112 council pages without a panel, 184 membership maps, 170 rails with 850 steps, and 14 documents only panels without rails.

A rendered panel from each of the 21 areas was read against the source notes, including status, dates, proposals and source page references. The tests compare all rendered statements and citations with the view templates and saved source pages. No representation opening or closing date is supplied by the data. The registry field stays unread.

Burnley, Woking and Birmingham were read directly from dist. The PR body quotes Burnley's heading and four dated document entries, Woking's heading and sourced order sentence, and Birmingham's page heading with the explicit finding that no panel exists.

No estate kit is vendored in this checkout. The brief's permitted fallback uses `areaMap(codes, focus)` with the existing ONS May 2026 boundaries and projection. The membership map is available for a future kit version to absorb. The September statement retains S1 and S5; West Berkshire and its area maps retain the S8 citations.

## Comparison with the new base

A fresh archive of main at `7454e902b1018c3e23c63317c39a20c165b023bb` was built inside the worktree's ignored cache. The unchanged numeric comparison script was run with an explicit allowance list of the 184 programme pages, sources and methodology.

```text
Summary: 186 pages differing; 0 pages added; 0 pages removed; 0 pages outside allowed globs.
```

The full output is [REORGANISATION-NUMBER-DIFF.tsv](REORGANISATION-NUMBER-DIFF.tsv). This replaces the old stacked comparison and its 293 page result.

Every existing `data-figure` value matches main across all 296 council pages. Burnley, Woking, Birmingham and Elmbridge also retain identical existing visible text and JSON-LD after removing the new panel and its contents link. The OG routes, renderer, palette, site constants and council tax inputs are unchanged. Burnley, Birmingham and Elmbridge PNGs are byte identical to images rendered with the new base's code.

## Gates and captures

The local checks used Node 22.23.4:

| Gate | Result |
|---|---|
| `npm run check` | 0 errors, 0 warnings, 1 existing unused variable hint in TaxTable |
| `BUILD_OG=1 npm run build` | Passed with all share cards |
| `npm test -- --maxWorkers=2 --testTimeout=30000` | 270 passed |
| `npm run test:dist` | Passed for 329 pages and 328 sitemap URLs |
| `npm run test:e2e -- --workers=2 --output=.cache/reorganisation/revision/e2e-results` | 249 passed; one existing budget batch exceeded its 60 second navigation timeout |
| `npm run test:e2e -- --last-failed --workers=1 --timeout=120000 --output=.cache/reorganisation/revision/e2e-results` | The remaining batch passed in 14.7 seconds; all 250 cases passed across these two runs |
| `npm run test:csp -- --workers=2` | 42 passed |

The first browser attempt shared its trace directory with the simultaneous CSP run and reported two trace cleanup errors. The complete browser suite was then rerun with a separate output directory. The single navigation timeout in that run and its successful isolated rerun are recorded above. No assertion was removed or weakened.

There are 96 PNG captures and a rendered review of all 21 areas. The inspected mobile and desktop captures show the complete order sentence and the documents only panel without a rail.

The browser suite covers all 184 panels at 375px and desktop, with both themes in the nine capture cases. Documents only pages are checked for an absent rail. Burnley's full Band D amount must fit on its 375 by 812 first screen. Captures and the 21 area rendered review are under ignored `output/playwright/b4/`, with CI retaining the corresponding artifact. No images are committed.

Nothing was merged or deployed.
