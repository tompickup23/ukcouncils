# Reorganisation panel validation

Checked 9 November 2026. Scope: items 3 to 8 of the panel brief, following the reviewed data commit and L1 source notes. Item 1, the three repository registry refresh, is outside this PR.

## Data and rendering

All 132 saved files match SHA256SUMS. The reviewed programme has 21 areas, 204 invited councils plus West Berkshire, 184 council pages and 21 county councils without pages. The built status totals are 11 order, 29 minded to, 91 October withdrawal, 40 September withdrawal and 13 undecided. The 91 include 14 Lancashire documents only panels. There are 112 council pages without a panel and 184 membership maps.

Every rendered claim is compared with the approved templates and its source id, linked title, date and PDF page. Every quotation is checked against the saved page text. The checks reject unaccounted text, orphan citations, unsupported figures, altered map descriptions and the held registry wording. The registry field remains unread.

The source review covered a rendered panel from each of the 21 areas, including the proposal lists and source pages. Surrey uses the saved SI 2026/264, its council names and articles, in future tense. The five representation windows have no opening or closing date.

Lancashire remains subject to the sub judice rule in the binding notes. Its four dated documents remain the only narrative content. Its rail contains fixed labels, sourced dates and “Not yet dated by MHCLG”. A retrieval date is not represented as an order date. No account of the claim or summary of the withdrawal is printed. The methodology records the sub judice restriction.

L1 supplies only “None made by 9 November 2026” on the ordinary order rail, with links and hashes for all four saved feeds. No further sentence is taken from L1. Lancashire retains its stricter labels and dates exception.

## Implementation decisions

No estate kit is vendored in this checkout, so there is no tagged membership component with a hash test to reuse. The brief's permitted fallback adds `areaMap(codes, focus)` to the site's boundary module, using the same ONS May 2026 boundaries and projection. Membership is shown without a value ramp. This is available for a future kit version to absorb.

The panel sits immediately after elections, before the existing budget and spending sections, with its contents entry in the same position. The map attribution follows MiniMap. Sources and methodology have their explicitly permitted documentation blocks. The exact contents link is permitted outside the panel; other held prose stays held. The existing RA line 906 exception is unchanged.

The September withdrawal statement cites both S1 and S5. West Berkshire cites S8 pages 1 and 3 and the original Oxfordshire invitation. Every Oxfordshire membership map also cites S8 for West Berkshire. No other source has been introduced.

## Pages allowed to differ

Relative to the stacked base, `origin/feat/council-budget-section` at `2ea243999da47d1da0b0c4190a84f0eebe8f9b4a`, only the 184 programme council pages, `/sources/` and `/methodology/` change their visible text. Panel text also enters the generated search index. No page URL, financial figure, JSON-LD or OG content is changed by this PR.

`origin/main` advanced to `b327a6cb3b5235a7d98f34864a35c1c996c3f008` during validation, bringing in PR 38 and `scripts/diff-numbers.mjs`. Its script is run against a scratch build of that commit. The main comparison includes the budget changes inherited from open PR 36. Allowances are the explicit union of its 287 billing council pages and the 184 panel pages, plus sources and methodology. This union has 291 council pages. The complete script output is in [REORGANISATION-NUMBER-DIFF.tsv](REORGANISATION-NUMBER-DIFF.tsv). The result is: 293 pages differing; 0 pages added; 0 pages removed; 0 pages outside allowed globs. This includes the inherited budget changes and the two documentation pages.

A separate scratch build of the stacked base supplies the requested hand diff of Burnley, Birmingham and Elmbridge. After removing the panel and its contents link, all existing visible text and numeric tokens match exactly. JSON-LD matches too.

| Page | Money occurrences compared | Numeric tokens compared | Result |
|---|---:|---:|---|
| Burnley | 579 | 1796 | Identical |
| Birmingham | 288 | 1235 | Identical |
| Elmbridge | 576 | 1792 | Identical |

Every existing `data-figure` field also matches the stacked base across all 296 council pages.

The OG routes, renderer, palette, site constants and council tax inputs are unchanged. The Burnley, Birmingham and Elmbridge PNGs are also byte identical to images rendered using the stacked base's code.

## Gates and captures

The complete local gate passed: check with zero errors and warnings, 244 unit tests, the build with `BUILD_OG=1`, dist checks for 329 pages and 328 sitemap URLs, 240 browser tests and 42 CSP tests.

After the final Oxfordshire map citation was added, the full OG build, check, all 244 unit tests and dist checks passed again, followed by six focused browser cases covering West Berkshire in both viewports and themes and the 21 area text review. The three OG anchor hashes remain unchanged. CI repeats the full browser and CSP runs on the final commit; its result and capture artifact are linked from the PR body.

The local checks use Node 22.23.4. The unit suite used two workers and a 30 second timeout; browser runs used two workers and an isolated browser cache. There are 100 PNG captures and one 21 area rendered text review.

The browser suite checks all 184 panels at 375px and desktop. The capture cases also check both themes. It captures Elmbridge, Cheltenham, West Berkshire, Lewes, Burnley, Isle of Wight, Norwich, Adur and Birmingham in each viewport and theme. Each capture set includes the first screen and, where present, the full panel and rail. The sticky header is hidden only for element captures so it does not cover the rail. Burnley's entire Band D amount remains on its 375 by 812 first screen.

Captures and the rendered text of one panel per area are kept under ignored `output/playwright/b4/`. CI uploads them as an artifact named for the commit, rather than committing images. The PR body links to the run and artifact. Both CI and deploy checks run the rendered claim test after building; no deployment is part of this work.
