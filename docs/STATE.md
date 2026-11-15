# State | UK Councils | 15 November 2026

- **This PR:** registry refresh from live UK Places on `data/registry-refresh-2026-11`, based on `origin/main` at `b06c7fc`.
- **Registry:** 361 authorities; 290 official name changes; the brief's exact 97 county changes; seven added sister URLs across five councils. All other council fields are unchanged.
- **Responsibilities:** cherry picked `8ea2e12` from PR 57 without a separate commit, then updated its tests to the refreshed official names. The replacement PR covers both changes and their combined number comparison.
- **Held data:** all 14 registry reorganisation objects are unchanged and remain unread by rendering. Existing independently sourced panels are unchanged.
- **Sister policies:** UK Food Hygiene stays excluded from rendering. Barnsley and Sheffield gain verified UK Demographics links.
- **UK Council Tax:** companion refresh uses this exact export; both registries are byte identical. Neither PR authorises a merge or deployment.
- **Source limitation:** UK Places still exports short name and slug `Shepway`; the official name is now Folkestone and Hythe District Council.
- **Verification:** exact field changes, affected pages and final checks belong in this PR body.
- **Still held:** funding share bars, sparkline tiles and history strips (X1).
- **Not drawn:** Exceptional Financial Support by year; the published figures mix bases and have no yearly total.
- **Dossier:** remaining source gaps are in `docs/DOSSIER-STATE-2026-11-14.md`.
- **Weekly from 17 November:** the measurement note.
- **Decisions waiting:** X3 Actions billing and X4 worktree removal.
- **Binding dates:** the dossier on all 296 profiles by mid January 2027; it gates the reversal in May to June 2027.
- **Plan for both sites:** tompickup23/ukcounciltax, `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`.
