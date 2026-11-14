# EFS archive handoff

Saved on 8 November 2026 at the user's request before archiving this chat.

## Saved implementation

- Worktree: `~/wt/ukc-efs`.
- Branch: `feat/efs-by-year`.
- Local and pushed HEAD: `3725f9f61b372bc86199875c6a72735e0caabb78`.
- PR: https://github.com/tompickup23/ukcouncils/pull/31
- PR title: Exceptional Financial Support by year (I007).
- PR remains open and mergeable. Nothing was merged or deployed.
- Keep the worktree available for review. This archive handoff is local and uncommitted; the implementation was clean and fully pushed before this file was added. No additional implementation commit is needed.

## Completed phases

1. `eb99954`: EFS data module and source checks. The Birmingham revised rows use the documented year-cell join for their hashes. The registry test reads the object keyed by GSS. Every integrity assertion remains intact.
2. `f205fec`: Exceptional Financial Support page. All figures, markings, roles, notes and sources are retained in the year and authority views. The static route was included here to preserve the existing sitemap test.
3. `b0d28cd`: Wire EFS page and checks. Navigation, title-only OG card and browser tests. No new client scripts or CSP policy changes.
4. `3725f9f`: Document EFS review evidence. Full report and eight screenshots are committed and included in the PR.

Read `docs/EFS-REVIEW-2026-11-08.md` for the implementation decisions, verification summaries, exact protected file list and screenshot links. The PR ends with the required credit.

## Validation

Local validation completed successfully:

- 164 unit tests across 14 files, with no skips after the build.
- Type check: 0 errors, 0 warnings, 0 hints.
- 128 mobile and desktop browser tests.
- 44 production security-header tests.
- Standard and full OG builds: 329 pages, 328 Pagefind pages; the full build generated 301 share cards.
- Final built-tree check: all 329 pages point to built share cards; 329 pages and 328 sitemap URLs passed.
- The live GOV.UK check ran once: collection and seven year pages checked, all 126 rows unchanged, no files written.

At archive preparation, GitHub CI `validate` had succeeded. `Build and browser tests` was still running:
https://github.com/tompickup23/ukcouncils/actions/runs/42535593767
Check its final result before any later review or merge. Archiving is not a claim that this remaining remote job has completed.

## Resume rules and remaining scope

Read `CLAUDE.md`, `docs/EFS-SOURCE-NOTES.md` and `docs/EFS-BRIEF.md` before making further changes. The earlier `docs/EFS-HANDOFF-2026-11-08.md` records the historical stop, which was resolved by the authorised convention and registry correction in this session.

Never edit `data/efs/statements.json` or `data/efs/raw/`. They remain unchanged from the resumed baseline `3f1450e`. All files reserved for PR 13 and PR 30, including their complete actual file lists, remain untouched. Retain all stop conditions and source integrity tests.

C3 council-page links and C2b future-year curation remain deferred. No capitalisation direction PDF, assurance review or request-letter work was added. No further implementation is pending for phases 1 to 4.

Any merge or deployment needs a separate explicit instruction. Do not archive or remove this worktree. The shared plan outside the requested worktree was not edited. The task's temporary preview servers were stopped.
