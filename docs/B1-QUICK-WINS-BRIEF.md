# B1: UK Councils quick wins | Codex brief

Written 10 November 2026 in Claude Code. Worktree `~/wt/ukc-quick-wins`, branch `feat/links-held-fields`, cut from `origin/main` at `f0e2020` (PR 32). One PR, one commit per item, in the order below. Read `CLAUDE.md` first; its rules bind this brief. Every assertion below was checked against the data on 10 November 2026, so a failure is a fault in the build, not in the brief.

## Rules that bind every item

- British English. No em dash, en dash or spaced hyphen as a dash, anywhere: text, comments, JSON, commit messages. The text test runs on the build.
- Never estimate, derive or carry a figure forward. Every figure has its source line directly under it. Name no individual.
- No inline script. Astro component scripts are hashed by `scripts/inject_csp_hashes.mjs`; run `npm run test:csp` after any script or header change.
- Sister site URLs come from that site's live sitemap, never from a slug pattern.
- Stage named paths only. Do not merge or deploy. Merging deploys and is Tom's.
- Stop and report only on the conditions in the last section. Any other question gets the most conservative choice (show less, never derive) and a line under "Decisions taken" in the PR body.

## Item 1: UK Council Tax in the footer sister block

The footer (`src/components/SiteFooter.astro`) lists four sisters from a list in `src/lib/site.ts` or `src/lib/registry.ts` (find the list; it carries `name`, `url` and `blurb`). Add UK Council Tax: name "UK Council Tax", url `https://ukcounciltax.co.uk/`, blurb "Every band, bill components and local precepts". Keep the four existing entries and their order; add this one after UK Elections or wherever the list's ordering rule puts it. Do not add Asylum Stats (Tom, 8 November 2026: "No asylum stats link for now"). Do not add UK Food Hygiene.

Assert in a unit test: the footer list contains exactly five entries and one of them has url `https://ukcounciltax.co.uk/`.

## Item 2: a contextual link under every Band D card

`src/pages/councils/[slug].astro` shows the Band D figure in the council tax section (the `BandSelector` at about line 133). Directly under that section's source line add one sentence with a link: "Every band, the twelve month figure and what makes up the bill: [council name] on UK Council Tax", linking to `https://ukcounciltax.co.uk/councils/<slug>/`.

The URL must be verified, not assumed. Write `scripts/fetch-ukcounciltax-sitemap.mjs` that fetches `https://ukcounciltax.co.uk/sitemap.xml`, keeps the `<loc>` values under `/councils/`, and writes `data/links/ukcounciltax-councils.json` with `{fetched, source, urls}`. Commit the fetched file. The page reads that file and renders the link only when the council's URL is present. Dry run on 10 November 2026: the live sitemap has 297 URLs under `/councils/` (296 councils plus the index), and every one of the 296 English billing councils in `data/registry/councils.json` (`country` England, type not a county) has its URL present.

Assert in a unit test: 296 council URLs in the file; every English billing council in the registry has one. Assert in the built output (extend `scripts/check-dist.mjs` or an existing dist test): every `/councils/<slug>/index.html` contains exactly one link to `https://ukcounciltax.co.uk/councils/<slug>/`.

## Item 3: Exceptional Financial Support status on council pages

`data/efs/statements.json` holds 126 statements for 57 authorities, 54 of them with a `slug` that matches a council page. `src/lib/efs.ts` exports `authorities`, `statements` and `figuresByAuthority()`. On each of those 54 council pages, add a section after the "What is X council?" section:

- heading "Exceptional Financial Support";
- one sentence per support year the GOV.UK pages list for the authority, using the figure's `marking` and `amountGbpM` exactly as stored and the statement's `authorityAsPrinted` where the name is printed differently; a null amount is "no amount published", never 0;
- the GOV.UK source line (publisher, page title, date) from the `pages` block of the data, under the figures;
- a link "The full list for every year" to `/exceptional-financial-support/#name-<key>`, where `name-<key>` is the anchor the EFS page already renders for each authority (its `h3 id`).

Councils with no statement get no section (an absent figure is an absent section). Dry run: 54 pages gain a section; Birmingham is among them.

Assert in a unit test: the number of council pages with the section equals the number of EFS authorities with a slug, read from the data, not hardcoded. Assert in a dist check: Birmingham's page contains the heading and a link to the EFS anchor; Burnley's does not contain the heading (Burnley has no EFS statement; confirm from the data before asserting, and if it does, pick another Lancashire district that does not).

## Item 4: the profile intro above the band selector

Move `<ProfileAbout .../>` (currently at about line 176) to render before the council tax section (line 128), so the first screen says what the council is: register name, type, county, with its source line. Add the council's own website from the registry if the registry holds one (`data/registry/councils.json`: check the fields; if no website field exists, leave it out and say so in the PR). Keep the `PageContents` order in step. Keep the Band D figure within the first screen at 375px: take a 375px screenshot of Burnley and Birmingham before and after and attach both to the PR.

Assert: the existing profile section tests still pass; `e2e/layout.spec.ts` passes (no horizontal overflow).

## Item 5: findings page title

`src/pages/findings.astro` has `title="Findings"`. Change to `` title={`Findings: council tax data notes, England ${yearLabel(year)}`} `` (the page already imports the year). Keep the description. Assert in the dist check that the built title ends with " | UK Councils" (existing rule) and contains "council tax data notes".

## Item 6: compare page headings

`src/pages/compare.astro` renders `<h2 data-comparison-heading></h2>` and two `<h3><a data-result-name></a></h3>` empty until the script fills them. Give the result block the `hidden` attribute until the script has a result, so no empty heading is exposed, and give the h2 server rendered text "Compare two councils" that the script may replace. Run the compare browser test and the axe check on `/compare/`.

## Item 7: sources page

`src/pages/sources.astro` lists council tax, the list of councils and the postcode lookup. Add, each with publisher, title, date and licence taken from the data file's own `source` or `manifest` block (no new source, no new fetch): the AI DOGE spending summaries (`data/spending/aidoge-summaries.json`), the school holidays calendar snapshot (`data/school-holidays/manifest.json`), the ONS boundaries (`data/geography/source.json`) and the GOV.UK Exceptional Financial Support pages (`data/efs/statements.json`, `pages`). Assert in a unit test that every dataset directory under `data/` that the site reads is named on the sources page.

## Item 8: the sister links comment

`src/lib/registry.ts` lines 78 to 80 skip UK Food Hygiene with the comment "The private project is never linked from a public surface". UK Food Hygiene has been public since 6 October 2026. Keep the skip (no decision has added the link) and reword the comment to "Not linked from this site; the sister block is the four sites Tom confirmed on 8 November 2026 plus UK Council Tax." Note it in the PR body.

## Self review before the PR

Run and keep the summaries: `npm run check`, `npm test`, `npm run build`, `npm run test:dist`, `npm run test:e2e`, `npm run test:csp`. Then: grep the built HTML for em dashes, en dashes and spaced hyphens; confirm no individual is named in any new text; confirm every new figure has a source line under it; take the four screenshots (Burnley and Birmingham, 375px and desktop, after) and the two before shots from item 4. Open the PR titled "Footer and contextual links to UK Council Tax, EFS status, profile intro first" with the per item results, the decisions taken and the screenshots. End with: "Built with Codex from a brief prepared in Claude Code." Do not merge.

## Stop and report, rather than work around it, if

- the UK Council Tax sitemap fetch fails or lacks any of the 296 council URLs;
- the EFS data has a slug with no matching council page;
- a sentence would need a figure or source the data files do not hold;
- the registry hold test from PR 27 fails (the reorganisation field stays held: the registry text predates MHCLG's 29 October 2026 withdrawal letter; do not print it).
