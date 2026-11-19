# State | UK Councils | 19 November 2026

- **Live:** main `60b0153` (PR 71), deployed 18 November 2026 at 18:55. Open pull requests: this one only.
- **Merged on 18 November:** PR 64 (party totals and checked control), 65 (RA workbooks restored in the weekly refresh), 66 (data refresh), 67 (MHCLG audit identity crosswalk), 68 (section 114 notice register), 69 (control line wording), 70 (external audit status lines) and 71 (upkeep).
- **Dossier, three sources live:** 294 party tables and 129 control lines; 11 section 114 notice records on eight profiles; an External audit part on 79 profiles (50 on the 13 December 2024 list, 32 on 28 February 2025, 19 on 27 February 2026).
- **Audit source:** MHCLG non-compliance lists, updated 26 March 2026, information as at 9 March 2026, OGL v3.0, read through the PR 67 crosswalk into `data/audit/values-2026-11-18.json`. No audit firm column or name on any page.
- **Audit absences, with reasons:** 215 profiles with no row on the lists; North Yorkshire, a row under its name before 1 April 2023, not attached; Merton, pension fund row only. Cumberland is built from its own rows; the Copeland row is not attached or mentioned.
- **Control line:** says the snapshot was retrieved on its date, not recorded by the publisher (PR 69).
- **C3 roll-up:** built on Croydon, Nottingham and Woking; absent on 293.
- **Tooling (PR 71):** `npm run check:pr-body` reads a description with the hosted parser, run it before opening or editing a pull request; the research dry run passes with 8 hashes verified, and the two section 114 research files are hand maintained, pinned and never regenerated; the weekly refresh writes one line to its job summary saying whether the composition table still matches its pin. Read that line after the refresh on Monday 23 November.
- **Waiting on Tom:** whether to attach North Yorkshire's audit row (decision H2, by 15 December); the PSAA permission request is on hold at his word.
- **Still held:** PSAA per body audit data (reuse not cleared), registry reorganisation and other composition inputs; X1 funding bars, sparklines and history strips.
- **December fallback:** from 16 December the 217 audit absences move out of scope with the same text; PSAA audit data reuse, other body types and contracts stay out.
- **Check trap:** the number diff compares a branch with main as it is when the run starts. Marking a pull request ready fires a new run, so a branch that sits behind main fails on pages it never touched. This happened on PR 71: 82 pages, every differing number on the main side, from PR 70 merged 22 minutes earlier. Merge main in before marking ready, and read which side the numbers are on before believing the failure.
- **Binding dates:** dossier on all 296 profiles by mid January 2027; the May to June 2027 reversal also requires Search Console evidence.
- **Plan:** UK Council Tax `docs/PLAN-CURRENT.md` and `docs/DECISIONS-2026-11-16.md`. Review rules: `docs/REVIEW.md`.
