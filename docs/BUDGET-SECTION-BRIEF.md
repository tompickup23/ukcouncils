# Council budget section on UK Councils | Codex brief (C3)

Written 8 November 2026 in Claude Code. It puts the observed 2026/27 budget (MHCLG RA returns) on each English UK Councils council page, with no game and no scenario, linking to the budget game on UK Council Tax. All source work is done: the binding source notes are UK Council Tax's `docs/BUDGET-GAME-SOURCE-NOTES.md` (on its main branch once the budget game PR merges), and this brief only adds the rules UK Councils needs.

## When to start

All three must be true. Check each first, and stop and report if any is not:
1. The UK Council Tax budget game PR (branch `feat/budget-game-i001`) has **merged and deployed**. Confirm `https://ukcounciltax.co.uk/sitemap.xml` lists `/tools/budget/burnley/`.
2. ukcouncils PR 30 (council profile sections) has merged. This branch was cut from main before that. Rebase onto `origin/main` first, and confirm `src/lib/council-profile.ts` and `PROFILE_SECTIONS` exist.
3. ukcouncils PR 32 (no downloads, no Asylum Stats) has merged, so you build on its rules.

## Read first

`~/.codex/AGENTS.md`; `~/.claude/CLAUDE.md`; this repo's `CLAUDE.md` and the files it lists (the plan, `clawd/docs/lessons/sister-sites.md`); UK Council Tax's `docs/BUDGET-GAME-SOURCE-NOTES.md` (binding: edition, hashes, row filter, lines, checks, anchors, decisions 1 to 9); UK Council Tax's `scripts/import-ra-budget.mjs` and `src/lib/budget.ts`, as the code to copy.

## Rules specific to UK Councils (from its CLAUDE.md)

- **Copy, never import across repos.** No build or test reads UK Council Tax's checkout. Copy the importer into `scripts/import-ra-budget.mjs`. It fetches the same three pinned MHCLG files by hash; `scripts/lib/ods.mjs` is byte-identical in both repos already. Write `data/budget/ra-2026-27.json`, and add the source entries where this repo keeps them.
- **Never apportion a county figure to a district.** A district page shows the district's own budget only. It names its county (from the registry `county` field) and links to the game page on UK Council Tax, which shows both. No county tables on UK Councils pages.
- **An absent figure means an absent section.** The nine councils with no 2026/27 return get no budget section at all, not a notice. The same applies to Scotland, Wales and Northern Ireland, which the RA does not cover.
- **Rank only where every body has the same complete official year.** Nine are missing, so do not rank or compare councils.
- **Every figure has its source line directly under it**, with publisher, release title, sheet and publication date.
- **A rule and a date, never a motive.** The site's tests grep for motive words.
- **Sister links come from that site's live sitemap, never a slug pattern.** Add `scripts/check-ukcounciltax-budget-links.mjs`. It reads UK Council Tax's live sitemap and writes `data/links/ukcounciltax-budget.json`, mapping GSS to each verified `/tools/budget/<slug>/` URL, with the date read. A council links to the game only if its URL is in that committed file; a test enforces it. The script is run by hand, not in the build.
- **Name it apart from the existing Spending section.** That section is AI DOGE's record of what councils publish about payments. The new section is the council's planned budget. Recommended heading: "{Name} council's budget for 2026/27", with a first sentence saying it is the budget the council returned to MHCLG before the year began.

## What to build

1. **Data.**
   - The importer copy and its tests: counts (317 kept, 308 with data, the nine with "no return"), service totals sum to line 799, sub-lines sum exactly, the financing identity, and the four anchor councils from the source notes, section 4.
   - The Table 10 reconciliation needs UK Council Tax's Table 10 import, which this repo does not hold. Leave it out and say so in the PR.
   - The county join uses the registry `parentGss`: 164 districts, each with an E10 code.
2. **`src/lib/council-budget.ts`.** Returns null for any council without a return or outside England. Applies the source notes' decisions on the measure, net income, DSG, SEND, funding and reserves (decisions 1 to 8). The receipt is excluded (decision 6).
3. **The profile section.** Add `"budget"` to `PROFILE_SECTIONS` in `src/lib/council-profile.ts`, after `"about"` and before `"spending"`. Update `tests/council-profile.test.ts` so its raw-data expectation includes the budget rule. Add a `ProfileBudget.astro` component holding:
   - service headings with net income labelled;
   - funding;
   - non-ringfenced reserves with the caveat;
   - the DSG sentence for councils that hold education;
   - a link "Play the budget game for {name} on UK Council Tax", only where the link snapshot holds the URL.

   Add its sources to the page's single sources list (`profileSources`).
4. **No new route, no client script, no download.** Plain HTML. No horizontal overflow at 375px.

## Checks and PR

Run `npm test`, `npm run check` (grep the error count line), `npm run build`, `npm run test:dist`, `npm run test:e2e` (the layout spec samples include Burnley, Blackpool, Blackburn with Darwen and Chorley), `npm run test:csp`, then the `BUILD_OG=1` build, through the workflow env pattern. Push and open one PR, "Council budget section, from MHCLG RA 2026/27". In the body:
- the counts;
- the four anchor values as rendered;
- the link snapshot's date and size;
- screenshots of Burnley (district, county named, link), Blackpool (unitary) and one no-return council (no section) at 375px and desktop;
- the Table 10 omission.

End with: "Built with Codex from a brief prepared in Claude Code." Do not merge or deploy.

## Stop and report, rather than work around it, if

- any start condition is not met;
- a pinned hash differs;
- an anchor fails;
- a page would need a county figure on a district page, a ranking, or a figure not in the RA file;
- the build needs inline script permission.

Cite no source the binding notes do not name. A design question the brief leaves open gets the most conservative choice (show less, never derive), recorded under "Decisions taken" in the PR.
