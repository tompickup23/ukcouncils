# Council picker | 12 November 2026

This branch ports the merged UK Council Tax picker from PR 56, whose merge commit is 7d786761e4d71d427705f57cc8ee6a63b80f1e58. It is prepared for review and remains unmerged.

The directory has one row for each of the existing 296 English billing-council profiles. Name, county, region and type come from the held registry. Lower-tier labels follow the existing parent GSS relationship. The area Band D amount is the existing Table 9 value, accompanied by its source and parish caveat. No new figure, council route, title or H1 is introduced.

Phones show the first 12 rows and a Show all control, with no nested table scroll. Desktop keeps the donor's bounded table. All 296 links and amounts remain in the static HTML with JavaScript disabled. Existing region jumps remain in a closed phone drawer and are visible on wider screens. With JavaScript they select the region; without it they link to its first row. Region bookmarks restore their filter after reload. Matching by normalised region name also handles the registry's capitalisation of Yorkshire and The Humber.

The search dialog and homepage/404 finder use the same county and exact-region matching rule. Lancashire returns its 12 districts. North West excludes councils whose names merely contain those words. The dialog initially lists 12 councils and offers Show all matching councils; Pagefind remains a separate full-text result list. Queries are not stored.

## Measurements

At 375 pixels, page height falls from 11,695 to 2,521 pixels in both themes. At 1440 pixels it falls from 4,161 to 1,767. Captures include the directory and a resolved Lancashire search in light and dark themes. The new Band D column is the only page-number difference, confined to councils/index.html; no routes are added or removed.

## Validation

Astro check reports zero errors and warnings, with one pre-existing TaxTable hint. All 298 unit tests pass. The build and distribution checks cover 329 pages and 328 sitemap URLs. Regression checks cover all nine region chips, region jump reloads, 12-row phone behaviour, sorting, postcode lookup, keyboard search, the scripts-off directory and accessibility.

The complete phone and desktop browser run passes all 324 tests. All 49 tests under the production security headers pass. No assertions or timeouts were relaxed.
