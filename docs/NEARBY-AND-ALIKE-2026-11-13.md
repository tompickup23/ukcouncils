# Nearby and alike | 13 November 2026

Round two prompt 5 from UK Council Tax's `docs/CODEX-PROMPTS-2026-11-12.md`.
The prerequisite EFS PR 49 is merged into baseline `556f692`. This change is
prepared for review. It does not authorise a merge or deployment.

## Result

Every council profile has an open Nearby and alike section. Neighbours come
from shared boundary points at five decimal places in the pinned ONS England
file, using the approach already taken by UK Council Tax's game neighbours.
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
An island with no shared point says so explicitly and retains its regional
similar-council links. No distance, travel connection or cross-water neighbour
is inferred.

## Dry run

`NEARBY-AND-ALIKE-DRY-RUN-2026-11-13.json` records every council's neighbour
and same-county GSS list and counts. An independent Python traversal of the
raw pinned GeoJSON produced it before implementation. Unit tests reproduce
every row using the TypeScript adapter and verify the input checksum.

SHA256: `083856841a45426914b2cf5c38dcaef75e2d54b2c5bd4af5b9dcd07b86d21527`.

| Measure | Count |
| --- | ---: |
| Council profiles | 296 |
| Directed boundary links | 1,494 |
| Reciprocal boundary pairs | 747 |
| Shire districts with same-county links | 164 |
| Directed same-county links | 1,244 |
| Boundary neighbours per council | 0 to 15 |

Burnley has five boundary neighbours and eleven other Lancashire districts.
Cornwall has two shared-point neighbours, Torridge and West Devon. The City
of London has five: Camden, Hackney, Islington, Tower Hamlets and Westminster.
The Isle of Wight and Isles of Scilly are the only councils with neither
boundary neighbours nor a same-county district list. The coastline-clipped
file does not connect opposite shores of tidal water, so the lists are
labelled by the exact shared-point method rather than as all nearby places.

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
