# Exceptional Financial Support: implementation review

8 November 2026. Branch `feat/efs-by-year`, resumed at `3f1450e` in the requested worktree.

## What each phase delivers

1. **Data module and source checks**, `eb99954`: typed data loaded from `process.cwd()`, grouping by page and authority without adding amounts, ten offline integrity and change-check tests, and the manual `data:efs-check` command. The six Birmingham revised rows hash the normalised year cell, ` | `, and the normalised amount cell. The registry check reads the GSS-keyed object with `Object.values`. All existing integrity assertions remain intact.
2. **The page**, `f205fec`: plain HTML at `/exceptional-financial-support/`, newest year first, separate additional tables, an alphabetical authority index, each figure's exact precision, marking, role, note and source, and every multiple-figure relation. `STATIC_PATHS` was added in this phase so the existing sitemap test stayed green in the page commit.
3. **Wiring and checks**, `b0d28cd`: an EFS entry after the existing national finance links in the Council tax menu, a title-only share card, and browser tests of both complete views, links, themes, large text and access without JavaScript. Other national pages carry no Dataset node, so no Dataset JSON-LD was added. There are no new client scripts or CSP policy changes.
4. **Review evidence**: this report and eight screenshots for one PR to main. No merge or deployment.

The title and description derive their year range from the curated page keys. Source titles retain MHCLG's printed years. Displayed support years use the site's slash convention. The current [GOV.UK collection](https://www.gov.uk/government/collections/exceptional-financial-support-for-local-authorities) supplies the introduction and review condition. The capitalisation definition is also sourced to the departmental [Local Government Finance Update, HCWS300, 29 February 2024](https://questions-statements.parliament.uk/written-statements/detail/2024-02-29/hcws300), because the current collection does not explain that term.

## Verification

| Check | Result |
| --- | --- |
| `npm test` | 14 files, 164 tests passed, no skips after the build |
| `npm run check` | 0 errors, 0 warnings, 0 hints |
| `npm run build` | 329 pages built; Pagefind indexed 328 pages |
| `npm run test:dist` | 329 pages and 328 sitemap URLs, all passed |
| `npm run test:e2e -- --workers=2` | 128 passed |
| `npm run test:csp -- --workers=2` | 44 passed, including EFS under the production headers |
| Full build with `BUILD_OG` set to `1` through the child environment | 329 pages built; 301 PNG share cards generated; Pagefind indexed 328 pages |
| Built-tree check after the full OG build | 329 pages point at built share cards; 329 pages and 328 sitemap URLs, all passed |
| `npm run data:efs-check` | Collection and seven year pages checked; all 126 rows unchanged |

The offline tests verify all seven raw body hashes, all 126 cell hashes in order, each amount's exact printed text, the documented row counts and roles, all 57 authorities and their non-null slugs, all 216 figures, and exactly the 11 multiple-figure cases. These counts come from `data/efs/statements.json` and are checked against the source notes and saved source tables. Neither the stored hashes nor the source files were edited.

The browser tests compare all 216 figure entries in each view, including duplicate entries, source URLs, markings, roles, notes and visible amount strings. They also check the 126 table rows, 57 authorities, 11 relation notes, quoted prose counts, linked and unlinked names, anchor navigation and the description length. Both themes fit at 375 pixels and desktop, including at 200% text. The existing layout and CSP specifications were not edited. Separate local ports were selected through the existing `E2E_PORT` and `CSP_PORT` settings because other worktrees occupied the defaults. Astro automatically backgrounds preview servers in agent sessions, so the local static preview was started with `--ignore-lock` and reused by the existing browser configuration. Worker limits changed scheduling only; assertions and timeouts were retained.

The live check was run once and returned:

```text
2020-21: 9 table rows unchanged
2021-22: 8 table rows unchanged
2022-23: 5 table rows unchanged
2023-24: 8 table rows unchanged
2024-25: 20 table rows unchanged
2025-26: 31 table rows unchanged
2026-27: 45 table rows unchanged
EFS source check passed: collection and 7 year pages; 126 rows unchanged. No files written.
```

## Screenshots

Captured from the completed static build by the browser suite and visually reviewed. Each combination includes an overview and the year section.

| Viewport and theme | Overview | By year |
| --- | --- | --- |
| 375 by 812, light | [Screenshot](efs-review/efs-mobile-light-overview.png) | [Screenshot](efs-review/efs-mobile-light-year.png) |
| 375 by 812, dark | [Screenshot](efs-review/efs-mobile-dark-overview.png) | [Screenshot](efs-review/efs-mobile-dark-year.png) |
| 1280 by 720, light | [Screenshot](efs-review/efs-desktop-light-overview.png) | [Screenshot](efs-review/efs-desktop-light-year.png) |
| 1280 by 720, dark | [Screenshot](efs-review/efs-desktop-dark-overview.png) | [Screenshot](efs-review/efs-desktop-dark-year.png) |

## Files preserved

All paths below were unchanged from `3f1450e`. This includes the complete actual file lists read from PR 13 and PR 30, as well as the brief's protected paths. The whole of `data/efs/raw/` and `data/links/` was left alone, and no `Profile*` component was edited.

- `data/efs/statements.json`
- `data/links/checks.json`
- `data/links/contextual.json`
- `docs/RELEASE-2026-10-06.md`
- `e2e/layout.spec.ts`
- `e2e/phase-two.spec.ts`
- `e2e/spending.spec.ts`
- `scripts/check-context-links.mjs`
- `scripts/check-dist.mjs`
- `src/components/CouncilActions.astro`
- `src/components/ProfileAbout.astro`
- `src/components/ProfileSources.astro`
- `src/components/ProfileTax.astro`
- `src/components/SchoolHolidays.astro`
- `src/components/SiteFooter.astro`
- `src/components/TaxTable.astro`
- `src/components/ViewActions.astro`
- `src/lib/context-links.ts`
- `src/lib/council-profile.ts`
- `src/lib/network-footer.ts`
- `src/lib/registry.ts`
- `src/lib/spending.ts`
- `src/pages/compare.astro`
- `src/pages/councils/[slug].astro`
- `src/pages/methodology.astro`
- `src/pages/privacy.astro`
- `src/pages/sources.astro`
- `tests/context-links.test.ts`
- `tests/council-profile.test.ts`
- `tests/registry.test.ts`
- `tests/spending.test.ts`

## Remaining scope

C3 is the link from each council page to this page. C2b is human curation and ingestion of a future year, including the 2027/28 list when it exists; the manual change check detects a newly listed year but never ingests it. Capitalisation direction PDFs, assurance reviews and request letters remain outside this build. Their amounts have not been checked against the tables.

The implementation makes no total across councils or years, no ranking, and no choice of a current amount where MHCLG prints different figures. No individual is named and no relation beyond the curated source wording is asserted. No stop condition remained after applying the authorised Birmingham convention and registry correction. The shared plan outside this worktree was left unchanged to preserve the worktree boundary in the handoff.

Built with Codex from a brief and curated data prepared in Claude Code.
