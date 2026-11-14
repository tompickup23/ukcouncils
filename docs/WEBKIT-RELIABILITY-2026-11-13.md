# UK Councils and UK Council Tax | WebKit reliability review

13 November 2026. Tom selected Safari and reliability checks as the next
session after the five prepared round-two sessions had merged.

## Result

All 47 final scenario checks passed against the live sites. No reproducible
site fault was found in this scope, so no application code, source data,
canonical, redirect, security header or deployment was changed.

This is Playwright WebKit 27.2, revision 2391, on macOS. It closes the outstanding
WebKit source-drawer check from the 12 November handover. It is not a physical
iPhone Safari or VoiceOver check, and it does not certify every browser version
or every page. No accessibility conformance claim is made.

## Scope and evidence

The first interaction matrix used an isolated mobile WebKit context resized to
375 and 1440 CSS pixels, in light and dark. Separate desktop WebKit contexts
tested search, menus, theme persistence and comparison at the same widths.
Scripts-off contexts used 375 pixels. Requests went to the live origins and
therefore received their production security headers.

| Journey | Scenarios | Result |
|---|---:|---|
| UKC Burnley short citations | 4 | Click, repeat click after closing, direct fragment load, and opening with native link navigation cancelled |
| UKC Exceptional Financial Support | 4 | Keyboard selection, heading focus, repeat links, Back/Forward and absent-council explanation |
| UKC council picker | 4 | County/name matching, profile navigation, Back, no matches and reset |
| UKCT annual increases | 4 | Selected row focus and visibility, direct historical fragment, reopening a year and table retention |
| UKCT parish index | 4 | Council and region sorting, aria-sort, regional filtering and complete reset |
| UKCT Band D tables | 4 | One control set, same-class charge sort, name filtering and reset to all rows |
| UKCT council picker | 4 | County/name matching, profile navigation, Back, no matches and reset |
| Scripts off, both sites | 7 | Native drawers and complete source/table access |
| Search, menu and theme, both sites | 8 | Keyboard result access, Escape, restored search focus, phone menu, persisted theme and reset |
| UKCT comparison | 4 | Swap, Back/Forward, unchanged absolute difference and rejection of incompatible council classes |
| **Total** | **47** | **Passed** |

Every scenario with a layout measurement had zero horizontal page overflow.
Representative phone and wide screenshots were visually inspected, including
citations, the EFS heading and revision notes, the selected increases row,
filtered Band D controls and the parish table. The focused EFS heading and
selected increases row remained visible below the sticky header.

Scripts-off counts were checked against the existing page contracts: 20
Burnley source entries, 216 EFS figures in the council blocks, 1,291 increases
table rows, 214 parish index rows, and all 296 councils in each England picker
and the Band D tables. These are retention checks, not new upstream data audits.

Eight live documents returned successfully and their response headers and body
hashes were saved. All eight retained a script CSP without unsafe-inline.
No page errors occurred in the completed search/menu/theme scenarios. WebKit's
cross-origin-isolation warning was recorded; it did not prevent these journeys.

## Keyboard behaviour and initial failures

On macOS WebKit with its default keyboard behaviour, ordinary Tab skipped the
result links. Option-Tab reached the first result on both sites. The final
eight search scenarios use Option-Tab and assert that actual result focus.
The original eight failed Tab assumptions and the two diagnostic probes are
retained, not counted as passes. This agrees with
[Apple's Safari keyboard guidance](https://support.apple.com/guide/safari/keyboard-shortcuts-and-gestures-cpsh003/mac).
Do not change the site to override this browser preference. A future WebKit CI
lane must make the keyboard convention explicit rather than reuse Chromium's
Tab assertion unchanged.

The initial browser session timed out moving from UKC to UKCT and then reported
a Playwright WebKit target assertion. Both UKCT routes loaded in fresh sessions,
and the isolated-site matrix passed. This was not reproduced as a site defect.

The first increases verifier tried to read an HTTP status from a same-document
fragment navigation, for which Playwright returns no response. The verifier
was corrected to require status 200 when there is an HTTP response. All four
increases scenarios then passed, including the fragment and drawer assertions.
No product code or assertion of the intended interaction was weakened.

## Saved artifacts and current project state

Local evidence is in `output/playwright/safari-reliability-2026-11-13/` in the
UK Councils checkout. It includes `verified-results.json`, live response
headers and hashes, replay scripts, initial failures, corrected rerun logs,
browser snapshots and PNG captures. Replay scripts run through Playwright CLI's
`run-code --filename`; they are review tools, not an added CI suite.

At review, the latest successful main workflows were UKC `f1e33e6` and UKCT
`bcde00c`. The local main checkouts remain behind those revisions; no pull or
reset was used, and existing local notes and staging were preserved.

UKCT PR 67 remains open at `ecaff3043f40b6cad10cc3d5eadf449cec3749d5`, with its
site, number-diff and design checks successful. Its unmerged Nearby and alike
change was not included in this live review. PR 61 remains separate research.
Neither PR was merged. No commit, push, tag or deployment was made.

The immediate outstanding product step remains review of PR 67. A physical
iPhone check remains distinct from this WebKit result. Later map/chart work,
the kit gates pack and the budget-freeze build retain their existing decision
requirements; this browser review does not resolve them.
