# State | UK Councils | 15 November 2026

Replace this file in each session's own pull request. At most 20 lines. Detail belongs in PR bodies.

- **Main:** `b06c7fc`, including the dossier (PR 54), Estate Kit drawings (PR 55) and the 0.6.1 class map fix (PR 56). Deployment not checked in this session.
- **Current PR:** `fix/function-names` uses registry official names in responsibility cells for SD, UA, MD, ILB and OLB. Missing names stop static generation.
- **Scope:** 292 of 294 tables change; Barnsley and Sheffield already match. The City of London and Isles of Scilly still have no table. All 21 county names need the existing suffix.
- **Validation:** 352 unit tests, type check, build, dist and text checks, and 38 profile browser checks pass. Exactly 1,260 responsibility cells change across 292 profiles; all other HTML is identical.
- **Data:** no registry edits or new sources. The registry reorganisation field remains held from 5 November.
- **Drawings:** the class map is on `/councils/`; service expenditure bars are on 287 profiles and in 21 county drawers. PR 56 removes county plates and repeated class labels.
- **Prior session decisions awaiting Tom:** the four class map colours and the stated treatment of the City of London and Isles of Scilly. No PNG downloads under the 8 November ruling.
- **Not drawn, waiting on Tom:** Exceptional Financial Support by year. MHCLG prints no yearly total and the stated figures mix bases. Funding share bars, sparkline tiles and history strips remain held (X1).
- **Remaining kit findings:** inline text is small at 375 because drawings use a fixed width of 600 units; boundary precision is simplified by the site.
- **Dossier, what remains:** `docs/DOSSIER-STATE-2026-11-14.md`. Blocked on sources as before.
- **Weekly from 17 November:** the measurement note.
- **Other decisions waiting on Tom:** X3 (Actions billing), X4 (removing worktrees).
- **Binding dates:** the dossier on all 296 profiles by mid January 2027; it gates the reversal in May to June 2027.
- **Plan for both sites:** tompickup23/ukcounciltax, `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`.
