# Inbound links to the two tax sites | brief template (L2, L3)

Written 9 November 2026 in Claude Code for Codex builds on network sites. One instance per repo, filled in from this template, lives in that repo's own worktree. This file is the template and the record of the working pattern it is copied from.

## 1. Authority and scope

Decision 7, taken 9 November 2026: UK Demographics place pages (L2) and UK Elections council seat pages (L3) may carry a contextual line linking the council's page on UK Council Tax and on UK Councils. No footer changes on any network site. AI DOGE is excluded; L4 is dropped. The plan is `~/ukcounciltax/docs/PLAN-2026-11-10-REMAINING.md` section 1.

Nothing else changes on the target site: no figure is copied from either tax site, no footer or header changes, no new client JavaScript, no change to any other sister link.

## 2. The working pattern in UK Councils

B1 item 2 (commit `56d2655`, "Contextual link to UK Council Tax under every Band D card") is the pattern. Read these at UK Councils `origin/main` (`151dc0fb8d5469dcce50a55eb5469ca92026cc48` when this was written):

| File | What it does | What the instance copies |
|---|---|---|
| `scripts/fetch-ukcounciltax-sitemap.mjs` | Fetches the live sitemap, keeps `/councils/` URLs, refuses unless all 296 billing councils are present, saves `{ fetched, source, urls }` | The shape of the saved file, the refusal on any shortfall, the exact count |
| `data/links/ukcounciltax-councils.json` | The saved sitemap: 297 URLs (296 councils and the index), fetched 2026-11-09T01:35:19.989Z | The file shape, once per tax site |
| `src/lib/council-tax-links.ts` | Returns the URL only when the saved sitemap lists it, else `null` | The "published only when the saved sitemap lists it" rule |
| `tests/council-tax-links.test.ts` | 296 URLs, no duplicates, every billing council covered, an unlisted council suppressed | The three tests, plus the join tests in section 8 |
| `scripts/check-dist.mjs` (lines 77 to 81) | Exactly one verified UK Council Tax link on every council page | The one link per page assertion, and its inverse on pages that must not carry it |
| `src/pages/sources.astro` (line 75) | Names the sitemap and the date it was retrieved | One sentence on the target site's sources page |

**What differs on a network site.** UK Councils joins by its own slug, because its slugs are the tax sites' slugs. A network site has its own slugs (UK Elections `bristol` against the tax sites' `bristol-city-of`; `folkestone-and-hythe` against `shepway`), so the instance joins by **GSS code** through a crosswalk copied from UK Councils' registry, and builds both URLs from the crosswalk slug. A slug is never guessed or transformed.

## 3. Template parameters

| Parameter | Fill in |
|---|---|
| Target repo and base | `<repo>` at `origin/main` `<sha>` |
| Worktree and branch | `~/wt/<name>`, `feat/tax-site-links` |
| Page template(s) to change | `<file>`, and the route that builds it |
| Pages built by that route | `<N>` |
| Join field on the target side | `<file and field holding the GSS code>` |
| Code aliases needed | `<pairs, or none>` |
| Name the line prints | `<the variable the page's H1 prints>` |
| Placement | `<after which block>` |
| Known refusals | `<slug: reason>` |
| Counts to assert | `<with line>` of `<N>`, and the breakdown of the rest |
| Unit test file | `tests/tax-site-links.test.ts` |
| Dist check | `<script, and where the gate runs it>` |
| Text test | `<existing published text gate, plus the unit test on the line>` |
| Build hold | `<date, or none>` |

## 4. The saved data

Three files under `data/links/` in the target repo, each committed:

1. `ukcounciltax-councils.json`: `{ fetched, source, urls }`, source `https://ukcounciltax.co.uk/sitemap.xml`, the same shape as UK Councils' file.
2. `ukcouncils-councils.json`: `{ fetched, source, urls }`, source `https://ukcouncils.co.uk/sitemap.xml`.
3. `tax-site-crosswalk.json`: `{ source, commit, copied, year, yearSources, councils }`. `source` is `tompickup23/ukcouncils data/registry/councils.json`; `commit` is the UK Councils commit it was copied at; `councils` is the 296 English billing authorities (country England, type not a county council) as `{ gss, slug, name, officialName }`, sorted by GSS. `year` is the bill year label as UK Council Tax prints it (`2026/27` on 9 November 2026) and `yearSources` the pages it was read from.

UK Councils' repository is private, so the crosswalk cannot be fetched in CI. Two scripts, both under `scripts/links/`:

- `copy-tax-crosswalk.mjs <path to a ukcouncils checkout>` reads that checkout's registry, records `git -C <path> rev-parse HEAD` as `commit`, refuses if the registry file has uncommitted changes in that checkout, and refuses unless exactly 296 councils pass the filter with 296 distinct GSS codes and 296 distinct slugs. No absolute path is written into the script.
- `fetch-tax-sitemaps.mjs` fetches both sitemaps, keeps `/councils/<slug>/` URLs on the right origin (the `/councils/` index is kept in `urls`, as UK Councils does, and excluded from the count), and refuses unless each sitemap holds exactly 296 council URLs and every crosswalk slug is present in both. It then reads the year from the titles of three UK Council Tax council pages (`burnley`, `birmingham`, `cornwall`), matching `bands and charges (\d{4}/\d{2}) \| UK Council Tax`, refuses unless all three agree, and writes `year` and `yearSources` into the crosswalk. Parse `<loc>` with the repo's XML parser if it has one; otherwise a `<loc>` match with a check that the number of `<loc>` equals the number of `<url>`. Send a plain client name as the user agent, no contact details.

Either script failing stops the build: report the message, commit nothing from that run. Never edit a saved file by hand.

**A note for the reviewer.** UK Council Tax council pages declare the matching UK Councils page as canonical (UK Council Tax PR 15). Decision 7 links both anyway; the UK Council Tax URL is still in its sitemap and still serves the bands. Nothing in the instance changes because of this.

## 5. The join

1. Exact GSS match between the target record's code and the crosswalk `gss`, after resolving known aliases in one direction (the target's code onto the crosswalk's, or the reverse, as the instance states). The only aliases known on 9 November 2026 are Barnsley `E08000016` to `E08000038` and Sheffield `E08000019` to `E08000039`, reissued by The Barnsley and Sheffield (Boundary Change) Order 2024 with effect from 1 April 2025. UK Councils' registry carries the new codes; a site built on Census 2021 codes carries the old ones.
2. A name check on every match. Normalise both sides: lower case, `&` to `and`, drop the leading `London Borough of ` and `City of `, the trailing `, City of` and `, County of`, and a trailing ` City Council`, ` Borough Council`, ` District Council` or ` Council`, then keep letters only. The match passes if the target's name equals the crosswalk `name` or `officialName` so normalised. A failed name check refuses the pair, and the unit test names every refusal.
3. Render only when the join passes **and** both URLs are in the saved sitemaps. Otherwise render nothing: no empty element, no placeholder, no fallback link.
4. The helper is `src/lib/tax-site-links.ts`, reading the three files with `process.cwd()` (or the repo's established equivalent), exporting `taxSiteLinks(code, name): { taxUrl, councilUrl, year } | null` and the loaded files for the sources page and tests.

## 6. The line

Wording, exactly, with `<name>` the name the page's H1 prints and `<year>` the crosswalk `year`:

> Council tax bands and the `<year>` Band D for `<name>` on UK Council Tax; the council's profile on UK Councils.

Two links: the text `<name> on UK Council Tax` to the UK Council Tax URL, and `the council's profile on UK Councils` to the UK Councils URL. Plain HTML in the static page, no script. Use the target page's existing cross link styling and classes; add CSS only if no existing class fits, with the repo's tokens. No figure: the line names the band and the year and links; the Band D amount stays on the tax sites. No `target="_blank"`. Keep it inside the page's text column so nothing overflows at 375 px.

## 7. Counts

Every instance asserts, in the unit test and again in the dist check: pages built by the route; pages with the line; pages without it, broken down by reason (country, no code, refused). A count that differs from the instance's dry run stops the build until it is explained in the PR body.

## 8. The unit test (`tests/tax-site-links.test.ts`)

- Both saved sitemaps: the named source, exactly 296 council URLs, no duplicates.
- The crosswalk: 296 councils, 296 distinct GSS codes and slugs, a 40 character `commit`, `year` matching `^\d{4}/\d{2}$`.
- Every crosswalk slug present in both sitemaps.
- The join over the repo's own records gives the instance's counts exactly, and the refused list equals the instance's known refusals.
- The alias pairs resolve both ways (Barnsley and Sheffield return links).
- A code absent from the crosswalk returns `null`; a crosswalk council whose URL is removed from a copy of either sitemap returns `null`; a name that fails the check returns `null`.
- The rendered line string for one known council equals the wording in section 6 character for character, and contains no em dash, en dash, their entities or a spaced hyphen.

## 9. The dist check

On the built output, for every page the route builds: a page that should carry the line carries exactly one link to its UK Council Tax URL and exactly one to its UK Councils URL, both inside the line; every other page carries neither origin's `/councils/` link from this line; the totals equal section 7. Pages outside the route (for UK Elections, ward pages) carry no line. The check runs wherever the repo's gate runs its other dist checks, named in the instance.

## 10. The text test

The repo's existing published text gate covers the new line (dashes, spaced hyphens, anonymity). If the gate does not sweep the built pages the instance changes, the dist check in section 9 also refuses dashes inside the line. The line names no individual.

## 11. Sources page

One sentence on the target's sources page, as UK Councils has: council tax links are checked against the UK Council Tax and UK Councils sitemaps, retrieved `<date from fetched>`, joined by ONS code through UK Councils' council list, and shown only where both addresses are in the saved sitemaps.

## 12. Gate, commits and PR

- Read the target repo's CLAUDE.md first; its rules win over this template.
- One commit per step: the two scripts and saved data; the helper and unit test; the line in the template(s) and the sources sentence; the dist check and its wiring.
- Run the repo's full gate, as its CLAUDE.md lists it, then the dist check.
- PR titled "Council tax and council profile links on <pages> (L2 or L3)". The body gives the counts, the refused list with reasons, the fetch time and the crosswalk commit, and ends "Built with Codex from a brief prepared in Claude Code."
- British English; no em dash, en dash or spaced hyphen anywhere, commit messages included; name no individual; stage named paths only; do not merge or deploy.

**Stop conditions.** Either fetch fails or a count is not 296; the join count differs from the instance's dry run; a refusal appears that the instance does not list; the line would need a figure, a footer change or client JavaScript to work.

## 13. Instances

| Id | Repo | Worktree and branch | Brief | Dry run (9 November 2026) |
|---|---|---|---|---|
| L2 | ukdemographics | `~/wt/ukd-links`, `feat/tax-site-links` | `docs/TAX-SITE-LINKS-BRIEF.md` | 296 of 318 place pages |
| L3 | ukelections | `~/wt/uke-links`, `feat/tax-site-links` | `docs/TAX-SITE-LINKS-BRIEF.md` | 295 of 360 council seat pages; not to be built before 17 November 2026 |
| L4 | aidoge | none | none | Dropped by decision 7 |

**Dry run inputs.** Both sitemaps fetched 2026-11-09T10:02Z: UK Council Tax 297 URLs under `/councils/` (296 councils and the index), SHA-256 prefix `9154486207aa80ab`; UK Councils 297, prefix `2ab47eb25f8d9ab4`. Crosswalk from UK Councils `151dc0f`: 296 billing authorities, all 296 present in both sitemaps. The year label on the three sample pages was `2026/27`.

**Counts in the plan, corrected.** The plan expected 296 of 350 UK Demographics place pages and 296 of 3,796 UK Elections seat pages. The 350 is every page under `/places/`; the route that builds place profiles makes 318, and 296 of those join. The 3,796 is the whole `/seats/` tree including ward and parliament pages; the council seat pages are 360, and 295 join, because UK Elections' `surrey` record carries Surrey Heath's code (section 4 of the L3 brief).
