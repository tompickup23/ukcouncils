# Nearby and alike | 13 November 2026

Round two prompt 5 from UK Council Tax's `docs/CODEX-PROMPTS-2026-11-12.md`.
The prerequisite EFS PR 49 is merged into baseline `556f692`. This change is
prepared for review. It does not authorise a merge or deployment.

## Result

Every council profile has an open Nearby and alike section. Neighbours are
the areas whose outlines touch or cross in the pinned ONS England file (see
the review fix below; the first build matched identical points only, the
approach taken by UK Council Tax's game neighbours).
The existing boundary loader supplies the file; no sibling checkout is read
when building. County membership uses the registry's exact parent GSS code.
Every link shows the published council name and its registry type.

The existing similar-council list is retained. For a shire district it is
identical to the same-county list, so it appears once under Other districts
in the named county. Other council types retain their existing regional
similar list. County councils remain text, as they have no profile routes.
The original `similar` and `similar-heading` anchors remain, and the contents
now links to this section. The whole section has `data-pagefind-ignore`.

Small design decisions: links carry names and types without optional Band D
figures. This is an onward-navigation section and makes no financial comparison.
Lists remain fully open with or without scripts, using columns where space
allows. The source and coastline limitation are beside the boundary list.
An island that touches no other outline says so explicitly and retains its regional
similar-council links. No distance, travel connection or cross-water neighbour
is inferred.

## Dry run

`NEARBY-AND-ALIKE-DRY-RUN-2026-11-13.json` records every council's neighbour
and same-county GSS list and counts. `scripts/nearby-dry-run.py` produces it with Shapely line intersection, a
different implementation from the site's own integer segment test. Unit
tests reproduce every row using the TypeScript adapter and verify the input
checksum.

SHA256: `ffe3d197f7de454af01d377271b902b973a7757c297376bf4d5ac5241bd06d9e`.

| Measure | Count |
| --- | ---: |
| Council profiles | 296 |
| Directed boundary links | 1,506 |
| Reciprocal boundary pairs | 753 |
| Shire districts with same-county links | 164 |
| Directed same-county links | 1,244 |
| Boundary neighbours per council | 0 to 15 |

Burnley has five boundary neighbours and eleven other Lancashire districts.
Cornwall has two neighbours, Torridge and West Devon. The City
of London has five: Camden, Hackney, Islington, Tower Hamlets and Westminster.
The Isle of Wight and Isles of Scilly are the only councils with neither
boundary neighbours nor a same-county district list. The coastline-clipped
file does not connect opposite shores of tidal water, so the lists are
labelled by the exact method rather than as all nearby places.

## Verification

The tests cover all 296 profiles: exact dry-run reproduction, reciprocal
boundary joins, no self links, no missing destinations, all former similar
links retained, search exclusion, scripts-off access and no financial fields.
The browser cases cover Burnley, Cornwall, the Isle of Wight and the City of
London in both themes, with accessibility and overflow checks.

No existing assertion became obsolete. No source data, vendored kit file,
canonical, redirect or security-header policy changed.

The first distribution check rejected the new unitary type labels because the
held-wording guard recognises classifications only in established markup. The
component now uses the existing `row-detail` element and the original similar
classification paragraph. The guard and its tests are unchanged.

Node 22.23.4. Astro check has zero errors and warnings, with the existing
unused-variable hint in TaxTable. All 314 unit tests pass after the full
`BUILD_OG=1` build, with none skipped. The distribution check, including the
built text sweep, passes 329 pages and 328 sitemap URLs.

The independent baseline comparison covers all 329 HTML pages: no money token,
existing anchor or existing similar-council link is lost or changed. All 302
PNG files are byte-identical. The whole-build number comparison differs on
the 296 profiles only, solely by one added `2026` in the repeated ONS source
title on each page. It removes no number and changes no SVG text number.

| Burnley profile height | Baseline | Candidate |
| --- | ---: | ---: |
| 375 pixels wide, light and dark | 8,945 | 10,431 |
| 1440 pixels wide, light and dark | 6,275 | 6,811 |

The increase is the requested open onward-navigation list, which was previously
collapsed. All four sample profiles were captured and inspected at 375 and
1440 in both themes. All sixteen measurements have zero horizontal overflow.
Logs, baseline HTML and captures remain local under ignored `.cache/nearby/`
and `output/playwright/nearby/`.

All 370 browser tests pass with two workers, including the eighteen new
phone and desktop cases. All 57 actual-header CSP tests pass. No assertion,
timeout or security gate was relaxed. Owned preview servers and the manual
browser session were stopped after verification.

## Review fix, 13 November 2026

A review recomputed the neighbours from the same pinned file by polygon
geometry. All 747 pairs of the first build were confirmed. Six further pairs
touch or slightly overlap in the file but share no identical point, so the
first build gave them no link:

- Bexley and Sevenoaks
- Castle Point and Thurrock
- Hammersmith and Fulham and Richmond upon Thames
- Kensington and Chelsea and Wandsworth
- North Kesteven and South Holland
- North Northamptonshire and South Kesteven

The cause is in the source record (`data/geography/source.json`): the file
was requested with a generalisation tolerance of 0.001 degrees, applied to
each outline on its own, so two councils with a common border do not always
keep the same points. The method is now: two areas are neighbours when their
outlines touch or cross. Coordinates are scaled to whole units of 0.00001
degrees so the test is exact integer arithmetic. The result is 753 pairs
(1,506 directed links): the 747 plus these six, with none removed.

The first dry run was a second implementation of the same matching-points
method, so it could not have caught this. The dry run is now produced by
`scripts/nearby-dry-run.py` with Shapely, and a unit test also requires that
every matching-points pair is kept and that exactly the six pairs above are
added.

Limits that remain, and are stated beside the list on the page:

- No gap is bridged. Five pairs lie within about 110 metres of each other in
  the file without touching (Brent and Camden, Bromley and Lambeth, Rutland
  and Peterborough, Croydon and Southwark, Wandsworth and Westminster). Some
  of these may be true neighbours that the simplification pulled apart. They
  are not linked, because a distance rule would be an inference.
- Seventeen linked pairs meet at a single point only.
- A complete list would need an adjacency table built from a boundary file
  that keeps shared borders identical between neighbours. That is a new
  pinned source and a decision for Tom, not part of this fix.

Two smaller changes in the same pass: the type label is no longer repeated
on each link under "Other districts in" a county, since the heading says it;
and the empty-list sentence now reads "No neighbouring council area touches
this one in this map."

After the fix the Burnley profile measures 10,222 px at 375 wide (10,431 in
the first build, 8,945 before the section was opened) and 6,770 px at 1440
(6,811 and 6,275). Sevenoaks now lists Bexley among eight neighbours. Neither
page overflows sideways at either width.

Checks on the fix: Astro check with zero errors and warnings; a full
`BUILD_OG=1` build; all 316 unit tests with none skipped; the distribution
check for 329 pages and 328 sitemap URLs; and the browser suite.
