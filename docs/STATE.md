# State | UK Councils | 15 November 2026

- **Live:** main `f4311a8` (PR 58): registry refreshed from UK Places, 290 official names, 97 county changes, official names in responsibility tables (PR 57 folded in). Published with IndexNow.
- **This branch:** `data/registry-refresh-2026-11b`, based on `origin/main` at `10febeb`; companion branch in UK Council Tax. Review only, no merge or deployment.
- **Held data:** all 14 registry reorganisation objects unchanged and not rendered. Seats by party held on a source decision (B2 source notes, section 5).
- **This refresh:** UK Places short name for E07000112 is now Folkestone and Hythe. Imported through the existing registry route; every other field is unchanged. Slug `shepway` remains pending a separate decision.
- **Dossier:** remaining source gaps in `docs/DOSSIER-STATE-2026-11-14.md`. Next session here is the dossier source pass (audit status, section 114, seats by party options), prompt 2 of the file below.
- **Still held:** funding share bars, sparkline tiles and history strips (X1). Exceptional Financial Support by year is not drawn.
- **Decisions waiting:** X3 Actions billing, X4 worktree removal, the Shepway slug, the seats by party source.
- **Weekly from 17 November:** the measurement note, kept in tompickup23/ukcounciltax `docs/MEASUREMENT.md`.
- **Binding dates:** the dossier on all 296 profiles by mid January 2027; it gates the reversal in May to June 2027.
- **Plan and prompts for both sites:** tompickup23/ukcounciltax, `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md` section 8 and `docs/PROMPTS-2026-11-15-NEXT.md`.
- **PR 60 update:** draft source research in `docs/DOSSIER-SOURCES-2026-11.md`; composition files removed, recoverable from `3e708ae`.
- **Audit diagnostic:** exact codes 0/296; permitted official-name comparison MHCLG 69/296, PSAA 259/296; no crosswalk adopted.
- **Research storage:** audit and notice evidence in `docs/dossier-sources-2026-11/`; both data guards unchanged; rebased after PR 59.
- **Refresh verification:** all 329 HTML pages and shared outputs byte identical; zero numeric differences; 352 unit tests, distribution audit and 57 production-CSP cases pass. Both registries have the same SHA256, recorded in the PR.
