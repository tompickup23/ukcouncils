# Council budget release record

The C3 council budget section copies UK Council Tax at commit `85f7e33ef2cdc5c4f0a69b6c35209c86cc0cad5f`.
`data/budget/copy-manifest.json` records every copied path and its hashes. The three raw workbooks remain ignored.
The imported RA JSON reproduces the pinned donor byte for byte. Table 10 is a literal structural snapshot with complete source metadata and copiedFrom provenance.

The live sitemap snapshot in `data/links/ukcounciltax-budget.json` contains 296 billing routes verified on 9 November 2026.
Refresh it explicitly with `node scripts/check-ukcounciltax-budget-links.mjs`. Builds do not contact a sibling checkout.

The budget section contains observed service tables and signed financing and reserve calculations, each labelled by record type.
There is no local game, scenario, new route or download. Missing returns suppress the section; county budgets are never apportioned.
The complete acceptance evidence and decisions are in `docs/BUDGET-SECTION-REPORT.md`.
