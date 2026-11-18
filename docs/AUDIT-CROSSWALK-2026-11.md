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

The default loader verifies exact manifest inventories, SHA-256 pins, strict fields, identity joins and regenerated coverage. `--rebuild` verifies the pinned inputs and reviewed decisions before regenerating only the crosswalk, dry run and their manifest hashes. Review new evidence before updating any input or review pin; check for a later GOV.UK edition first and stop if one exists. Mutation tests cover unpinned values, unexpected fields, duplicate codes, missing evidence, changed identities and inconsistent coverage. Build the baseline from a clean archive of the rebased main commit `c5de1bf` with the same dependencies and complete raw data. Stage 2 page work requires a later PR.

The source-catalogue test explicitly treats `data/audit/` as a staged dataset with no page citation yet. It also rejects audit crosswalk references anywhere under `src/`, including loader imports and direct data reads. Stage 2 must add the page citation and remove this exception.

The branch is rebased onto `c5de1bf`. PR 66 changed only the generation date in the council-tax input, from 19 October to 18 November 2026. The audit manifest now pins that refreshed file after verifying that all other input content is identical. The offline rebuild leaves the crosswalk and dry run byte unchanged.

The original hosted number diff compared `78eb0ac` against main at `c5de1bf`, whereas the original local comparison used `6bc9b06`. The hosted 22 page differences include spending source dates refreshed by PR 66. Rebasing includes those existing main changes. No page allowance is requested and the PR description has no page allowance heading.

The protected dossier research dry run remains a known fault outside this PR. The stale registry pin that previously reported `Registry input changed` expects `1612175c6896119e35a908bc491c4ff76bd4e6e44e5a0d621d6557e5bcb98baf`; both main and this branch hold `92aaf1637f58501fdf1bee272d72923e2b49249f428fe53259175ba6727d4f1d`. After PR 66, the same command stops earlier with `Profile input changed`: the research profile pin is `8e40c590b5870c5da83bebffbd36f890a7441b6d218ff1f460c003fb09b9223d`, while main and this branch hold `bec0f1dc77f7d9cc71096b33b94a173f4039308678a7b48bb54281b3943205eb`. Neither protected research files nor the registry are changed here. The PR comments record final verification and hosted check results.
