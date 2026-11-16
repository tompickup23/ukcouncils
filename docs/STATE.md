# State | UK Councils | 16 November 2026

- **Live:** main `ea036b7` (PR 62): January dossier completion gate on all 296 English billing profiles, defined in `docs/DOSSIER-GATE.md` and enforced in `npm run build` and `npm run test:dist`.
- **This PR:** `claude/u2-homepage-ea18c3`, U2 homepage on the existing tokens. H1 kept; two column hero with one search box (postcode or council name, GET to `/your-area/` without scripts, nothing in the URL); the England Band D figure and history line chart beside it with their source lines; a council-owned card row; then a "From UK Council Tax" band with Budget game and Set the budget, labelled as leaving the site.
- **Set links:** only for the councils in `data/links/ukcounciltax-set.json`, copied from UK Council Tax `data/pilots/budget-freeze-eligibility.json` with its SHA256 pinned and checked against the live UK Council Tax sitemap. Refresh with `node scripts/copy-ukcounciltax-set.mjs`; check drift with `--check`. `tests/ukcounciltax-set.test.ts` compares with UK Council Tax origin/main where that checkout exists.
- **Not changed:** profile pages, the dossier, the registry, navigation, footer, tokens, and the "What is not shown on this profile" wording.
- **Held data:** registry reorganisation field stays unread. Seats by party remain held. Funding share bars, sparkline tiles and history strips (X1) still held.
- **Next in the UKC lane** (ukcounciltax plan section 11.7): the council page network band (U3), which touches profile pages and needs Tom's yes.
- **Decide by 15 December:** composition source, audit identity and reuse, original statutory notice register, C7 body scope and C9 contracts scope.
- **Other decisions:** X3 Actions billing, the Shepway slug (rename in early December, one PR per site).
- **Weekly measurement:** tompickup23/ukcounciltax `docs/MEASUREMENT.md`.
- **Binding dates:** dossier complete on all 296 profiles by mid January 2027; it gates the May to June 2027 reversal, alongside Search Console evidence.
- **Plan:** tompickup23/ukcounciltax `docs/PLAN-2026-11-13-ASSESSMENT-AND-NEXT.md`, section 11; fast track in `docs/DECISIONS-2026-11-16.md`.
