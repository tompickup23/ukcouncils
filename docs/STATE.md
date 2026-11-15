# State | UK Councils | 15 November 2026

- **This PR:** `feat/dossier-gate-definition`, based on `origin/main` at `10febeb`; defines and enforces January dossier completion in `docs/DOSSIER-GATE.md`.
- **Scope:** all 296 English billing profiles; 329 HTML pages in the full build. Each dossier part is built from a pinned source, absent with a visible reason, or outside January under Tom's recorded default.
- **Page exception:** all 296 profiles need missing-information reasons. Only that coverage section is added; existing figures and sources are unchanged.
- **Build gate:** checks source expectations against HTML during `npm run build` and `npm run test:dist`; full local report in ignored `.ops/dossier-coverage.json`.
- **Decide by 15 December:** composition source, audit identity and reuse, original statutory notice register, C7 body scope and C9 contracts scope. Silence excludes those parts from January from 16 December, retaining page reasons.
- **School calendars:** 287 built; all nine missing calendars remain absent. Five council publications verified, Scilly academy source reached through council referral, Blackpool and City of London referrals only, South Tyneside original access blocked.
- **Research:** `docs/DOSSIER-SOURCES-2026-11.md`; no composition source or audit crosswalk adopted. Audit name diagnostics remain research only.
- **Registry:** untouched by this PR; a concurrent refresh may change `data/registry/councils.json` only.
- **Held data:** registry reorganisation field stays unread. Independent programme panels remain on 184 profiles. Seats by party remain held.
- **No new data:** no inferred calendar, audit status, notice register, composition or contracts dataset.
- **Other decisions:** X3 Actions billing, X4 worktree removal and the Shepway slug remain separate.
- **Weekly measurement:** recorded in tompickup23/ukcounciltax `docs/MEASUREMENT.md`.
- **Binding dates:** dossier complete by mid January 2027; necessary gate for the May to June 2027 reversal, alongside Search Console evidence.
- **Plan:** tompickup23/ukcounciltax `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`, section 10 on `docs/plan-lookahead-2026-11-15` until merged.
- **Release:** this PR authorises no merge, tag or deployment. Verification and number comparison results are in the PR body.
