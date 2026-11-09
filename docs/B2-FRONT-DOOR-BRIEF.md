# B2: UK Councils front door content | Codex brief

Written 9 November 2026 in Claude Code. Worktree `~/wt/ukc-front-door`, branch `feat/front-door-content`, cut from `origin/main` at `f0e2020` (PR 32). Read `CLAUDE.md`, then `docs/B2-FRONT-DOOR-SOURCE-NOTES.md`, which holds every source, hash and count this brief relies on. Every assertion below was dry run against the real files on 9 November 2026, so a failure is a fault in the build, not in the brief.

**Start only after B1 (`feat/links-held-fields`) has merged.** Then `git fetch && git rebase origin/main` on this branch, and confirm that `ProfileAbout` renders above the council tax section and that the EFS section from B1 exists, before item 1. B2 moves both. If B1 has not merged, stop.

One PR, one commit per item, in the order below.

## Goal

Every council page should answer, without the council tax tool: what is this council, how many people does it serve, how well does it collect council tax, is it in financial support, and when are its elections. Today about 120 of the page's own words do that. The target is 400 to 600 sourced words and three server rendered visuals, two of them built here and one specified and held. Who runs the council (seats by party and control) is **held**: no file meets the rule (source notes, section 5).

## Rules that bind every item

- British English. No em dash, en dash or spaced hyphen as a dash, anywhere: text, comments, JSON, commit messages. The text test runs on the build.
- Never estimate, derive or carry a figure forward. Every figure has its source line directly under it. Name no individual, in text, alt text, `<title>`, `<desc>` or JSON.
- A source that lacks a council means the section or the row is absent: no placeholder, no "not available", no zero. The one exception is a cell inside a table whose other cells exist, which prints `n/a`.
- No inline script and no client JavaScript in anything this brief adds. Every visual is static SVG rendered at build time.
- No hex literal in `src/`. Colours come from tokens: `--accent`, `--accent-bright`, `--border`, `--border-strong`, `--text`, `--text-muted`, `--bg-card`.
- Data reads resolve from `process.cwd()`. Importers run by hand, are committed with their output, and are never called by the build.
- Joins are by exact GSS code. The only exception is the elections join for Barnsley and Sheffield through the ONS predecessor code, in item 3, recorded per record.
- Stage named paths only. Do not merge or deploy.
- Stop and report only on the conditions in the last section. Any other question gets the most conservative choice (show less, never derive) and a line under "Decisions taken" in the PR body.

## Decisions already taken (do not reopen)

1. **Section order on `/councils/<slug>/`**, top to bottom: breadcrumb; H1 and type line; "What is X council?" (B1 placed it here; B2 extends it); the council tax answer, map, actions and band links (unchanged); `PageContents`; "Band D in X at a glance" with the position strip (moved up from after spending); "How much council tax did X collect in 2025/26?" (new); "Exceptional Financial Support" (B1's section, moved here); "Elections in X" (new); spending; school holidays; England and area averages; previous years; who sets the charge; sources; similar councils; more on X. `PageContents` lists the same ids in the same order and omits any absent section.
2. **Absent data.** Population absent: no population row. Collection: present for all 296. Elections absent, unverified, abolished or held under decision 6: no elections section. Local Links absent for a service: that link is not printed; neither: no "council's own pages" row.
3. **Barnsley (E08000038) and Sheffield (E08000039).** No population: ONS mid-2025 uses E08000016 and E08000019, and SI 1328/2024 changed the boundary from 1 April 2025, so the count describes a different area. No name join. The methodology page gets one paragraph saying so (item 9). Collection joins directly (Table 9a uses the new codes). Elections join through the predecessor code: Barnsley prints 2027, thirds; Sheffield's record is unverified, so no section. Local Links joins directly (UK Places already resolved it).
4. **City of London and Isles of Scilly** get the same sections as everyone else, with no extra comment on small numbers. The City's election prints the record's `date_label`, "March 2029", instead of the year, because Common Council elections are not held on the May ordinary day. The City is in class ILB in both strips, as MHCLG classes it; it happens to be the highest ILB collection rate, so its marker and the "highest" label coincide (test below).
5. **Counties.** No county has a page (pages exist only for a council with a 2026/27 council tax row; `/councils/lancashire/` is not built and must not be). On each of the 164 shire district pages, the "What is X council?" block adds the county's population from its ONS row, named as the county council's area. Counties get no collection rate (they do not bill), no election line and no EFS line from B2. The register holds verified records for seven county councils (East Sussex, Essex, Gloucestershire, Hampshire, Norfolk, Suffolk, West Sussex) but with no GSS code, so using them would need a name join; it holds none for Lancashire. Not printed.
6. **Held, not built:** seats by party and control (source notes 5); the council homepage (no dated source); the last election date (unaudited file); the 46 verified election years that are a reading of a cycle rather than a year in the quoted text; the 11 abolished Surrey districts' abolition line. See "Decisions for Tom".
7. **No ordinal rank anywhere.** The strips show position. The findings page says councils are not ranked; nothing in B2 prints "highest", "lowest", "35th" or "above average" about the page's own council. The only "Lowest" and "Highest" words are the labels of the two end values of a strip.
8. **Rates print as MHCLG prints them**, to 2 decimal places with a percent sign (`94.09%`, `90.00%`). Never re-round.
9. **Names.** New sentences use the council tax table's `name` (`tax.name`), never the registry's `officialName`, which is wrong for Birmingham, Barnsley and the Isles of Scilly (source notes 7). Leave the existing "Name in the register" row as it is.

## Item 1: population data

Copy the pattern of `~/wt/uct-per-resident/scripts/import-population.mjs` into `scripts/import-population.mjs`. Add `read-excel-file` `9.3.14` to `devDependencies` (scripts only; the build never imports it). Source block in `data/population/source.json`, fields as in source notes 1: publisher, title, release `MYE25UK`, url, fileUrl, file `mye25tablesuk.xlsx`, sha256 `8ae244e3341257ecccaee55f4973fe12f46afe6656ead6c1a9ed3f4f8585e40f`, published `2026-10-01`, reference `mid-2025`, sheet `MYE2 - Persons`, column `All ages`, retrieved (the date you fetch), licence. Raw file under `data/raw/`, which `.gitignore` already excludes.

Output `data/population/mye25-population.json`: `{schemaVersion: 1, source, areas: {<code>: {code, name, geography, allAges}}}` for the 333 English rows. Keep every check of the original: pinned hash before parse, `Code` header found, no duplicate code, single years sum to `All ages`, geography counts (Country 1, Region 9, Unitary Authority 63, Metropolitan County 6, Metropolitan District 36, County 21, Non-metropolitan District 164, London Borough 33), and the boundary code check (E08000016 and E08000019 present, E08000038 and E08000039 absent).

`src/lib/population.ts`: `populationFor(gss): number | null` and `populationSource(): SourceRef`.

Tests (`tests/population.test.ts`): 333 rows; anchors `allAges` E07000117 100946, E08000025 1176960, E10000017 1308567, E09000001 15631, E06000053 2299; council pages with a population equal 294, and the two without are exactly `barnsley` and `sheffield` (read pages from `councilPages()`, not hardcoded); every shire district page's `parentGss` has a row (164 of 164).

## Item 2: collection data

Copy `~/ukcounciltax/scripts/import-collection-rates.mjs` (ukcounciltax `main`, last changed `636fed0`) to `scripts/import-collection-rates.mjs`. `scripts/lib/ods.mjs` already exists and is identical; do not copy it again. Change only the paths: source block from `data/collection/source.json` (copy the `collectionRates` block from ukcounciltax `data/national/sources.json`, sha256 `3937351a67bd12418301f97f504a5357566ecf3b6d375076119f1addb44d3d90`), current authorities from `data/council-tax/england-2026-27.json`, output `data/collection/collection-rates-2025-26.json`. Keep all seven printed anchors and the coverage check (296).

The output must be byte identical to ukcounciltax `main`'s `data/national/collection-rates.json`: sha256 `cecd26a16eb2123693596f4e34c7d10f1174d16f566771915043264b09def3a3`. If it is not, stop.

`src/lib/collection.ts`: copy `~/ukcounciltax/src/lib/collection-rates.ts` (`collectionFor`, `collectionSource`, `collectionYear`, `collectionYearEnd`, `collectionPriorYear`, `collectionAmount`, `collectionRate`, `shownNotes`) with the new path.

Tests (`tests/collection.test.ts`): 296 councils; no null rate; every council page has a record; Burnley `[94.09, 60689, 57102, 15841]` for rate, collectable, collected, totalArrears; Birmingham `[90.04, 629022, 566351, 272682]`; England rate 95.6; `collectionRate(90)` is `"90.00%"`.

## Item 3: elections data

`scripts/import-next-elections.mjs` fetches two pinned files from public GitHub repositories and checks each sha256 before parsing (all three URLs and hashes reproduced on 9 November 2026):

| File | URL | sha256 |
|---|---|---|
| UK Elections register | `https://raw.githubusercontent.com/tompickup23/ukelections/3cf7cf60b0bf7772f17dd743643ca680dd777199/data/identity/council-next-elections.json` | `e24e7ed63284de8577e2f11d0991af8b1402e6d93ca1b5a20a0756d703d4e27f` |
| UK Places predecessors | `https://raw.githubusercontent.com/tompickup23/ukplaces/b1a32625943981c9f5a1c97e1c8f89d2dadc1985/src/data/registry/gss-predecessors.json` | `4826532fd29bd7fe9cb6b71a218f6c79f6e7936e875ccb4427057b6f51991a87` |

For each council page (from `data/registry/councils.json` filtered to the 2026/27 council tax table, as `councilPages()` does): find the register record whose `lad24cd` equals the page's GSS; if none, the record for the page's first predecessor code in the predecessors file. Keep the record only if `status` is `verified` **and** `quote` contains the four digit `next_year`. Write `data/elections/next-elections.json`:

```json
{
  "schemaVersion": 1,
  "source": {
    "publisher": "UK Elections",
    "title": "council election register",
    "file": "data/identity/council-next-elections.json",
    "commit": "3cf7cf60b0bf7772f17dd743643ca680dd777199",
    "sha256": "e24e7ed6...",
    "checked": "2026-10-24",
    "method": "<the file's method string, verbatim>",
    "rule": "Printed only where the record is verified and the quoted text contains the year.",
    "predecessors": {"publisher": "Office for National Statistics", "title": "Code History Database (June 2026), Changes table", "via": "UK Places src/data/registry/gss-predecessors.json", "commit": "b1a32625...", "sha256": "4826532f..."}
  },
  "councils": {
    "<page gss>": {"nextYear": 2027, "dateLabel": null, "pattern": "thirds", "sourceLabel": "...", "sourceUrl": "...", "quote": "...", "joinedVia": null}
  }
}
```

`joinedVia` is the predecessor code when used, else null. Never copy `notes`.

`src/lib/elections.ts`: `electionFor(gss)` returning the record or null, and `electionSourceLine(record)` (see item 8 for the words).

Tests (`tests/elections.test.ts`): 174 records; every record's `quote` contains `String(nextYear)`; years: 2027 152, 2028 8, 2029 12 (11 with no `dateLabel`, plus the City of London), 2030 2; patterns: whole 113, thirds 57, halves 4; Burnley 2027 thirds, Birmingham 2030 whole, Barnsley 2027 thirds with `joinedVia` `E08000016`, City of London 2029 with `dateLabel` `"March 2029"`, Isles of Scilly 2029 whole; Sheffield, Westminster and Woking absent; no record has a `notes` key; exactly 5 quotes match `/reorgani[sz]|unitary|abolish|structural change/i` (`test-valley`, `oxford`, `babergh`, `mid-suffolk`, `worthing`), none of them Burnley's or Birmingham's.

## Item 4: the council's own pages

`scripts/import-local-links.mjs` fetches `https://raw.githubusercontent.com/tompickup23/ukplaces/b1a32625943981c9f5a1c97e1c8f89d2dadc1985/src/data/local-links.json`, checks sha256 `5c9e6a32e96fa0307ed077711ffb357922fa0c56052d368365ae68e488e181f9`, and writes `data/links/local-links.json` (the directory B1 created): the file's `source`, `checkedOn` and `services` blocks verbatim, a `via` block (UK Places, the file path, commit, sha256), and `councils: {<gss>: {councilTax?: url, bins?: url}}` for council pages only, omitting a council with neither link.

Tests: council tax links 254; bin links 207; councils present 258; Burnley `councilTax` is `https://burnley.gov.uk/counciltax/paying-your-council-tax/`; Birmingham `councilTax` is `https://www.birmingham.gov.uk/info/20005/council_tax/223/pay_your_council_tax`; every URL starts with `https://` or `http://` (one Scilly bins link is `http://www.scilly.gov.uk/waste`, as published; keep it).

## Item 5: the position strip (visuals 1 and 3)

One geometry module and one component, used twice. Model it on ukcounciltax's `src/components/BandDLine.astro` and its `band-d-line.ts`: pure geometry in a `.ts` file with unit tests; the component draws an inline `<svg role="img">` with `<title>` and `<desc>`, a `<figcaption>`, then the source line, then the caveat, then a `<details>` table, all inside the component, so the source cannot be separated from the chart.

`src/lib/position-strip.ts`:

```ts
export interface StripPoint { gss: string; name: string; value: number }
export interface StripGeometry {
  width: 640; height: 112;
  plot: { left: 16; right: 624 };
  axisY: 64;
  peers: { gss: string; name: string; value: number; x: number }[]; // every member of the class, the council included
  current: { gss: string; name: string; value: number; x: number; labelAnchor: "start" | "middle" | "end" };
  lowest: StripPoint; highest: StripPoint; // ties broken by name, en-GB
}
export function stripGeometry(points: StripPoint[], currentGss: string): StripGeometry
```

`x = left + (value - min) / (max - min) * (right - left)`; if `max === min` every x is the centre. `labelAnchor` is `start` when `x < left + 80`, `end` when `x > right - 80`, else `middle`. Throw if `currentGss` is not in `points` or any value is not finite. No rounding of values; x to 2 decimal places.

`src/components/PositionStrip.astro` props: `id`, `kind` (`"band-d"` or `"collection"`), `points`, `currentGss`, `format: (n: number) => string`, `title`, `classLabel` (plural, from a new `CLASS_PLURAL` map in `src/lib/position-strip.ts`: SD "shire districts in England", UA "unitary authorities in England", MD "metropolitan districts in England", OLB "outer London boroughs", ILB "inner London boroughs, including the City of London"; do not use `AREA_TYPE_LABEL`, which groups ILB and OLB as one London type), `basis` (for example "Area Band D, 2026/27, including average parish precepts"), `source: SourceRef`, `caveat?: string`.

Drawing:

- Root `<figure class="position-strip" data-position-strip={kind}>`.
- One `<line data-strip-peer>` per peer, from `y=52` to `y=76`, stroke `var(--border-strong)`, width 1.5, each with `<title>{name}: {format(value)}</title>`.
- The council: `<g data-strip-current data-value={value}>` with a line from `y=40` to `y=88`, stroke `var(--accent)`, width 3, a circle `r=6` on the axis filled `var(--accent)`, and a text label `{format(value)}` at `y=30` with the computed anchor, `var(--text)`, weight 600.
- A base axis line at `axisY`, `var(--border)`.
- End labels at `y=106`: `Lowest {format(lowest.value)}` anchored `start` at `left`, `Highest {format(highest.value)}` anchored `end` at `right`, `var(--text-muted)`. The council's name is not drawn in the SVG.
- Text sizes as BandDLine (14px ticks, 15px values; 17px and 18px under 30rem).
- `<desc>`: "Strip chart. {basis} for the {n} {classLabel}, one mark each, from {lowest value} ({lowest name}) to {highest value} ({highest name}). {council name} is marked at {value}."
- `<figcaption class="small">`: "Each mark is one of the {n} {classLabel}. Lowest: {lowest name}, {value}. Highest: {highest name}, {value}."
- `<SourceLine source={source} />`, then `<p class="caveat">{caveat}</p>` when given.
- `<details>` "View the figures in this chart as a table": every peer in name order (en-GB), two columns (council, figure), the page's council row marked with `data-current` and `<strong>`.
- `width: 100%; height: auto; max-width: 38rem`. No horizontal overflow at 375px.

**Visual 1, Band D position strip:** in `ProfileTax.astro`, after the two cards and before the links paragraph, `<PositionStrip kind="band-d">` with points from every authority of the page's `classCode` in the 2026/27 table and its `bands.D`, `format` `pounds`, `basis` "Area Band D, 2026/27, including average parish precepts", source `councilTaxSource(CURRENT_YEAR, loadYear(CURRENT_YEAR).source.bandTable)`, caveat "Area average including parish precepts. A home in a parish with its own precept pays a different amount." `ProfileTax` gains the class points through `profileTax()`.

Unit tests (`tests/position-strip.test.ts`) with real data: Burnley in SD has 164 peers, lowest Basingstoke and Deane 2255.21, highest Lewes 2756.17; Birmingham in MD has 36 peers, lowest Dudley 2144.84, highest Gateshead 2715.81; for collection, Birmingham's MD lowest is Liverpool 86.85 and highest Stockport 97.25; the City of London's ILB collection highest is the City itself at 98.09 and its marker `x` equals `plot.right`; a two point fixture puts the lower at `left` and the higher at `right`; equal values put every point at the centre; a missing `currentGss` throws.

## Item 6: "What is X council?" extended

`ProfileAbout.astro` keeps its list and source line. Add, each with its own source line directly under it:

- When `populationFor(gss)` is not null: "{name} had {n} residents in mid-2025." For a shire district whose county row exists, a second sentence in the same paragraph: "{county name} County Council's area had {county n}." County name from the council tax table's `counties[parentGss].name`. Then the ONS source line ("Source: Office for National Statistics, Population estimates for the UK, England, Wales, Scotland and Northern Ireland: mid-2025, MYE2 Persons, all ages, published 1 October 2026."). Numbers with `en-GB` thousands separators.
- When a Local Links record exists: a row "The council's own pages" with the links present, link text exactly the GOV.UK service titles: "Pay your Council Tax", "Find out your rubbish collection day". Source line: "Source: GOV.UK Local Links Manager, links to services provided by local authorities, export of 5 October 2026; each link checked by UK Places on 5 October 2026." with the export URL as the link.

The `ProfileAbout` interface gains `population: {council: number; county: {name: string; count: number} | null} | null` and `ownPages: {councilTax?: string; bins?: string} | null`, filled in `profileAbout()` in `src/lib/council-profile.ts`.

## Item 7: collection section (visual 3)

`src/components/ProfileCollection.astro`, `id="collection"`, `data-profile-section="collection"`. Copy the words and table of ukcounciltax's `src/components/CollectionRates.astro` (heading "How much council tax did {name} collect in {year}?", the intro, the sentence with the rate against England, the QRC4 lines table, the caveat, notes), then add `<PositionStrip kind="collection">` between the sentence and the table: points are every billing authority in the page's class (class from the 2026/27 council tax table `classCode`) with their rate, `format` is `collectionRate`, `classLabel` from `CLASS_PLURAL` (item 5), `basis` "In-year council tax collection rate, {year}, as MHCLG prints it", source `collectionSource()`. Print the source line once inside the strip and once at the end of the section, as ukcounciltax does.

## Item 8: elections section

`src/components/ProfileElections.astro`, `id="elections"`, `data-profile-section="elections"`, rendered only when `electionFor(gss)` is not null.

- Heading: "Elections in {name}".
- Sentence: "The next scheduled election to {name} council is in {dateLabel ?? nextYear}." Then, by `pattern`: whole "The whole council is elected together."; thirds "Councillors are elected by thirds."; halves "Councillors are elected by halves."
- Quote, as a `<blockquote>` with `cite={sourceUrl}`: the record's `quote` verbatim, **except** where the quote matches `/reorgani[sz]|unitary|abolish|structural change/i`. Dry run: 5 of the 174 match (Test Valley, Oxford, Babergh, Mid Suffolk, Worthing); they print the year sentence and the source line without the quote, so no reorganisation text reaches a page while the reorganisation field is held. A cited document title that names reorganisation or a Structural Changes Order (7 labels, for example Leicester's and Preston's council pages and the Cumbria and Somerset orders) is a citation and stays in the source line.
- Source line, built by `electionSourceLine`: "Source: <a href={sourceUrl}>{sourceLabel}</a>, quoted in the UK Elections council election register, checked 24 October 2026." Use the `.source-line` class so it looks like every other source line.
- Caveat: "A scheduled date can be moved by statutory instrument."
- Then the existing UK Elections sister link for the council if `sisterLinks` has one, as "Results and seats on UK Elections". No new sister URL; it must come from the registry, which takes it from the live sitemap.

No seats, no control, no last election. The text test and the motive word test must pass on the quotes (dry run: 174 quotes carry no em or en dash; the register's own notes record that one Elmbridge dash was removed, and Elmbridge is not printed).

## Item 9: order, sources, methodology

- Reorder the council page to decision 1, and keep `PageContents` in step. Update `PROFILE_SECTIONS` in `src/lib/council-profile.ts` to `["about", "tax-summary", "collection", "efs", "elections", "spending", "school-holidays", "sources"]` (use the id B1 gave the EFS section if it differs, and say so).
- `profileSources()` adds, once each, in page order: the ONS population source (when printed), the Local Links source (when printed), the collection source, the election source (when printed, its `sourceUrl` with table "quoted in the UK Elections council election register, checked 24 October 2026").
- `/sources/`: add the four new datasets with publisher, title, date and licence from their source blocks: ONS MYE25UK, MHCLG QRC4 Table 9a 2025/26, the UK Elections council election register (with its method and the printing rule), GOV.UK Local Links Manager via UK Places. B1 item 7's test, that every data directory the site reads is named on the sources page, must pass with `data/population`, `data/collection` and `data/elections` added.
- `/methodology/`: one paragraph headed "Council profiles" covering: population is the ONS mid-2025 count for the council's own code, and Barnsley and Sheffield have none because their codes changed with SI 1328/2024 from 1 April 2025 and the estimate uses the old codes; the strips place a council among the councils of the same MHCLG class and rank nothing; an election year is printed only where the quoted source states it; who runs each council is not shown because no source meets the site's standard yet.

## Item 10: dist checks

Extend `scripts/check-dist.mjs` (or the existing dist test). Every count read from the data files at test time except the anchors below, which are fixed.

| Page | Must contain | Must not contain |
|---|---|---|
| `/councils/burnley/` | "100,946", "1,308,567", "Lancashire County Council", "94.09%", "95.60%", "2027", "Councillors are elected by thirds.", one `data-position-strip="band-d"` with 164 `data-strip-peer`, one `data-position-strip="collection"` with 164 `data-strip-peer`, "Pay your Council Tax" linking to the Burnley URL above | the EFS heading; within the sections B2 adds, "highest" or "lowest" anywhere except the strip end labels, figcaptions and `<desc>` |
| `/councils/birmingham/` | "1,176,960", "90.04%", "2030", "The whole council is elected together.", strips with 36 peers each, the EFS heading | "Birmingham Council" in any new section |
| `/councils/barnsley/` | "2027", "Councillors are elected by thirds.", "96.17%" | any population sentence ("residents in mid-2025") |
| `/councils/sheffield/` | "92.80%" | `id="elections"`; "residents in mid-2025" |
| `/councils/city-of-london/` | "15,631", "March 2029", "98.09%" | |
| `/councils/isles-of-scilly/` | "2,299", "2029", "95.25%" | |
| `/councils/westminster/` | the collection section | `id="elections"` |
| `/councils/woking/` | the collection section | `id="elections"`; "abolished" |
| `/councils/lancashire/` | (must not exist) | |

Counts over all built council pages: 296 with `id="collection"`; 296 with each strip; 294 with "residents in mid-2025"; 174 with `id="elections"`; 254 with a "Pay your Council Tax" link; the EFS section count equal to B1's (51). Every `data-position-strip` figure is followed, inside the same component, by a `.source-line` before the next `section`.

## Self review before the PR

Run and keep the summaries: `npm run check` (grep the `- N errors` line), `npm test`, `npm run build`, `npm run test:dist`, `npm run test:e2e`, `npm run test:csp`, and `BUILD_OG=1` for the final build through its `env:` block. Then: grep the built HTML for em dashes, en dashes and spaced hyphens; confirm no individual is named in any new text (the quotes are statutory or council text: read all 174 once); confirm every new figure has a source line under it; count the words in Burnley's and Birmingham's profile sections (text of every `[data-profile-section]` plus the type line, excluding the council tax answer and the details tables) and report both counts in the PR body against the 400 to 600 target, without padding to reach it. Not dry run on a build, because the components do not exist yet: the sentences this brief specifies come to 358 words for Burnley (counted with `wc -w` on the filled templates, source lines included, tables excluded), on top of the roughly 120 the profile has today, so about 480. Screenshots: Burnley and Birmingham at 375px and desktop, light and dark, plus the City of London collection strip at 375px. PR title: "Council profiles: population, collection, elections and two position strips". End the body with "Built with Codex from a brief prepared in Claude Code." Do not merge.

## Stop and report, rather than work around it, if

- any pinned hash differs, or the collection output is not byte identical to ukcounciltax's;
- a count or anchor in this brief does not match the data;
- B1 has not merged, or its EFS section or `ProfileAbout` position differs from the B1 brief;
- a sentence would need a figure or source the data files do not hold;
- the reorganisation hold test fails, or any new text other than a cited document title would print reorganisation or abolition.

## Decisions for Tom (not for Codex)

1. **Who runs each council.** No current seats by party source meets the rule. Options: a pinned, dated and hashed copy of Open Council Data's current composition table (a third party compilation, CC BY-SA), or a register built from each council's own published composition page. Visual 2 below is ready to build on either.
2. **Cycle years.** 46 verified election years (all 32 London boroughs other than the City, Liverpool, Swindon, County Durham, Rossendale and others) are a reading of a stated cycle. If Tom accepts that, the words would be: "{source} sets elections {quote}. On that cycle the next ordinary election is in {year}." with the method in the source line. Held until then.
3. **Surrey.** The 11 abolished districts could print "Abolished on 1 April 2027 by the Surrey (Structural Changes) Order 2026" from the register. That is reorganisation content while the Lancashire field stays held.
4. **Registry names.** `officialName` is wrong for at least Birmingham, Barnsley and the Isles of Scilly; the registry refresh from UK Places, already owed for the reorganisation field, should fix it.

## Appendix: visual 2, seats by party bar (specified, held)

Build only when a source Tom has approved exists as `data/elections/composition.json`:

```json
{"source": {"publisher": "", "title": "", "url": "", "retrieved": "", "sha256": "", "licence": ""},
 "councils": {"<gss>": {"asOf": "YYYY-MM-DD", "total": 45, "seats": [{"party": "", "count": 0}], "controlAsPrinted": null}}}
```

Rules: `sum(seats.count) === total` for every council, else the importer fails; vacancies only if the source lists them, as a "Vacant" entry; `controlAsPrinted` is the source's own words or null, and nothing computes control or a majority threshold.

`src/components/SeatsBar.astro`: one horizontal stacked bar, `viewBox 0 0 640 72`, segment width proportional to count over total, parties ordered by count descending, ties by name; no party colours: segments alternate `var(--accent)`, `var(--accent-bright)`, `var(--border-strong)` with a 2px `var(--bg-card)` gap so adjacent segments separate in both themes; each segment has `<title>{party}: {count} seats</title>`; a label inside the segment only where it is at least 56 units wide, otherwise every party and count in a list under the bar; `<desc>` "Bar chart. {total} seats on {name} council as at {asOf}: {party count, party count, ...}."; then the source line, then a `<details>` table (party, seats), all inside the component. Test anchors are set when the source is chosen.
