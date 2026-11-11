# Council budget release record

The C3 council budget section copies UK Council Tax at commit `85f7e33ef2cdc5c4f0a69b6c35209c86cc0cad5f`.
`data/budget/copy-manifest.json` records every copied path and its hashes. The three raw workbooks remain ignored.
The imported RA JSON reproduces the pinned donor byte for byte. Table 10 is a literal structural snapshot with complete source metadata and copiedFrom provenance.

The live sitemap snapshot in `data/links/ukcounciltax-budget.json` contains 296 billing routes verified on 9 November 2026.
Refresh it explicitly with `node scripts/check-ukcounciltax-budget-links.mjs`. Builds do not contact a sibling checkout.

The budget section contains observed service tables and signed financing and reserve calculations, each labelled by record type.
There is no local game, scenario, new route or download. Missing returns suppress the section; county budgets are never apportioned.
The complete acceptance evidence and decisions are in `docs/BUDGET-SECTION-REPORT.md`.

## Reviewed local links refresh, 11 November 2026

Imported the UK Places reviewed export from commit
`2bea52dbe74c7a689a500b3b73ff63dcefb900b6`, file `src/data/local-links.json`.
SHA256: `085eb3b0511aca0f3fad79a9aa3f0decd5a7b5529240229ceed7731b3fb0b617`.
The export date and checked date are both 11 November 2026. The importer retains
its hash, registry, URL and exact coverage checks with the new snapshot pins.

The 296 council profiles now have 266 three-action rows and 30 two-action rows,
previously 254 and 42. There are 272 councils with at least one reviewed service
link: 266 payment links and 218 bin links. Payment links have 13 additions,
14 changed URLs and the expected Halton removal. Bin links have 11 additions,
four changed URLs and no removals. The refresh affects links for 34 authorities.

The existing source list gains its Local Links citation on 15 profiles and loses
it on Halton. The displayed source counts follow those changes; this was approved
as part of the refresh. Published financial figures and rendering code are unchanged.
The source remains the reviewed UK Places export; this import does not make a
new claim that this site checked each destination. No merge or deployment is
part of this change.

Validation on Node 22.23.4: zero Astro errors or warnings, 295 unit tests,
a full build with share cards, the distribution check, all 292 browser tests
including two successful reruns, and 49 production-header CSP tests. The first
share-card build and two browser checks encountered local disk pressure; the
full build and failed browser checks passed after space recovered. The number
comparison has 274 changed pages, all limited to the citation dates and approved
source counts, with no added or removed pages and no SVG figure changes.
