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

The owner resolved the stop condition in brief commit cd3535a. The helper and test now use `/re-?organi[sz]|unitary|abolish|structural change/i` and assert the seven named councils. Read all 174 quotes again: no further quote contains reorganisation or abolition wording in another spelling, and no quote names an individual. The seven retain their year and citation but their quotations will be withheld.

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
