# State | UK Councils | 16 November 2026

- **Live:** main `af18fa2` (PR 61): UK Places short name for E07000112 is Folkestone and Hythe. Slug `shepway` remains pending a separate decision.
- **This PR:** `feat/dossier-gate-definition` (PR 62), brought up to date with main at `af18fa2` by an ordinary merge on 16 November 2026. Defines and enforces January dossier completion in `docs/DOSSIER-GATE.md`. Review only, no merge or deployment.
- **Scope:** all 296 English billing profiles; 329 HTML pages in the full build. Each dossier part is built from a pinned source, absent with a visible reason, or outside January under Tom's recorded default.
- **Page exception:** all 296 profiles gain the section "What is not shown on this profile". Existing figures and sources are unchanged.
- **Build gate:** checks source expectations against HTML during `npm run build` and `npm run test:dist`; full local report in ignored `.ops/dossier-coverage.json`.
- **Decide by 15 December:** composition source, audit identity and reuse, original statutory notice register, C7 body scope and C9 contracts scope. Silence excludes those parts from January from 16 December, retaining page reasons.
- **School calendars:** 287 built; all nine missing calendars remain absent.
- **Registry:** `data/registry/councils.json` equals main; this PR does not change it. The gate appendix is keyed by slug, so the PR 61 short name needs no regeneration.
- **Held data:** registry reorganisation field stays unread. Seats by party remain held. Funding share bars, sparkline tiles and history strips (X1) still held.
- **Next in the UKC lane** (ukcounciltax plan section 11.7): after PR 62 merges, U2 homepage, then the council page network band.
- **Other decisions:** X3 Actions billing, X4 worktree removal, the Shepway slug, the seats by party source.
- **Weekly measurement:** tompickup23/ukcounciltax `docs/MEASUREMENT.md`.
- **Binding dates:** dossier complete on all 296 profiles by mid January 2027; it gates the May to June 2027 reversal, alongside Search Console evidence.
- **Plan:** tompickup23/ukcounciltax `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`, section 11.
