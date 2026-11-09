# EFS I007 archive handoff

Saved on 8 November 2026 at the user's request before archiving the chat.

## Workspace and permissions

Continue only in `/Users/tompickup/wt/ukc-efs`, branch `feat/efs-by-year`.
HEAD is `0959819` (curated EFS data, source notes and brief).
The worktree remains available. Nothing was committed, pushed, merged or deployed.
No PR was opened. The user requested one commit per completed phase, then a push
and one PR; the phase 1 stop condition prevented that sequence.

Before resuming, read the guides in the original requested order, then
`docs/EFS-SOURCE-NOTES.md` and `docs/EFS-BRIEF.md`. The source notes are binding.
Never edit `data/efs/statements.json` or `data/efs/raw/`. Leave every file reserved
for PR 13 or PR 30 in the brief untouched. Preserve the stop conditions.

## Work saved locally

These implementation files are unfinished and uncommitted:

- `src/lib/efs.ts`: typed data loader using `process.cwd()`, grouping helpers.
- `scripts/lib/efs-source.mjs`: table extraction and source comparison helpers.
- `scripts/check-efs-source.mjs`: proposed manual, read-only GOV.UK change check.
- `tests/efs.test.ts`: offline integrity tests and change-check tests.
- `package.json`: adds `data:efs-check`.

Dependencies were installed with `npm ci`. The installation log is in
`.cache/efs/install.log`. The source test log is in
`.cache/efs/phase-1-source-tests.log`. This handoff is also uncommitted.

## Mandatory stop reached

`npx vitest run tests/efs.test.ts` returned 7 passing tests and 3 failures.
Work stopped at the cell-hash gate. Do not treat this as completed phase 1.

All seven raw body hashes passed. Every curated amount was found exactly as
printed in its extracted source cell. Table row counts, documented figure roles,
grouping coverage and recomputation of all 11 multiple-figure cases passed.

The six Birmingham revised-profile statements, numbered 121 to 126 in the
curated statements array using one-based numbering, have cell hashes that differ
from those computed by the new extractor. All are on the 2026-27 source page.

| Support year | Stored SHA-256 | Extractor SHA-256 |
| --- | --- | --- |
| 2020/21 | cd1ac3514bfd49d718815d9577422e439a5e5806d2e3b3f9f1dc3092bc43a5d4 | 83cbfb339e1b76b8e51460b9642932d28aa7dcc68c6ad8961ff341c874ec2474 |
| 2021/22 | f41db4db2160cf79d3d0e5600affae60a527cc7f667059d62deffcebf98ed2ff | e2ee11da5e5a87cad14ffb7fa0485b746d87108175ada5d68b88823b7e44265a |
| 2022/23 | 4a9c0ff2bbe6d4038742371c2f07d4d5c191a0e9086df9d7855bec45c24584d3 | 229250c29783d4a76dff84d7a7856ac5932e1ac123fdcad3de10e6601c785bf5 |
| 2023/24 | 300e305b43d4d7ddc6bc14303161eef3725de5773847c870c88d90ce4f7f0494 | 912b2106829bc36434f9d86e67c79db9b636f302ac19cb13b5683d04fc54c5dd |
| 2024/25 | 26eb8d1ec4a53255ede6b6c68267f4e7b58f835736d47b89011b99af7fc7faab | 03b0c8192b3830b91d7cc44cf0172e8148561a13bed0a457e0b9512976cbabcb |
| 2025/26 | 1c5d6db4860c871f174f7de55d752ba1a98ff7d517c8d6ebe87bf893fda5c06e | b2837ac9c9d8b41055fe0d74f598ad772ad6233900ce298ac1a97b3eed79c3c0 |

Two failing tests involve these hashes: statement extraction and the unchanged
source comparison. This is not evidence that the curated amounts are wrong.
The original hashing convention for the Birmingham rows needs clarification.
The extractor hashes the normalised amount-cell text. A read-only diagnostic
also tried year plus space plus cell, year plus colon and space plus cell, and
year plus pipe plus cell; none matched. No stored hashes or source files changed.

The third failure is an implementation error in the new registry test:
`registry.councils.map is not a function`. The registry holds an object, not an
array. This is not a source-data defect. It remains unfixed because work stopped
at the hash gate.

## Remaining work

Clarify the Birmingham hash convention and obtain direction to resume after the
reported stop. Then correct and validate phase 1, including the registry test.
Do not weaken the integrity tests or change the protected data to clear them.

The full unit suite, type check, builds, built-tree checks, browser tests, CSP
checks and live `data:efs-check` have not run. The change-check script is unproven
against the live API. No page, navigation entry, sitemap wiring, OG card,
JSON-LD decision or screenshots have been implemented. Phases 2 to 4 remain.
The eventual PR must include all evidence and the exact closing credit required
by the brief. C3 council-page links and C2b future-year ingestion remain deferred.

All files reserved for PRs 13 and 30 were untouched. The protected EFS data was
unchanged at archive preparation. The shared plan outside this worktree was not
edited because the user restricted work to this worktree.
