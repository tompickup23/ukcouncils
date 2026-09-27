# UK Councils | improvement and reuse plan

27 September 2026. Planning only. No product changes, commits, pushes or deployments are authorised by this document.

This is the implementation addendum to the [original build plan](/Users/tompickup/clawd/docs/plans/ukcouncils-plan-2026-09-27.md). It replaces the earlier recommendation to expand datasets before improving the current service. The project guide and its data, anonymity, presentation and publication rules still apply. The original plan retains the launch history and source inventory.

## 1. Product decision

Make UK Councils the quickest reliable route from a council name or postcode to a sourced answer about council tax, followed by useful comparisons and official next steps. Then extend the same council page with verified school dates and election results.

The first release succeeds when someone can find the right authority, understand the charge for their band, compare it fairly, and share the same result. A larger page count or a higher subjective design score is not an acceptance criterion.

Priorities, in order:

1. Make the existing council-tax journey clear and complete.
2. Improve comparison, navigation and mobile readability.
3. Strengthen provenance, discoverability and maintenance.
4. Add school dates and elections through reproducible data adapters.
5. Expand national coverage and other council services after their data contracts pass.

Ordinary search is the primary acquisition route. Google News is a separate editorial option, not a prerequisite for this programme. Use a deep blue identity, as requested on 27 September 2026. Preserve Source Serif 4 and Source Sans 3, both themes, static rendering and the working band selector.

## 2. Evidence and limits

Verified during the review:

- The live postcode journey reaches Burnley. Band selection works by direct click and keyboard. The repo also tests selection without JavaScript.
- The council-tax service has 296 council pages. The launch records report 322 sitemap URLs accepted by Search Console on launch day, 27 September. Discovered URLs are not a count of indexed pages.
- Council, region and band pages already have useful titles, descriptions, internal links and social cards. The homepage title is only the brand.
- Mobile regional tables require horizontal movement within the table. Page headings and column context are lost during a long comparison.
- Every sitemap URL currently receives the council-tax source update date, even when other page content changes.
- UK Councils has no name-search component, Pagefind integration, comparison page, share control or contact page in the inspected source tree.
- The weekly refresh workflow explicitly notes that its token-created pull requests do not automatically trigger other workflows. Validation therefore needs to be part of the refresh path itself.
- PageSpeed measurement was unavailable because the API returned a quota error. No field performance, search ranking or conversion baseline has been established in this review.

The baseline above is dated. At implementation start, inspect the current branch, worktree and live deployment so another session's completed work is not duplicated. Preserve unrelated changes. Copy donor code from a recorded revision after checking its guide and dependencies.

## 3. The journeys to design around

| Journey | Starting point | Successful outcome | Failure or edge state |
|---|---|---|---|
| Find my council | Postcode or council name | Correct current council page | Invalid postcode, lookup outage, valid postcode outside coverage, ambiguous name |
| Find my charge | Council page and known band | Published annual area figure, stated monthly basis and caveat | Unknown band, no source figure, parish-specific bill differs |
| Understand the increase | Council page | Same-band, same-area, same-year-basis change | Boundary/code change makes the comparison invalid |
| Compare two places | Council page or tax hub | Two comparable councils and a clear monetary difference | Different classes, missing year, duplicate choice, invalid URL state |
| Take the next step | Charge or service answer | Verified official band checker or relevant council page | No verified destination, link no longer works |
| Share an answer | Selected band or comparison | Recipient sees the same selection and source basis | Clipboard unavailable, cancelled share, invalid saved selection |

No postcode is stored in a share URL, local storage, analytics event, error report or search index. The existing postcode provider disclosure remains accurate. Name search runs locally over the council registry.

## 4. Target page design

### Homepage

Use the headline "Council tax for your area" with a short explanation of England coverage and the current financial year. Derive the year and coverage count from data.

The first task block has two clearly labelled ways in: postcode and council name. Put "Browse all councils" immediately below. Avoid a single unexplained input that has to guess what the visitor means.

Below it, present three destinations: find a charge, compare councils, understand this year's increases. Add one compact national fact with its source and one real historical chart using the existing `HistoryBars`. Show only destinations that exist.

Do not spend the main viewport on a decorative map, multiple unrelated national statistics or a feed of sister-site promotions. The homepage's job is to get the visitor to their answer.

### Council page

Order the initial release as follows:

1. Council name, authority type and current coverage/year.
2. The band selector and its annual figure, monthly equivalent, annual change, source and parish caveat in one coherent answer block.
3. "Find your property band", "Check your exact bill" and "Compare this council" actions, where verified destinations exist.
4. Compact contents links to comparison, history, who sets the charge and reorganisation.
5. Comparison with the published England/class benchmark, with the basis stated.
6. Local history chart and its accessible data table.
7. The council's own share and the county's where applicable, clearly separated from the whole bill.
8. Reorganisation information and relevant source links.

Reduce the current repetition of the Band D hero and the second charge block. Every figure still keeps its own source and qualifying caveat. On desktop a verified boundary thumbnail can sit beside the heading; on mobile it follows the answer. It must not delay or displace the main figure.

Add school dates and election results later as concise sections and summary links. Do not force four unrelated facts above the fold at the expense of the council-tax task.

### Tax hubs and regional tables

Keep the full, sourced HTML table as the baseline. Enhance it with a council filter, selected-band view, clearly labelled sorting and result count. Selected-band view shows council, annual figure, monthly basis and annual change when comparable.

Use a sticky header and council column within the table container. On small screens prioritise council and annual charge; put supplementary values below the row label or in an expandable detail. Keep the full eight-band table available with a visible scroll cue and keyboard-accessible container.

Sort by money only within the published council class and complete year, in line with the project rule. Region alone is not a valid comparison class. The default list remains alphabetical unless the visitor explicitly selects a valid numeric sort.

## 5. Reuse decisions and required adaptations

| Feature | Inspected donor | Reuse decision |
|---|---|---|
| Council-name search | `/Users/tompickup/aidoge-site/src/components/islands/CouncilSearch.tsx` | Port normalisation and local filtering into a small Astro component. Use UK Councils' registry and links. Do not add React for this control. |
| Full-site search | `/Users/tompickup/ukelections/src/components/Search.astro` | Port dialog, keyboard behaviour and lazy Pagefind loading. Add visible loading/error states and restore focus on close. Scope indexing to useful content. |
| Comparison | `/Users/tompickup/ukdemographics/src/pages/compare.astro` | Reuse selection, swap and URL-state patterns. Replace its dataset assembly and presentation with a dedicated council-tax model. Avoid copying its entire page and demographic dependencies. |
| Contents navigation | `/Users/tompickup/ukdemographics/src/components/PageContents.astro` | Copy the small anchor component and required styles. The newer sticky rail is embedded in `src/pages/places/[slug].astro`, so it is an adaptation rather than a standalone import. |
| Visual summaries | `/Users/tompickup/ukdemographics/src/components/StatCard.astro` | Transfer spacing and sparkline treatment into the existing UK Councils `Fact` component. Keep its required source prop and neutral change language. |
| Maps | `/Users/tompickup/ukdemographics/src/components/MiniMap.astro` | Copy with build-time geometry, ring-winding checks and matching dated ONS boundaries. Use host theme tokens. Omit unmatched shapes rather than guessing by a similar name. |
| Sharing | `/Users/tompickup/ukdemographics/src/components/ShareButton.astro` | Copy native share plus clipboard fallback. Add accessible success/error messages and serialised selection state. Retain generic social-card wording if a selected-band card does not exist. |
| Dates and corrections | `/Users/tompickup/ukdemographics/src/components/DataFreshness.astro` and `src/pages/releases.astro` | Reuse date presentation and chronological history. Replace age-only stale badges with dataset-specific status and separately tracked dates. |
| Election composition | `/Users/tompickup/ukelections/src/components/PartyBars.astro` | Copy the visual primitive with a small local party-label/colour adapter. Import neither the prediction engine nor candidate labels. Render a text/table equivalent. |
| School calendar | `/Users/tompickup/schoolholidaysdates-site/site/src/components/CalendarTable.astro` | Adapt a short upcoming-break summary. Link to existing full calendar and calendar download; retain official source, authority and confidence. |
| Regression coverage | `/Users/tompickup/aidoge-site/e2e/audit.spec.ts` | Add representative accessibility and metadata checks to existing UK Councils gates. Avoid maintaining a duplicate test harness. |
| Optional publication system | `/Users/tompickup/newsburnley/src/content.config.ts`, `src/pages/feed.xml.ts`, `src/pages/news-sitemap.xml.ts` | Use only if an editorial product is separately selected. Migrate Astro 5 collections to Astro 6 loaders, replace publisher constants, filter news entries to the last two days and verify the built article count. |

Components are copied into this repo with their small required dependencies, never imported from another repo at runtime. Record donor revision, adaptations and relevant regression cases in the implementation change. UK Councils tokens and data rules win over donor defaults. Recheck licensing on any third-party dependency brought with a component.

## 6. Competitor patterns to implement with our code

- [CouncilData comparison](https://councildata.co.uk/tools/compare-councils/): searchable council pickers and clear side-by-side charges. Start with two councils; a third adds mobile complexity without being needed for the primary journey.
- [Address Reports comparison](https://addressreports.co.uk/council-tax/compare): one-band filtering and compact results. Keep our own class restrictions and official MHCLG basis rather than copying its ranking or averages.
- [Which? calculator](https://www.which.co.uk/money/tax/council-tax/council-tax-calculator-a5K856P7KFqD): connect the tool to practical explanations and official next steps. Write our own concise guides grounded in primary sources.
- [ONS custom profiles](https://www.ons.gov.uk/visualisations/customprofiles): comparison context and reusable exports. Add a sourced CSV and printable view after the comparison model is stable.
- [CouncilData corrections](https://councildata.co.uk/corrections/): make changes inspectable. Publish our own corrections, with the affected page, previous statement, corrected statement, source and correction date.

These are interaction references, not evidence that competitors' figures or SEO performance are superior. The review found different charge values across sites; do not mix property-specific, unparished and area-average amounts in one comparison.

## 7. Data and state contract before new controls

Create a small shared view model used by pages, comparison, downloads and share text. It should carry:

| Field group | Required information |
|---|---|
| Identity | GSS code, canonical slug, name, council class, current/abolished status and boundary basis |
| Measure | Financial year, band, annual published value and basis such as area average or council's own share |
| Provenance | Publisher, source URL, table, publication date, source revision date and source-file hash |
| Calculation | Input references, operation, rounding rule and a human-readable calculation label |
| Availability | Present, unavailable or not comparable, with an internal reason; never a zero fallback |
| Maintenance | Last successful source check and last significant page-content change, maintained independently |

Use integer pence for differences and format at the edge. Display monthly figures as the annual amount divided by the stated number of instalments, rounded to pennies; do not imply that every actual instalment on a council bill will equal that rounded amount. Retain the existing ten-instalment basis initially. A 12-instalment option or discount calculator is a later, separately sourced feature.

Keep area-total charges distinct from a council's own share. Do not construct a complete bill breakdown from incomplete police, fire or parish data. Do not fill missing history or infer one band from another.

A comparison requires two distinct authorities, the same financial year, band, class and measure basis. Restrict the second picker accordingly and explain the rule. Invalid bookmarked combinations get a recoverable message and available choices, not an apparently valid comparison. Calculate differences only when the contract passes.

The current band selector works without JavaScript. Preserve that property. URL restoration, share controls and comparison filtering are progressive enhancements. With JavaScript unavailable the visitor can still choose a band and read the complete sourced table; enhanced tools explain their fallback.

## 8. Search, URLs and technical SEO

### Stable URL policy

- Existing council, band and region paths remain stable.
- Add `/compare/`, `/contact/` and `/corrections/` when their content is ready. Add each indexable route to `STATIC_PATHS`, navigation and relevant search entries in the same change.
- Share comparisons with validated parameters such as `/compare/?a=burnley&b=pendle&band=D&year=2026-27`. The base tool has a self-canonical; parameter variants canonicalise to the base tool and are excluded from the sitemap. Do not generate every possible council pairing.
- Store council-band selection in a documented fragment such as `#band-A`. Ensure recipient restoration, back/forward navigation and the page's existing section links work together. All band figures remain in the HTML.
- Do not put internal search results, postcodes, filter permutations or session state in the sitemap. Do not block canonicalised URLs from crawling with robots.txt.
- If permanent annual archive pages are added, generate them only from that year's real data. RSS items must point to the matching permanent release or archive, rather than different years all pointing to today's page.

### Changes to make first

1. Give the homepage a descriptive title using the actual current year and scope.
2. Distinguish the independent publisher from the council being described. Use a publisher organisation for UK Councils and link the council entity through the page's subject relationship, with a verified official council URL.
3. Stop using a dataset date as every page's `lastmod`. Omit unknown page modification dates immediately. Subsequently maintain a route-level content manifest whose timestamp changes only with a significant semantic change, including relevant data, prose or links. Keep it stable on no-op rebuilds.
4. Treat source publication, source revision, successful checking and page modification as separate facts. A successful fetch without a changed source is not new content.
5. Preserve useful question headings, but do not promise FAQ rich results or treat schema as a ranking guarantee.
6. Put official source and council-service links near the relevant action. Verify destinations from supplied records and live pages; never manufacture URLs from a guessed slug.

Google's [sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) says `lastmod` should reflect the last significant page update. A build timestamp shared across all pages does not satisfy that design.

For Pagefind, lazily load the UI and index, exclude navigation and repeated footer content, rank exact council-name matches clearly, and show council type/region where names may be confused. Preserve a browse fallback if loading fails. Start with the local council finder; add full-site search once that first journey is working.

## 9. Trust, privacy and scope decisions

Create a contact/corrections route with a verified working organisational mailbox. Verify delivery through an authorised test before promising a response channel. Do not invent a response-time commitment or operator details. Explain the site's independent status and who is responsible at an organisational level using verified information consistent with the current no-individuals rule.

A public corrections log can begin with an honest empty state. Log substantive factual corrections; keep routine feature releases separate. No fabricated correction examples should reach the public page.

The global instructions say UK Food Hygiene must remain publicly unlinked, while the earlier build plan includes those links. The standing restriction controls this plan: removal of the existing UK Councils links is a priority content change for the first implementation batch, including generated pages/cards where applicable. Do not add reciprocal links. Publishing that correction still requires the user's explicit deployment instruction.

Do not import another site's personal attribution, political framing, modelled figures or claims of independent verification. The current anonymised editorial policy is retained. Genuine news publishing would require a separate policy decision and a sustainable reporting process.

## 10. Delivery sequence and exit criteria

These are proposed implementation batches, not pull requests already created. Effort is relative; no calendar estimate is justified until the data adapters and current checkout have been checked.

| Batch | Scope and primary files | Depends on | Exit criteria | Relative effort |
|---|---|---|---|---|
| A | Trust and metadata: `site.ts`, `BaseLayout`, sitemap, footer, contact/corrections pages | Baseline and verified contact details for the contact page | No misleading global dates; correct publisher/council identities; restricted sister links removed; new routes discoverable; mailbox never claimed working without verification | Small to medium |
| B | Find and read: new name finder and contents component; `PostcodeDoor`, council page and global styles | Baseline; can proceed while contact verification waits | Postcode and name journeys work with error states; main answer is clear at 375px; anchors clear sticky header; no-JS bands survive | Medium |
| C | Compare and mobile tables: view model, comparison page, regional/band hubs | B and comparison contract | Valid comparisons agree with source values; invalid classes/years cannot produce a result; shared selections restore; mobile tables retain context; base HTML remains useful | Medium to large |
| D | Search and share: Pagefind, header, share control, selective OG adaptations | B; C for comparison sharing | Keyboard search and focus restoration work; index errors recover; no CSP failures; share recipient sees the same state; no postcode leaks | Medium |
| E | Visual context and reuse: map, local history chart, CSV, print styles | C; verified boundary mapping | Maps match current areas; no missing years interpolated; exports reconcile to the displayed view; source, year, licence and caveats travel with exports | Medium |
| F | School dates and elections, with separate adapters and separate changes | B through D; reproducible data inputs | Correct education authority and confidence; election date/status labelled; party totals reconcile; no individual names; only supported sections render | Large, split by dataset |
| G | Wales, Scotland, Northern Ireland and other services | F stabilised; dedicated source/coverage contracts | Nation-specific labels and measures; NI rates not forced into council-tax bands; no cross-nation league table; procurement/spending retain AI DOGE restrictions | Separate scoped projects |

Recommended first release boundary: A, B and C. Full-site search, sharing and visual context can follow as small independent releases. Do not hold a working current-service improvement for an incomplete new dataset. Do not combine an estate-wide design-system rewrite with this work.

Infrastructure work proceeds alongside these batches: verify the current deploy-secret and branch-protection state, finish mail authentication through the established authorised process, and repair refresh validation. These are not reasons to block local UI work.

## 11. Expansion contracts

### School dates

Use the published harvest output through a reproducible adapter, never by hand-editing `data-source`. Join by GSS and the current education-authority relationship. Preserve conflict/single-source status and school-specific caveats. A district shows the responsible county's calendar with attribution; a neighbouring area's dates are never a fallback.

"Next break" needs a date-aware view: test before, during and after a holiday, and state the handling of inclusive end dates. Recompute through a controlled refresh or a small client enhancement over embedded dates; never leave a static next-break label indefinitely. Do not create a scheduled task as part of writing this plan.

### Elections

Separate last election result from present council composition. A defection or by-election can make them different. Display the effective date and source of each. A cycle pattern is not evidence of a future polling date, especially during reorganisation.

Carry seats by party only, with no person names in HTML, search, RSS, JSON-LD, maps, downloads or share cards. A total failing reconciliation blocks that component. Keep historical authority identities separate from successors unless a documented mapping supports the specific use.

### Spending and procurement

Start with short sourced summaries and verified links to the specialist site. Adopt AI DOGE's redaction and reconciliation gates. No cross-council spending rankings, spend-versus-budget calculation, or implication that unequal coverage means unequal performance. Never publish the forbidden contract/payment matching field from the original inventory.

## 12. Maintenance that must ship with the feature

- Each imported dataset has a manifest: origin, upstream revision/hash, retrieval/check time, source dates, coverage and licence. Runtime builds read local validated outputs, not arbitrary sibling checkout state.
- Local source repos may be adapter inputs during development. CI must use a pinned export or committed derived output whose origin is recorded. A developer-specific absolute path must not be the production data contract.
- Validate schema, identifiers, coverage changes and reconciliation before replacing the last known good output. Expected reorganisations are explicit changes, not a permanent fixed-count assumption.
- A source outage leaves the last valid snapshot and a truthful last-checked date. It raises an operational failure rather than publishing zeroes or claiming a new verification.
- Validate refreshed output in the refresh job itself before a review request is created. Do not rely on token-created pull requests automatically triggering CI. Any later edit still requires validation of the exact head to be merged.
- Rebuild sister-link coverage from verified mappings and live sitemaps in a reproducible process. Never silently trust a stale coverage flag.
- Separate source changes from generated timestamps to avoid weekly noise. Record corrections and page semantic-change dates in the same reviewed change as the affected content.

## 13. Quality gates

Use the existing commands and add focused regression cases where behaviour is new. A documentation-only change does not need an application build.

For implementation: `npm test`, `npm run check`, build, `npm run test:dist`, relevant browser tests, and `npm run test:csp` whenever scripts, fonts, islands or security headers change. Production share-card validation uses a full OG build. Do not count `astro preview` as proof that CSP works.

Representative cases:

| Area | Required cases |
|---|---|
| Lookup | Valid postcode; invalid format; API unavailable; outside coverage; ambiguous name; keyboard-only selection |
| Amounts | A, D and H; missing prior year; genuine unchanged amount; rounding; council own share versus area total; boundary-code change |
| Comparison | Same-class pair; duplicate council; different class; unknown slug; missing year; tampered URL; swap; browser back/forward |
| Accessibility | Keyboard order, focus visible/restored, labelled fields, announced errors, meaningful table headers, no colour-only information |
| Responsive | 375px, representative desktop, 200% zoom, long council name, both themes; no body overflow; contained tables still usable |
| Search/share | Closed dialog hidden; loading failure; exact council match; shared band restored; cancelled share; clipboard denied; no personal lookup data emitted |
| Content | Source and caveat beside every figure; no forbidden names; unsupported section absent; route, sitemap and search parity |

Use axe checks adapted from AI DOGE on representative templates, plus manual keyboard and screen-reader checks for the changed journeys. An automated accessibility pass alone is not a claim of complete accessibility.

Performance targets: LCP at most 2.5 seconds, INP at most 200 milliseconds and CLS at most 0.1 at the 75th percentile, assessed separately for mobile and desktop where sufficient field data exists. These are the [Core Web Vitals thresholds](https://web.dev/articles/vitals), not measured current scores. Use repeatable lab runs while the new site lacks field data; Lighthouse cannot establish real-user INP.

Prefer build-time SVG, static HTML and lazy search. Record baseline and changed bundle sizes and lab timings on the same setup. Investigate regressions before adding libraries or visual decoration; do not invent a performance score when measurement fails.

## 14. Measurement and review

Start a dated baseline record before implementation. Store observations, time window, page group and measurement method. Use existing aggregate analytics and Search Console first; neither should be assumed to provide an unimplemented conversion funnel.

| Outcome | Initial evidence | Review decision |
|---|---|---|
| People find a council | Observed postcode/name task completion, errors and mobile usability | Fix unsuccessful lookup states before adding more search features |
| People understand the figure | Can a reviewer identify band, year, monthly basis and parish caveat without assistance? | Rewrite labels or reorder the answer before adding another chart |
| Comparison is useful | Complete a valid pair, explain the difference and reopen its share link | Refine the two-council flow before offering three councils |
| Search is discovering useful pages | Search Console indexing reasons, non-brand queries, impressions/clicks by council/band/region | Improve demonstrated gaps; do not mass-create pages from speculative keywords |
| Speed is preserved | Same-environment lab comparisons and field metrics when available | Defer features causing unresolved loading or interaction regressions |

Review immediately after each authorised release for regressions, after about 30 days for indexing/discovery, and after 60 to 90 days for a more useful content assessment. Council-tax demand is seasonal; compare equivalent periods and acknowledge small samples. These are proposed review points, not scheduled automations.

Do not set promised traffic uplifts, news inclusion or ranking positions. A short task completed quickly can be a success; longer sessions and more page views are not inherently better. Custom events, if later needed, must have a defined purpose and contain no raw postcode, full search query or personal identifier.

## 15. Google News decision

The default programme remains a sourced public reference service. Improve contact, correction, dating and publication transparency without presenting refreshed database rows as original journalism.

If original reporting becomes an explicit objective, specify the publication's scope, accountable publisher, correction process, reporting capacity and sustainable update cadence first. Resolve the implications of the no-individuals policy honestly; do not manufacture bylines or claim that anonymous labels guarantee eligibility.

Then adapt the News Lancashire publishing mechanics to Astro 6 with unique permanent article URLs, genuine publication/update dates, source links, article-appropriate structured data and a news-only feed. Its inspected sitemap must be repaired to include only articles created in the preceding two days, with at most 1,000 news entries per sitemap, following [Google's news sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap). Reference pages stay out of that news sitemap.

This branch is not on the critical path for lookup, comparisons, school dates or election facts. Google News eligibility and traffic remain unproven until measured.

## 16. Completion and release record

Every implementation batch should leave a short record of the user-visible outcome, changed routes/components, upstream revisions, passed checks, known limitations and deployment status. Before any authorised release, build a coherent snapshot and preserve a known good rollback target. A rollback must restore compatible site and data versions together.

Creating this plan does not authorise changes to other sites, reciprocal links, public attribution, mailbox settings, publication, commits, pushes or deployment. Those actions follow the user's existing project-specific authorisation rules. Routine local implementation can proceed when requested, with reversible previews and checks completed before any final publication approval.

Implementation update: batches A through C are now implemented locally, with mailbox receipt verification outstanding. See the [stage one implementation record](STAGE-ONE-IMPLEMENTATION-2026-09-27.md). Nothing has been committed or deployed. Batches D through G remain proposed.


## Implementation status, 27 September 2026

Batches A, B and C were implemented locally in stage one. Batches D and E
are now implemented locally as phase two, including the user-requested blue
palette. See `PHASE-TWO-IMPLEMENTATION-2026-09-27.md` for exact scope, donor
revisions, boundary provenance, validation and remaining release constraints.
School/election/spending integrations and the optional editorial programme
remain separate work. Nothing from these improvement sessions is deployed.
