# UK Councils design round two | 12 November 2026

This branch adopts Estate Kit 0.5.0 and implements D3, D4 and D2. It is prepared for review, not merged or deployed. Council data, the homepage H1 and page titles retain their existing meaning during the staging period.

## Kit and citations

The first commit vendors the released tag with file hashes and the inclusion checks used by UK Council Tax. The release has no UK Councils skin, so the site's existing colours and fonts remain. Only common generated tokens are copied. Vendored code is unchanged.

SourceLine emits its bibliographic record. After Astro has rendered the final page order, the citation pass keeps each source's first use full and links later uses to a complete, uniquely identified entry in the source drawer. Each alternative tax-band panel keeps its own first citation full, since an unseen panel cannot supply a reader's first citation. Calculation explanations remain beside their figures. Incomplete bibliographic records remain full rather than inventing dates or locators.

The pass uses the kit's linked-source validation and source-entry renderer. The distribution check verifies every shortened link, publisher, title, locator, publication date and URL. Processing yields between profiles so closed DOM windows can be released; the initial synchronous loop exhausted the heap and was corrected before review. Reprocessing is idempotent. Each bibliography entry is rendered once, and validation indexes page IDs once instead of rescanning every ID for every citation.

## Homepage and navigation

The homepage keeps the published England figure and every annual history value. The kit line chart labels the first, middle and last year to avoid collisions, while plotting every annual observation and retaining the complete table. Task cards gain decorative thumbnails.

The header has 18 links, down from 25. Its groups are Find your council, Council tax, Council finances and About. All removed band destinations remain in the footer and in the existing band chips. No new budget hub or route is invented.

The existing first-screen Latin fonts are preloaded. The complete first citation exposed font-swap movement on the desktop profile (CLS 0.1493 in light and 0.1411 in dark); loading the same fonts before paint removes that movement. The final checker records CLS 0.0000 on the homepage and Burnley at both widths and themes, with no failed checks. This is a lab observation, not field performance.

## Validation record

Node 22.23.4. Astro check: zero errors and warnings, one existing unused-variable hint in TaxTable. All 306 unit tests pass, including the built-page checks. The full BUILD_OG=1 render produces 329 pages and 328 sitemap entries; the final citation pass and distribution check cover all 296 profiles.

The complete browser suite was exercised. Two tests lost temporary trace files when a capture run reused the output directory; both passed in an isolated rerun without changes to assertions or timeouts. The final citation-panel change then passed 74 accessibility, layout and citation tests. All 49 actual-header CSP tests pass. The homepage and Burnley were inspected at 375 and 1440 in both themes; the pinned design checker also measures 390 and 1440 in both themes.

The number comparison permits the new homepage chart/table, source-citation text and footer on every page. An independent audit of all 296 profiles found no changed printed money tokens. Source data files are unchanged. The footer repeats the existing 2027/28 link, which accounts for the numeric-text change on otherwise unchanged pages.

After font preloading and citation-indexing changes, all 306 unit tests, the complete distribution check, eight focused browser tests and all 49 production-header checks pass. Three unit tests initially exceeded their existing timeouts under concurrent build/browser load; the final complete run used one worker and unchanged timeouts. The final independent money audit again covers all 296 profiles.

## Review pass, 12 November 2026

Main was merged in after the council picker (PR 47), and three points from review were changed.

1. A repeated source line links into the closed source drawer. The browser test ran in Chromium, which opens a closed details element for such a link; not every browser does. The page now opens the drawer itself on the click, on a hash change and on load. Without scripts the link still depends on the browser. A test cancels the link's own navigation and checks that the drawer opens.
2. The second homepage row is removed. Three of its four cards (council control, budgets, school holidays) went to the council directory, which leads with none of them. Exceptional Financial Support stays in the header and footer. The cards can return when each has a page of its own.
3. The year labels on the homepage chart are still thinned in the kit's output, because the kit's line chart has no option for it. The build now stops if the number of labels found differs from the number of years plotted, so a change in the kit's markup cannot pass unnoticed.
