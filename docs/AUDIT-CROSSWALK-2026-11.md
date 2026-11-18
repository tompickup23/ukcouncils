# Audit identity crosswalk | 18 November 2026

Stage 1 implements the identity decision in UK Council Tax's [16 November record, section 2](https://github.com/tompickup23/ukcounciltax/blob/main/docs/DECISIONS-2026-11-16.md#2-plan-section-103). No page imports this loader. The dossier gate and its existing audit absence remain unchanged.

The [MHCLG publication](https://www.gov.uk/government/publications/addressing-the-local-audit-backlog-in-england-non-compliance-lists) still showed **26 March 2026** as its latest update when checked on 18 November. Information is as at **9 March 2026**, under OGL v3.0. The manifest retains the research retrieval date and original response hash separately from this edition check. These are lists of bodies that did not publish by a backstop, not a census. The first table has **67 rows although the publisher says 68 bodies**. No row is added. A missing row is not evidence of anything.

Tier 1 selects the 296 billing profiles by GSS code and compares only registry `officialName`: lower case, replace each ampersand with `and`, remove one trailing `Council` and its preceding space. Nothing else changes. The reproduced research result is **69 profiles, zero ambiguity and 51 residual labels**. A changed count or ambiguity stops the loader. The registry is unchanged and no held property is accessed.

The [review](../data/audit/review-2026-11-18.json) records every residual label, its decision, official evidence URL, retrieval date, short extract and reasoning. Eleven labels are assigned, with ten additional profiles: Warrington has both a tier 1 label and a reviewed footnoted label. Forty labels are outside the billing set: county 5, police 12, fire 6, pension fund 1, combined authority 3 and other 13. Copeland and the former North Yorkshire county accounts are kept separate from current profiles. Salisbury is a parish council. Merton's pension fund entry is never assigned to main accounts. No fuzzy or predecessor join is used.

**Unresolved labels: none.** Labels retain their printed wording and footnote markers, subject to the existing research typography exception: Merton's pension label represents the original en dash as two spaces, `to`, two spaces. This meets the no-dash rule without dropping its pension qualifier; it is not a literal character-for-character transcription of that one label.

| Backstop and financial years | Source rows | Tier 1 profiles | Tier 2 profiles | Union | Profiles on no assigned list |
|---|---:|---:|---:|---:|---:|
| 13 December 2024, up to 2022/23 | 67 | 45 | 5 | 50 | 246 |
| 28 February 2025, 2023/24 | 50 | 30 | 2 | 32 | 264 |
| 27 February 2026, 2024/25 | 33 | 14 | 5 | 19 | 277 |
| All three tables | 150 | 69 | 11 | 79 | 217 |

The [crosswalk](../data/audit/crosswalk-2026-11-18.json) groups labels under unique profile codes and keeps each label's tier, evidence and table row locators, starting at body row 1 after the header. The [dry run](../data/audit/dry-run-2026-11-18.json) lists all reached and unreached profiles, residual classifications and counts. The 217 profiles on no assigned list have no mapped main-accounts row in these holdings; no publication, exemption, opinion or financial condition is inferred. Only identity and table membership are imported. No personal name, audit firm name or per-body PSAA value is retained in this addition.

Reproduce from the repository root with Node 22.23.4 first on PATH:

```sh
node scripts/lib/audit-crosswalk.mjs
node scripts/lib/audit-crosswalk.mjs --rebuild
npm test
npm run check
npm run build
npm run test:dist
node docs/dossier-sources-dry-run.mjs
node scripts/diff-numbers.mjs .ops/base-source/dist dist
```

The default loader verifies exact manifest inventories, SHA-256 pins, strict fields, identity joins and regenerated coverage. `--rebuild` verifies the pinned inputs and reviewed decisions before regenerating only the crosswalk, dry run and their manifest hashes. Review new evidence before updating any input or review pin; check for a later GOV.UK edition first and stop if one exists. Mutation tests cover unpinned values, unexpected fields, duplicate codes, missing evidence, changed identities and inconsistent coverage. Build the baseline from a clean archive of `6bc9b06` with the same dependencies and complete raw data. Stage 2 page work requires a later PR.

Two verification blockers are outside the permitted files. `tests/sources-coverage.test.ts` requires every dataset directory to appear in the page catalogue, so the new data-only `audit` directory fails that guard. Separately, the unchanged dossier research dry run fails on the clean base and candidate: its registry pin predates the short-name refresh in PR 61. The expected hash begins `1612175c`; the current registry hash begins `92aaf163`. Neither protected research files nor the registry are changed here. The draft PR records the remaining check results and the scope decisions needed to clear these blockers.

Verified: all 14 crosswalk tests; type check with zero errors and warnings; full base and candidate builds; distribution check with 329 pages and 328 sitemap URLs. The number diff reports 0 pages differing, added or removed; all 329 HTML files are also byte-identical. The final full-suite run, `npm test -- --maxWorkers=2`, has 390 passing tests and only the catalogue assertion failing. Earlier concurrent verification produced timeout failures which did not recur with two workers after the build finished.
