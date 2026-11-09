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
