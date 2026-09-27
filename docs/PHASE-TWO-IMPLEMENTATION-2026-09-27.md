# Phase two implementation | 27 September 2026

This is the second release of the revised improvement plan: batches D and E,
following the locally implemented A, B and C. It is not the original roadmap's
school and election data phase. Tom also requested removal of the pink accent.
All changes are local; nothing has been committed, pushed or deployed.

## What changed

- Deep blue accent in light mode, pale blue in dark mode, with matching favicon
  and regenerated social cards. The estate template remains the source of the
  shared token block. Local configuration and `scripts/apply-brand.py` reproduce
  it without modifying the other sites' shared registry. Normal builds are self-contained.
- Header search over every indexable page. The Pagefind index loads only after
  the visitor enters a query. Native modal, keyboard access, Escape, restored
  focus, loading/empty/error states, retry and council-directory fallback.
- Council sharing preserves the selected band. Comparison sharing preserves
  both councils, band and year. Native sharing, clipboard and selectable-link
  fallbacks are distinct from cancellation. Arbitrary URL parameters are excluded.
- Council social cards use generic band wording because a URL fragment cannot
  select different Open Graph metadata. They no longer show a fixed Band D price
  beside a link that may select another band.
- All 296 council pages receive an exact-GSS map. The SVG is rendered at build
  time with no client map library, tile provider or extra browser request. Maps
  follow the answer on mobile and sit alongside it on desktop.
- CSV export on council pages, comparisons, national, band and regional tables.
  Exports use the selected band and year; table exports use exactly the visible
  filtered/sorted rows. Comparison rows retain their selected order. Each row
  includes GSS, basis, source table/publication/revision, original file URL and
  checksum, licence and caveats. Missing values are omitted; text cells are
  escaped and spreadsheet formula prefixes neutralised.
- Print controls and styles preserve selected bands, comparison years, visible
  rows, sources and caveats. Scrolling tables expand; controls and navigation
  are hidden. The browser can save the print layout as PDF.
- Privacy copy describes local search, shared state and browser-generated CSVs.
  Built-output checks require search page count to match the sitemap.

## Reuse and provenance

Search adapts the native-dialog/lazy-index pattern from UK Elections at
`951dc2c4bfdcf87747f0947f872e5cb13ea0296a`. Sharing and build-time map rendering
adapt patterns from UK Demographics at `37feb75933d819b28c280c858d4641cddf57a485`.
The components are copied into this repo; neither site is a runtime dependency.
Search uses the [Pagefind post-build API](https://pagefind.app/docs/running-pagefind/).

The donor's 2024 geometry was not carried forward. Maps use
[ONS May 2026 boundaries](https://www.data.gov.uk/dataset/811be825-44a9-427d-bf7f-c34c75f616ef/local-authority-districts-may-2026-boundaries-uk-bsc),
updated 10 September 2026. `data/geography/source.json` records the exact query,
retrieval timestamp, checksum, generalisation, licence and attribution.
The source ArcGIS item's licence points to the
[ONS geographical licence rules](https://www.ons.gov.uk/methodology/geography/licences).
`node scripts/fetch-boundaries.mjs` refreshes deliberately; a normal build does
not fetch geometry. Coordinates are generalised for an illustrative thumbnail,
not a property or billing boundary. Rings are rewound for d3's spherical model;
unknown codes render no map. No inferred successor or name-only joins are used.

The local history chart from stage one is retained with its published-year
labels and source table. Missing years remain absent.

## Palette verification

| Pair | Contrast |
|---|---:|
| Deep blue on white | 7.19:1 |
| Deep blue on subtle background | 6.64:1 |
| Deep blue on blue wash | 6.53:1 |
| Pale blue on dark ground | 9.98:1 |
| Pale blue on dark blue wash | 8.10:1 |
| Faint text on light blue wash | 5.07:1 |

Browser accessibility checks cover both themes, 375px mobile and desktop,
including an open search dialog and 200% text. The first run caught header
wrapping at large text and Escape being consumed by the search input; both
were fixed before the final run. Simulated index failure verifies recovery.

## Release notes

No Google ranking or field-performance improvement is claimed from local tests.
Google News publication is outside this phase. School/election/spending datasets
remain separate source-integration work. The stage-one contact mailbox remains
unverified and is not presented as working. Existing dependency audit findings
remain documented in the stage-one record; no forced major framework upgrade
was mixed into this work.

## Transfer-size observation

Local gzip compression of generated HTML, using the same method as the
stage-one measurement. These figures include embedded data but exclude
separate JavaScript, fonts and images; they are not network timings or Core
Web Vitals.

| Page | Stage one gzip bytes | Phase two gzip bytes |
|---|---:|---:|
| Home page | 18,914 | 20,117 |
| Burnley council | 7,554 | 10,837 |
| North West table | 14,059 | 15,445 |

Maps add inline SVG and attribution. Export metadata adds original-file and
licence fields. Pagefind and its index are requested only after a query is
entered; d3 is confined to build-time map rendering.

## Final validation

- `npm test`: 73 passed.
- `npm run check`: zero errors, warnings or hints across 71 files.
- Fresh full build with `BUILD_OG=1`: passed; all social images rebuilt in blue.
- `npm run test:dist`: 326 pages, 325 sitemap URLs, every page referencing a built card; search index parity passed.
- `npm run test:e2e -- --workers=2`: 112 passed across mobile and desktop.
- `npm run test:csp -- --workers=2`: 41 passed with the actual Cloudflare headers.
- `git diff --check`: passed.
- Visually reviewed light and dark desktop/mobile views, the regenerated council
  card, and every page of a four-page A4 print sample. Print margins, source
  URLs, map attribution and selected Band H are retained.

The first full image build was interrupted to incorporate the print review.
Build caches were moved aside, then the complete fresh build and all final
checks above succeeded. No source tax values changed.

Preview: `http://127.0.0.1:4328/councils/burnley/`.
Review and publish only on an explicit deployment instruction. No commit,
push, remote workflow or deployment was performed.

## Archive handoff

Prepared for chat archival at Tom's request.

- Working checkout: `/Users/tompickup/ukcouncils`, branch `main`.
- Stage one and phase two changes remain on disk, uncommitted. Preserve tracked edits and untracked source, tests, data and documentation when resuming.
- No attached managed worktree or pull request requires archival.
- The preview on port 4328 was left running because its page is open in the app. If it stops, run `npm run preview -- --host 127.0.0.1 --port 4328` from this checkout after a successful build.
- Read `CLAUDE.md`, this record and the stage-one record before continuing. Review the existing changes before any new edits. Commit, push and deployment still require an explicit instruction.
- Outstanding: contact mailbox receipt remains unverified; original school/election integrations are separate future work.
