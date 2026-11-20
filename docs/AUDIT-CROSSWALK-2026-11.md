# Audit identity crosswalk | 18 November 2026

Stage 1 implements the identity decision in UK Council Tax's [16 November record, section 2](https://github.com/tompickup23/ukcounciltax/blob/main/docs/DECISIONS-2026-11-16.md#2-plan-section-103). Stage 2, below, pins the printed answers through this crosswalk and renders them on profiles.

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

Stage 1 kept `data/audit/` out of `src/` with a source-catalogue exception. Stage 2 removed that exception and the import guard and added the page citation.

The branch is rebased onto `c5de1bf`. PR 66 changed only the generation date in the council-tax input, from 19 October to 18 November 2026. The audit manifest now pins that refreshed file after verifying that all other input content is identical. The offline rebuild leaves the crosswalk and dry run byte unchanged.

The original hosted number diff compared `78eb0ac` against main at `c5de1bf`, whereas the original local comparison used `6bc9b06`. The hosted 22 page differences include spending source dates refreshed by PR 66. Rebasing includes those existing main changes. No page allowance is requested and the PR description has no page allowance heading.

The protected dossier research dry run remains a known fault outside this PR. The stale registry pin that previously reported `Registry input changed` expects `1612175c6896119e35a908bc491c4ff76bd4e6e44e5a0d621d6557e5bcb98baf`; both main and this branch hold `92aaf1637f58501fdf1bee272d72923e2b49249f428fe53259175ba6727d4f1d`. After PR 66, the same command stops earlier with `Profile input changed`: the research profile pin is `8e40c590b5870c5da83bebffbd36f890a7441b6d218ff1f460c003fb09b9223d`, while main and this branch hold `bec0f1dc77f7d9cc71096b33b94a173f4039308678a7b48bb54281b3943205eb`. Neither protected research files nor the registry are changed here. The PR comments record final verification and hosted check results.

## Stage 2: pinned answers and profile lines | 18 November 2026

GOV.UK still showed 26 March 2026 as the latest update when checked again on 18 November 2026; the pinned edition is kept. Every cell of the three research tables matched the live page except the Merton pension label's dash, already recorded above.

[`values-2026-11-18.json`](../data/audit/values-2026-11-18.json) holds, for each of the 79 crosswalk profiles and each table it appears on, the column questions and the four answers exactly as printed: draft accounts, opinion delivered by the backstop, date delivered and opinion published. Capital `Yes` and `No` and `n/a` are kept as printed; dates stay in the printed `dd/mm/yy` form. The loader drops the appointed audit firm column when it reads the research table, so no firm name is in any value file. The values file and its [dry run](../data/audit/values-dry-run-2026-11-18.json) are regenerated by `--rebuild` and must reproduce byte for byte; unexpected fields, an unpinned file and any value for a profile without a crosswalk row each fail.

The asterisk follows four labels, all on the 27 February 2026 table: Basildon, Runnymede, Warrington and Woking. The brief expected five; the live page and the research both have four. The footnote printed immediately after that table is pinned as printed with its retrieval date of 18 November 2026 and is shown beside each starred line.

| Backstop | Profiles with lines | Starred |
|---|---:|---:|
| 13 December 2024 | 50 | 0 |
| 28 February 2025 | 32 | 0 |
| 27 February 2026 | 19 | 4 |
| Any table | 79 | 4 |

59 profiles are on one table, 18 on two and 2 (Gloucester and Warrington) on all three. Cumberland is on the 2025 and 2026 tables under its own name; the Copeland Borough Council row on the 2024 table is not attached to it.

The other 217 profiles carry one of three reasons, each tested against the crosswalk for every profile: no row on the lists (215); a row printed as North Yorkshire County Council, the council's name before 1 April 2023, on the 13 December 2024 list (North Yorkshire; the county council continued under a new name under SI 2022/328, and attaching the row is Tom's decision); a pension fund row only (Merton). Each reason says that absence from the lists is not a statement about the council's audits and that PSAA per body delivery data is not shown because its reuse terms have not been cleared. The PSAA reuse decision keeps its 15 December 2026 default, so these 217 absences move to out of scope from 16 December with the same text.

## H2: North Yorkshire identity review | 20 November 2026

Decision H2 in UK Council Tax's [19 November record](https://github.com/tompickup23/ukcounciltax/blob/main/docs/DECISIONS-2026-11-19.md) authorises attaching the row printed as North Yorkshire County Council to E06000065. Main before this change is `cbc3833`.

The raw XML of [The North Yorkshire (Structural Changes) Order 2022, SI 2022/328](https://www.legislation.gov.uk/uksi/2022/328/made/data.xml) was read on 20 November 2026. Article 2 defines the North Yorkshire Council as the council of the county. Article 3(1) makes that council the sole principal authority from 1 April 2023. Article 3(3) provides for removing the word county by resolution; it does not itself record that resolution. The [official council minutes, New Constitution for North Yorkshire Council](https://edemocracy.northyorks.gov.uk/mgAi.aspx?ID=11268) record the resolution to use The North Yorkshire Council from 1 April 2023. These sources support continuity of the body and the requested former name note. This is not a predecessor or successor assignment.

The GOV.UK publication page still shows 26 March 2026 as the latest update when checked on 20 November 2026. Audit answers will be regenerated only from the existing pinned research table. The research bytes, registry and held control labels stay unchanged. The pull request comments record the statutory wording, defaults and measured results.

The active manifest now pins the 20 November review, crosswalk, dry run, values and values dry run. The prior dated files remain unchanged. Original evidence and the footnote retain their original retrieval dates. Only the North Yorkshire residual decision changes: tier 2 assignment to E06000065, with the order and council minutes as evidence. The source edition and research input pins are unchanged.

Measured through the regenerated loader: 69 tier 1 profiles, 12 tier 2 profiles, 11 additional profiles and 80 in the union; 216 without an assigned row; no unresolved labels. The 2024 table reaches 51 profiles, with 32 and 19 on the other tables. There are 60 profiles on one table, 18 on two and two on all three. Four starred labels remain. The remaining unassigned county labels number four. Audit absences are 215 no-row profiles and Merton's one pension-only case. Cumberland's two entries and every other previously assigned value reproduce unchanged.

The sources catalogue now prints 80 and permits former names only with reviewed evidence for the continuing council. Only North Yorkshire and `sources/index.html` require a numeric allowance. The stage 1 research hash fault described above was repaired by PR 71 before base `cbc3833`; this change does not edit the protected research inputs or pins.
