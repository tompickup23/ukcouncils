# UK Councils | stage one implementation

27 September 2026. Local implementation of batches A, B and C, requested by Tom. No commit, push or deployment has been made.

## User-visible changes

- Homepage and Your Area offer postcode and local council-name lookup. Name matching ignores case, accents and apostrophes, searches names by words and supports keyboard navigation. No postcode or name query is added to a share URL or storage.
- Council pages start with one band selector and answer. Annual charge, monthly calculation, change, source and parish caveat stay together. The yearly change is visually secondary to the annual amount. History charts, contents links, official GOV.UK actions and a council-specific comparison link follow.
- `/compare/` compares two distinct councils of the same published class, band, year and area-charge basis. It supports the three source years held, searchable selectors, swapping and bookmarkable URLs with back/forward restoration. Invalid or missing data produces a recoverable message instead of a result. The canonical is always the base tool.
- National, band and regional tables have selected-band figures, local name filtering, class filtering, result counts and numeric sorting only within a complete published class. Compact two-column rows retain monthly and change context on mobile. Headers and council names remain visible when scrolling. Regional pages also retain a complete HTML table of all bands.
- Band fragments restore the selected radio and keep the council's comparison link in sync. The radio selector still works without JavaScript. The postcode form cannot submit a postcode into this site's URL when scripts are unavailable.
- Descriptive homepage metadata, independent-publisher schema, council subject identity, contact/corrections routes and footer links are included. Unsubstantiated sitemap modification dates are omitted. Existing source publication dates stay unchanged.
- Private sister links are removed from public rendering, with registry-level and built-output regression guards.
- The existing refresh workflow validates generated data, types, built output, browser journeys and security headers before opening a review request. Its schedule and publication permissions are unchanged.

## Reuse record

| Donor | Revision read | Adaptation |
|---|---|---|
| AI DOGE `CouncilSearch.tsx` | `6b09af9ebc2ff452d14e4abdc596d10b76a60851` | Local matching and bounded results ported to Astro and plain browser TypeScript; no React runtime added |
| AI DOGE `e2e/audit.spec.ts` | Same revision | Axe checks added to this repo's existing test harness, in both themes and viewports |
| UK Demographics `compare.astro` | `37feb75933d819b28c280c858d4641cddf57a485` | Selection, swap and URL-state interaction adapted with a dedicated council-tax data contract and safe DOM updates |
| UK Demographics `PageContents.astro` | Same revision | Anchor navigation adapted to UK Councils tokens and the sections that actually exist |
| UK Councils `Fact`, `HistoryBars`, `BandSelector` | Existing local components | Retained source requirements and no-JavaScript band selection; reused charts rather than adding a chart library |

There are no cross-repo runtime imports. The only added package is the development-only `@axe-core/playwright` audit dependency.

## Data and URL contracts

`tax-view-data.ts` builds the browser-safe view from committed MHCLG files. It joins historical values only on the same GSS and class. `tax-view.ts` validates comparisons and calculates differences in integer pence. Source publication, revision, original file URL and hash remain distinct in the source metadata. Missing, non-finite, zero or negative charges are not substituted.

Council-band state uses `#band-A` through `#band-H`. Comparison state uses `?a=burnley&b=pendle&band=D&year=2026-27`. The sitemap contains only `/compare/`, with no permutations. Existing council, regional and band URLs are preserved.

Official next steps use the GOV.UK band checker and council-website finder, checked during implementation. The registry has no verified official website field for each council, so council schema supplies the council's name and GSS identity without assigning our profile URL as its official website. No council-specific URL was guessed.

## Checks and limitations

Final validation on the completed local build:

- `npm test`: 67 passed.
- `npm run check`: zero errors, warnings or hints.
- Full build with `BUILD_OG=1`: successful, including the social cards.
- `npm run test:dist`: 326 pages, 325 sitemap URLs, every page pointing to a built card.
- `npm run test:e2e -- --workers=2`: 94 passed across mobile and desktop, including axe checks in both themes and 200% text sizing.
- `npm run test:csp -- --workers=2`: 32 passed through the production headers.
- `git diff --check`: passed.

The refresh workflow was edited locally; no remote workflow or deployment was triggered. Its underlying checks were run locally as listed above.

 Browser tests cover current figures against source values, same-class restriction, tampered URLs, saved state, swapping, keyboard lookup, no-JavaScript behaviour, API failure, table filtering/sorting, metadata and private-link exclusion. Accessibility checks cover representative templates in both themes, plus large text and mobile overflow.

The contact address remains unset in `CONTACT_EMAIL` until receipt is confirmed. The page states this honestly. The existing handoff records a configured alias, but this session has not sent a message or demonstrated delivery. Publishing a working mailbox remains the one incomplete contact task.

A route-level semantic modification manifest is deferred, as the plan allows; unknown `lastmod` values are omitted now. Full-site search, one-click sharing, map geometry, CSV export, school dates and elections remain later stages.

No field Core Web Vitals or Search Console ranking improvement is claimed. Local builds and accessibility tests are not measurements of real-user search or speed. No manual screen-reader certification is claimed.

The package audit reports existing Astro/sharp/esbuild advisories: one critical, one high and one low package finding. The lockfile diff adds only the accessibility test packages; it does not change that existing dependency tree. The offered repair is a major Astro upgrade, which needs a separately reviewed migration. This static build does not establish exploitability or establish that every advisory is inapplicable. Do not apply `npm audit fix --force` as an incidental stage-one change.

## Release handoff

Review the local preview and the mailbox state, then publish only on an explicit deployment instruction. Keep the source and data snapshot together. A future commit on the default branch requires a branch first under the global guide.

## Transfer-size observation

Read from the still-live site and this local build on 27 September. Gzip sizes below are generated with the same local compressor, not measured network transfer or loading times. They include HTML and embedded data only, excluding separate assets.

| Page | Live HTML, gzip bytes | Stage one HTML, gzip bytes |
|---|---:|---:|
| `/` | 10,232 | 18,914 |
| `/councils/burnley/` | 6,247 | 7,554 |
| `/council-tax/north-west/` | 7,327 | 14,059 |

Name-search entries and embedded comparison/table data increase HTML size. Keep this cost visible in future performance work; no speed improvement is claimed from this change.
