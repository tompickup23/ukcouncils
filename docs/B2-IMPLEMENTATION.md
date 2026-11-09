# B2 implementation record

## Preconditions

Rebased `feat/front-door-content` onto `origin/main`, including B1 merge `2c7c9c0`. Confirmed `ProfileAbout` after the council tax answer and map, before the action links. The EFS component exists with id `exceptional-financial-support`.

## Decisions taken

* All changes and session records stay in this worktree, as requested. The external project plan is not edited.
* Keep source sheet names and table titles verbatim where the brief requires them for parsing or byte identity. They are source metadata, not prose separators.

## Item 1

Imported the pinned ONS workbook. All original validation checks retained. Output contains only the published all ages counts for 333 English rows. Exact GSS joins cover 294 pages, with Barnsley and Sheffield absent. All 164 shire districts have a county row.

Validation: `npm run check`, zero errors. `npm test`, 176 passed and 12 skipped because no build exists yet.

## Item 2

Copied the QRC4 importer with only source and output paths changed. The workbook hash matches and the output hash is `cecd26a16eb2123693596f4e34c7d10f1174d16f566771915043264b09def3a3`, byte identical to UK Council Tax. All 296 pages join directly, with no null rate.

Validation: `npm run check`, zero errors. `npm test`, 179 passed and 12 skipped.

### Decisions taken

* Collection null cells use `n/a`, as the binding site rule requires.
* The reader takes the collection filename year from its source manifest, preserving the existing year label guard.

## Stopped during item 3

Both pinned election inputs matched. The importer produced 174 records with the specified year and pattern counts. The item 3 work is uncommitted. Its checks passed: `npm run check`, zero errors; `npm test`, 183 passed and 12 skipped.

Reading all 174 quotes exposed the stop condition: new text other than a cited document title would print reorganisation content. South Oxfordshire (`E07000179`) and Vale of White Horse (`E07000180`) both quote: "The next scheduled elections District Council elections will be held on Thursday 6 May 2027, subject to any further changes resulting from local government re-organisation."

The brief's suppression expression matches five quotes but misses both hyphenated instances. Including these gives seven quotes containing held content. The expression has not been changed, no election component has been built, and work stopped before item 4. The full build and browser gates, screenshots, push and PR were not reached.

## Archive handoff

Saved at the user's request on 9 November 2026. Worktree: `/Users/tompickup/wt/ukc-front-door`. Branch: `feat/front-door-content`. Completed item commits: population `aa02a86`, collection `da127bb`.

The item 3 importer, pinned JSON helper, election data, reader and tests remain saved on disk but uncommitted, together with the council profile test adjustment and this handoff. No partial item commit was made. Validation logs are in `.cache/b2/`; downloaded workbooks are in ignored `data/raw/`.

Resume only after the owner resolves the quote suppression stop condition. Read `CLAUDE.md`, the binding source notes, the brief and this record first. Preserve the current uncommitted work. Resolve item 3 under the revised instructions, rerun checks and commit that item before starting item 4. Items 4 to 10, full validation, screenshot review, push and PR remain outstanding. Keep all held features absent and retain the first screen Band D check. Do not merge or deploy.

## Item 3 resumed

The owner resolved the stop condition in brief commit ce1408f. The helper and test now use `/re-?organi[sz]|unitary|abolish|structural change/i` and assert the seven named councils. Read all 174 quotes again: no further quote contains reorganisation or abolition wording in another spelling, and no quote names an individual. The seven retain their year and citation but their quotations will be withheld.

Validation: `npm run check`, zero errors and warnings; `npm test`, 183 passed and 12 skipped.

## Item 4

Imported the pinned UK Places Local Links file after hash verification. Retained source, check date and service metadata verbatim, with provenance and exact GSS joins. Only councils with at least one service link are included. All counts and anchor URLs match, including the published HTTP Scilly bins URL.

Validation: `npm run check`, zero errors and warnings; `npm test`, 186 passed and 12 skipped.

## Item 5

Added pure strip geometry and a server rendered SVG component with an accessible description, source, caveat and name ordered figures table. ProfileTax supplies same class Band D points. Tests cover every specified real data endpoint, the City collection endpoint, equal values, missing councils, nonfinite values and absence of scripts and literal colours.

Validation: `npm run check`, zero errors and warnings; `npm test`, 190 passed and 12 skipped.

### Decisions taken

* Tied endpoints use the first council name in en-GB order for both ends. Published values are never rounded; only SVG coordinates are rounded.

## Item 6

Extended the existing introduction in place with exact code population counts, the county's own count for shire districts, and the sourced service links. Each addition carries its source immediately below. Missing population and missing links produce no row. The original register name and source remain unchanged.

Validation: `npm run check`, zero errors and warnings; `npm test`, 192 passed and 12 skipped.

## Item 7

Copied the QRC4 collection wording and table, preserving printed precision and notes. Added the same class collection strip. The component omits an absent record and never supplies a missing rate. Page integration follows in item 9.

### Decisions taken

* Repeat the source directly under the rate sentence and the figures table, as well as inside the strip. This applies the binding source placement rule to every figure. A fourth copy at the section end, after the caveat and notes, was removed in review on 9 November 2026 because the line above the caveat already cites the table.
* Use n/a in the table caveat to match the binding null cell rule. An absent rate has no sentence or strip.

Validation: `npm run check`, zero errors and warnings; `npm test`, 192 passed and 12 skipped.

## Item 8

Added the elections section using only the 174 retained records. The seven held quotations are suppressed by the shared helper while their year sentence and citation remain. Pattern wording and the scheduled date caveat follow the brief. The optional results link comes only from sisterLinks. Page integration follows in item 9.

Validation: `npm run check`, zero errors and warnings; `npm test`, 192 passed and 12 skipped.

## Item 9

Integrated the components in the requested order and kept PageContents aligned. Profile sources now follow first appearance on the page and include the new datasets once each, plus B1's EFS citations. Added the four datasets to Sources and the profile rules to Methodology. Held features remain absent.

### Decisions taken

* Retain B1's `exceptional-financial-support` id in PROFILE_SECTIONS and add the profile marker to its existing section.
* The pinned election source has no licence field. Do not invent a licence; cite the register and each primary document.
* Keep the existing register name row unchanged, as required, while all new sentences use the tax table name.

Validation: `npm run check`, zero errors and warnings; `npm test`, 192 passed and 12 skipped.

## Item 10

Added built profile checks against source presence and exact values, peer counts by class, citation placement, quote suppression, accessible SVG, absence of client code, current table rows, section and contents order, every fixed anchor and aggregate coverage. Extended the built prose scan to spaced hyphens. Added source ordering and conditional citation tests.

Initial built coverage passed: collection 296, Band D strips 296, collection strips 296, population 294, elections 174, tax payment links 254 and EFS 51. The collection JSON still has the pinned output hash and is byte identical to the UK Council Tax copy.

### Decisions taken

* Rebased onto the merged B1 review follow-up at main 9ac807f. Kept its verified UK Council Tax source entry and extended its sources coverage test with the three new directories and Local Links. The item commits remain separate; rebase changed their hashes.
* Profile word counts use rendered text in every data-profile-section and the type line. They include source lists, the visible QRC4 table and EFS statements, and exclude the council tax answer and collapsed chart tables. Burnley is 1,234 words and Birmingham 2,092, above the 400 to 600 target. Retain the specified content and citations without padding or shortening it.
* Screenshots and local gate logs stay in ignored output/playwright/b2 and .cache/b2. Recaptured in an isolated headless session after the headed browser changed pages during capture.

### Visual review

Captured Burnley and Birmingham at 375 by 812 and 1440 by 1000, light and dark, with viewport and full page images and collection details. Captured the City of London collection strip at 375 pixels. Its 98.09% marker at the right end and its label are visible. Burnley's full Band D amount is visible at scroll position zero in both themes: the amount's bottom edge is 616.6 pixels in an 812 pixel viewport. No text was shortened.

The first regular build passed, followed by a successful BUILD_OG build. The final build is being repeated after the main refresh using BUILD_OG in the subprocess env block. Full final gate results follow below.

### Gate recovery

Astro's configured test server exited early because its background preview daemon was already serving port 4322. Confirmed with `npx astro preview status` and ran the browser suite with E2E_PORT set to 4322. The initial Wrangler startup timed out; a fresh local instance on port 8790 served the completed build and all 42 CSP tests passed.

The browser and CSP runs initially shared Playwright's output directory. Four browser tests reported missing trace files at context close while the concurrent CSP run cleaned that directory. Reran the browser suite on its own. The strip emphasis checker was also corrected to accept Astro's scoped attributes on strong elements; the rendered rows already contained both required strong elements.

### Final gate

* `npm run check`: zero errors and warnings.
* `npm test`: 206 passed across 27 files, none skipped.
* `npm run build` with BUILD_OG enabled in the env block: passed after the main refresh.
* `npm run test:dist`: 329 pages, 328 sitemap URLs, all 329 pages point at a built share card; every B2 count and anchor passed.
* `npm run test:e2e` with E2E_PORT 4322: 130 passed when run without a concurrent suite writing its artifacts.
* `npm run test:csp` with CSP_PORT 8790: 42 passed against a fresh Wrangler instance serving the final build.

The built tree passes the em dash, en dash and spaced hyphen prose checks. Read all 174 election quotes, with no named individual and no further reorganisation or abolition wording beyond the seven withheld quotations. The source placement checks cover every strip and population sentence, and the collection sentence and table each have an immediate citation. Missing data and held features remain absent. The final screenshots are the mobile viewport and full page files, desktop full page files and City collection strip in output/playwright/b2; earlier headed captures are under superseded.
