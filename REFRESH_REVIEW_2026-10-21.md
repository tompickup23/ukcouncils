# Refresh fold review, 21 October 2026

Weekly `refresh-data.yml` ran on 5, 12 and 19 October 2026 and failed at the
final step with "GitHub Actions is not permitted to create or approve pull
requests". The generated data remained on remote branches. Live `main` still
serves the 28 September refresh (`3a73223`).

This fold takes **only** `origin/data/refresh-2026-10-19` (file copy, not a
merge of branch history). That branch covers the same four paths as the earlier
two, with later `generated` stamps and a spending year-key set that contains
every year present on 5 and 12 October. The 5 and 12 October branches are left
in place for deletion after this PR merges.

## Remote branches reviewed

| Branch | Tip | Files vs `origin/main` |
|---|---|---|
| `data/refresh-2026-10-05` | `8553dd2` | same four paths |
| `data/refresh-2026-10-12` | `de81924` | same four paths |
| `data/refresh-2026-10-19` | `2a66faa` | same four paths |

Paths on every branch:

- `data/council-tax/england-2024-25.json`
- `data/council-tax/england-2025-26.json`
- `data/council-tax/england-2026-27.json`
- `data/spending/aidoge-summaries.json`

Also present remotely (not part of this fold): `data/refresh-2026-09-28`
(already merged as #12).

## Fold decision

19 October is a **superset** of 5 and 12 October for these files:

- Same file set.
- Council tax payloads identical aside from the `generated` stamp; 19 October
  carries `2026-10-19`.
- Spending body count unchanged; every financial year key on 5 or 12 October is
  present on 19 October; no body `generated` date moves backwards from 5 or 12
  to 19; no record or `monthsHeld` drop from 5 or 12 to 19.

Therefore this PR copies the four files from `origin/data/refresh-2026-10-19`
alone.

## Per-file summary (main `3a73223` → folded 19 October)

### `data/council-tax/england-2024-25.json`

| | Before (main) | After (19 Oct) |
|---|---|---|
| Authorities | 296 | 296 |
| Counties | 21 | 21 |
| Newest date (`generated`) | 2026-09-28 | 2026-10-19 |
| Keys disappeared | none | |
| Numeric field → negative or to zero from non-zero | none | |

Payload equal to main once `generated` is ignored. Source table hashes and
band figures unchanged. Same story on the 5 and 12 October branches, with
stamps `2026-10-05` and `2026-10-12`.

### `data/council-tax/england-2025-26.json`

| | Before (main) | After (19 Oct) |
|---|---|---|
| Authorities | 296 | 296 |
| Counties | 21 | 21 |
| Newest date (`generated`) | 2026-09-28 | 2026-10-19 |
| Keys disappeared | none | |
| Numeric field → negative or to zero from non-zero | none | |

Payload equal to main once `generated` is ignored.

### `data/council-tax/england-2026-27.json`

| | Before (main) | After (19 Oct) |
|---|---|---|
| Authorities | 296 | 296 |
| Counties | 21 | 21 |
| Newest date (`generated`) | 2026-09-28 | 2026-10-19 |
| Keys disappeared | none | |
| Numeric field → negative or to zero from non-zero | none | |

Payload equal to main once `generated` is ignored.

### `data/spending/aidoge-summaries.json`

| | Before (main) | After (19 Oct) |
|---|---|---|
| Bodies (record count) | 234 | 234 |
| Counts | mapped 234, held 234, headline 228, bank 212 | same |
| File `generated` | 2026-09-28 | 2026-10-19 |
| Source summaries `generated` | 2026-09-28 | 2026-10-19 |
| Source banks `generated` | 2026-09-28 | 2026-10-19 |
| Bodies removed / added | none / none | |
| Top-level or body schema keys disappeared | none | |
| Numeric field → negative | none | |
| Numeric field → zero from non-zero | none | |
| Bodies with any content change | 49 | |

Material spending movement (main → 19 October):

- **30 financial year slots added** under existing bodies (historical years and
  new `2026/27` coverage for some authorities). Examples: Hartlepool gains
  `2022/23`; South Tyneside gains several earlier years plus `2026/27`;
  Stafford, Nuneaton and Bedworth, Sandwell, Walsall, Calderdale, Wakefield and
  Gateshead gain `2026/27`.
- **One body with lower headline figures** versus main: `E06000038` (Reading),
  `2025/26` records 47512 → 47510; headline `totalNet` 481105297.6 →
  480224147.65. Present on the refresh branches as published by AI DOGE; not
  edited by hand.
- Progressive body updates across the three weekly runs (39 bodies changed by
  5 Oct, further updates by 12 and 19 Oct). 19 October retains all year keys
  introduced earlier.

Intermediate branch notes:

- 5 Oct: source summaries and banks `generated` 2026-10-05; 39 bodies changed
  vs main; years added as above (minus the seven `2026/27` slots that appear
  only on 19 Oct).
- 12 Oct: file `generated` 2026-10-12; banks source `generated` 2026-10-07;
  summaries source still 2026-10-05; 32 further body stamp or bank-linked
  updates vs 5 Oct; no year keys beyond 5 Oct.
- 19 Oct: both source stamps 2026-10-19; seven additional `2026/27` year slots;
  42 bodies changed vs 12 Oct.

## Workflow change in this PR

`.github/workflows/refresh-data.yml` still pushes the refresh branch and still
attempts `gh pr create`. If create is refused, the job writes the branch name
and a compare URL to `$GITHUB_STEP_SUMMARY` and exits 0, so the validated data
is not stranded by a repository permission. When "Allow GitHub Actions to
create and approve pull requests" is enabled, the existing PR path remains.

## Validation on this fold

Run in the worktree after copying the 19 October files. Data was not edited
by hand.

| Command | Result |
|---|---|
| `npm ci` | ok |
| `npm test` | 8 files, 86 tests passed |
| `npm run check` | Result (77 files): 0 errors |
| `npm run build` | 326 pages built; Pagefind indexed 325 pages; CSP hashes written |

No data check failed.

## Left for Tom (not done here)

1. Add repository secret `CLOUDFLARE_API_TOKEN` so `deploy.yml` can publish.
2. Enable "Allow GitHub Actions to create and approve pull requests" in the
   repository settings so future weekly refreshes open PRs again.
3. After this PR merges, deploy by hand with wrangler (as in the README),
   because `deploy.yml` cannot run without the secret.
4. Delete remote branches `data/refresh-2026-10-05`, `data/refresh-2026-10-12`
   and `data/refresh-2026-10-19` once this fold is on `main`.
