# Exceptional Financial Support by year | Codex brief (C2, idea I007)

Written 8 November 2026 in Claude Code. Source research and curation are done: read `docs/EFS-SOURCE-NOTES.md` first. Where the notes and this brief differ, the notes win.

## Context

UK Councils (Astro 6, TypeScript, pre-rendered) has one page per council and a few national pages (`/findings/`, `/council-tax/`, `/compare/`). Nobody presents MHCLG's Exceptional Financial Support lists by year and by council on one page. MHCLG publishes one guidance page per year. Their free-text cells have been curated into `data/efs/statements.json`, with the raw page bodies in `data/efs/raw/`.

Two open PRs touch files you must leave alone, to avoid conflicts. PR 30 touches `src/pages/councils/[slug].astro`, the `Profile*` components, `src/lib/council-profile.ts` and `e2e/layout.spec.ts`. PR 13 touches `src/pages/methodology.astro`, `src/pages/sources.astro`, `src/components/SiteFooter.astro`, `CouncilActions.astro`, `TaxTable.astro`, `ViewActions.astro`, `SchoolHolidays.astro`, `src/lib/registry.ts`, `src/lib/spending.ts`, `scripts/check-dist.mjs` and `data/links/`. The link from each council page to this page is a later session (C3).

## Phases

### Phase 1: data module and tests (commit "EFS data module and source checks")

1. `src/lib/efs.ts` loads `data/efs/statements.json` with `process.cwd()` and exposes typed pages, authorities, statements, figures and `multipleFigures`. Add helpers to group figures by page and by authority. Never add amounts together.
2. `tests/efs.test.ts` (vitest, offline):
   - each `data/efs/raw/efs-<year>.body.html` hashes to its page's `bodySha256`;
   - re-extracting the table cells from the raw bodies (header row skipped, Birmingham's revised table read as year and cell) gives exactly 126 statements in the same order, each matching its `cellSha256`;
   - every figure with an amount has its printed text `£<amountGbpM>m` inside its raw cell text;
   - row counts per page match the notes, section 2;
   - 57 authorities; every non-null slug exists in `data/registry/councils.json`;
   - recomputing the multiple-figure cases from the statements (numeric comparison, HRA separate, single-year figures with roles stated, prior_year, revision_note or later_year) gives exactly the 11 cases in the file;
   - no figure's role is outside the documented set, and every `withdrawn` figure has a null amount.
3. `scripts/check-efs-source.mjs`, run as `npm run data:efs-check`. It is not part of build, test or CI, and it never writes `statements.json`. It fetches the collection and the seven year pages from the GOV.UK content API and fails with a readable report if:
   - a page's table cells no longer hash to the stored values;
   - a table row is added or removed;
   - the collection lists a year page not in the data (for example 2027-28).
   A failure means a person re-curates the data. The script prints which cells changed and does nothing else.

### Phase 2: the page (commit "Exceptional Financial Support page")

Route `/exceptional-financial-support/` (`src/pages/exceptional-financial-support.astro`). Title: "Exceptional Financial Support for councils in England, 2020/21 to 2026/27 | UK Councils", or the nearest wording within the site's title tests. Meta description of 160 characters or fewer.

Content, all in plain HTML (no client script is needed):
1. **What it is.** Two or three plain sentences, drawn from the collection page: the government agrees support for councils that requested help with pressures they considered unmanageable, most often as permission to capitalise revenue costs (a capitalisation direction), on condition, where relevant, of an external assurance review. Source line to the collection page. No judgement words.
2. **By year.** One section per year page, newest first. Each opens with: the page title as printed (linked); first published and last updated dates; the prose count quoted as printed (or "the page prints no count"); and the number of authorities its main table lists. Then a table with the authority (linked to `/councils/<slug>/` where a slug exists, plain text otherwise), and each figure as amount, the year it relates to, MHCLG's marking, and the role in words:
   - `superseded`: "later revised on this page";
   - `revision_note`: "revised figure";
   - `prior_year`: "for an earlier year";
   - `later_year`: "for a later year";
   - `covering_total`: "total covering the years listed";
   - `withdrawn`: "in-principle support given; request withdrawn".
   Amounts appear exactly as printed, with "£" and "m". The extra tables (HRA, police, Birmingham's revised profile, Norfolk's later support) keep their own headings. Each table has a caption and a SourceLine (publisher, page title, last updated date, link).
3. **By council.** An index of the 57 authorities, alphabetical, each listing every figure across all pages with the page it comes from. Where an authority and year appear in `multipleFigures`, show the note: "MHCLG's pages print more than one figure for <year>", each figure with its page, and the relation text from the data.
4. **How this page is made.** Curated by hand from the seven GOV.UK pages on 8 November 2026. No totals, rankings or comparisons, because the figures mix in-principle and final amounts, capitalisation and grant, and general fund and HRA support. Unlinked authorities are county councils, a former council and two police bodies with no UK Councils page.

Use existing components (`SourceLine`, `Breadcrumbs`, `PageContents` if it fits) and the site's table pattern. No hex literal outside `global.css`. No horizontal overflow at 375px. Wide tables follow the existing mobile pattern.

### Phase 3: wiring and checks (commit "Wire EFS page and checks")

1. Add `"/exceptional-financial-support/"` to `STATIC_PATHS` in `src/lib/site.ts` and an entry in `NAV_GROUPS` where national finance pages belong. `tests/site.test.ts` must pass. The sitemap follows `STATIC_PATHS`.
2. If the OG endpoint (`src/pages/og/[card].png.ts`) takes a static card list, add a card with the title only: no amounts, no council names. Otherwise use the site default.
3. Add JSON-LD `Dataset` only if other national pages carry it; follow their shape.
4. Run, all green, and paste the summaries into the PR: `npm test`, `npm run check` (grep the error count line), `npm run build`, `npm run test:dist`, `npm run test:e2e` (the layout spec covers every static path at 375px), `npm run test:csp`, then `BUILD_OG=1 npm run build` (through the workflow env pattern described in CLAUDE.md, never inline if the hook refuses). Run `npm run data:efs-check` once and paste its result.

### Phase 4: PR

Push `feat/efs-by-year` and open one PR to main titled "Exceptional Financial Support by year (I007)". In the body: what each phase built, the test counts, the data check result, screenshots at 375px and desktop in light and dark, the files you left alone because of PRs 13 and 30, and what is left for C3 (the council page link) and C2b (the 2027-28 list). End with: "Built with Codex from a brief and curated data prepared in Claude Code." Do not merge or deploy.

## Review decisions, 8 November 2026

After the phase 1 stop: the Birmingham hash convention is now written into the source notes, section 3. Use it in the extractor, then rerun the tests. Also fix the registry test: `data/registry/councils.json` holds `councils` as an object keyed by GSS, not an array. The uncommitted phase 1 files in the worktree are yours to finish; keep every integrity test as strict as it is now.

## Stop and report, rather than work around it, if

- a raw body or cell hash test fails;
- a curated amount is not found in its cell;
- the multiple-figure recomputation disagrees with the file;
- the page would need a total, a ranking or a figure not in `statements.json`;
- the build needs inline script permission;
- you would have to edit a file listed under PR 13 or PR 30.
Never edit `data/efs/statements.json` or the raw files. If the data looks wrong, report the statement and figure.
