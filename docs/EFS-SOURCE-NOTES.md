# Exceptional Financial Support | source notes

Prep done in Claude Code on 8 November 2026 for idea I007. These notes are binding on the Codex build in `docs/EFS-BRIEF.md`. The curated data is in `data/efs/statements.json`, and the exact page bodies it was read from are in `data/efs/raw/`.

## 1. The source

Publisher: Ministry of Housing, Communities and Local Government. Licence: Open Government Licence v3.0. Collection: "Exceptional Financial Support for local authorities", https://www.gov.uk/government/collections/exceptional-financial-support-for-local-authorities (updated 23 February 2026). There is one GOV.UK guidance page per financial year. Each was read through the GOV.UK content API (`https://www.gov.uk/api/content/guidance/<slug>`, field `details.body`) on 8 November 2026.

| Year page | First published | Last updated | body sha256 (first 16) |
|---|---|---|---|
| 2020-21 | 2024-02-29 | 2025-03-13 | 65ff0ed9701762fa |
| 2021-22 | 2024-02-29 | 2025-03-13 | 9e1e61b9f5b0a4b4 |
| 2022-23 | 2024-02-29 | 2026-02-23 | 4d7d1bf2e6dc6da7 |
| 2023-24 | 2024-02-29 | 2026-03-05 | 6b593df4c59c9a82 |
| 2024-25 | 2024-02-29 | 2026-03-05 | 10d4c7eedaf474a0 |
| 2025-26 | 2025-02-20 | 2026-08-18 | 0b8e265d6154d868 |
| 2026-27 | 2026-02-23 | 2026-08-18 | 3c8887b6f86d1044 |

The full URLs, hashes and each page's change history are in `statements.json` under `pages`. MHCLG's 2025-26 and 2026-27 pages say: "The pages for previous years have been updated to reflect the most recent decisions." Section 4 shows that this does not hold for every figure.

## 2. What the pages hold

Each page has a main table headed "Exceptional Financial Support requests from local authorities: <year>", with one row per authority and one free-text cell. Some pages add further tables:

| Page | Main table rows | Other tables | Count in the page's own prose |
|---|---|---|---|
| 2020-21 | 9 (2 marked withdrawn) | none | "agreed to provide 7 councils" |
| 2021-22 | 8 (4 marked withdrawn) | none | "provided 4 councils" |
| 2022-23 | 5 (1 marked withdrawn) | none | "agreed to provide 5 councils" |
| 2023-24 | 8 | none | "agreed to provide 8 councils" |
| 2024-25 | 19 (1 marked withdrawn) | "Capitalisation support for 2024-25": Norfolk | "agreed to provide 19 councils" |
| 2025-26 | 29 | Housing Revenue Account: Lambeth; Police Force: South Yorkshire Mayoral Combined Authority | "agreed to provide 30 councils" |
| 2026-27 | 36 | Housing Revenue Account: City of London; Police Force: Kent Police and Crime Commissioner, South Yorkshire Mayoral Combined Authority; Birmingham's revised profile for earlier years | no count printed |

Print each page's prose count as quoted, beside the number of rows. Do not reconcile them: 2022-23 says 5 councils, but one of its five rows is marked withdrawn.

A cell can hold several things: the figure for the page's year; amounts for earlier or later years; a figure later revised ("This was subsequently revised to", "reprofiled"); a note revising another year ("Note: For support agreed in-principle for 2024-25, this has been revised to £490.0m (from £685.0m)"); a total covering several years together with its yearly breakdown; and markings such as "(support agreed in-principle)", "(in the form of grant)" and "(support agreed in February 2026)".

## 3. How the data is curated

`statements.json` has one statement for each of the 126 table rows. Each records its page, its table (`main`, `hra`, `police`, `later`, `birmingham_revised`), the authority as printed, the sha256 of the cell text, and its figures. There are 216 figures in all, each with:

- `supportYear`: the year the amount relates to, or a range such as "2018-19 to 2021-22" for a covering total;
- `amountGbpM`: the amount in £ million exactly as printed ("56.614", "130", "130.0"). Precision is never added or removed;
- `marking`: MHCLG's wording for the figure, or null where it prints none;
- `role`, one of:
  - `stated` (105): the figure the page gives for its own year;
  - `prior_year` (42) or `later_year` (1): an amount for another year in the same cell;
  - `revision_note` (22): a revised figure printed in a note or a reprofiling sentence;
  - `superseded` (35): a figure the same cell says was revised;
  - `covering_total` (3): a total printed beside its own yearly breakdown, never to be added to it;
  - `withdrawn` (8): "Council provided with in-principle support but withdrew its request", which has no amount;
- `note`, where needed: for example Lambeth 2020-21's extension of an earlier capitalisation, or MHCLG's "provisionally includes" notes for Somerset and Southampton.

The 57 cells that hold more than one simple figure were read by hand. The 69 simple cells were parsed by rule. Every amount can be checked offline against its raw cell; the brief makes that a test.

**Authorities.** There are 57. 51 match a ukcouncils registry council by name and carry its GSS and slug. Six have no ukcouncils page:
- three county councils: Norfolk E10000020, Worcestershire E10000034 and East Sussex E10000011. Their codes come from the Table 10 county parts in ukcounciltax's `data/national/england.json`; the registry holds no counties;
- Copeland, a former district council, with no code recorded and no claim about successors;
- South Yorkshire Mayoral Combined Authority and Kent Police and Crime Commissioner, with no code recorded.
Names printed two ways ("Redcar & Cleveland" and "Redcar and Cleveland"; "Windsor & Maidenhead" and "Windsor and Maidenhead") resolve to one authority.

**House style in the data.** Cell text is not stored, only its hash, because the cells in Birmingham's revised table join the earlier figure to its marking with a spaced hyphen, which the house rules forbid on any surface. The figures and markings are stored without it. The raw bodies in `data/efs/raw/` are verbatim source snapshots and keep MHCLG's punctuation, including one en dash in a 2026-27 heading. They are inputs to tests only and must never be rendered or copied into a page.

## 4. Figures that differ between pages

`multipleFigures` lists the 11 cases where one authority's general fund support for one year has more than one distinct amount across the pages (Housing Revenue Account support is kept separate). Values are compared as numbers, so 130 and 130.0 are the same.

| Authority | Year | Figures by page | What MHCLG says about the relation |
|---|---|---|---|
| Birmingham | 2020-21 | 2024-25 page £288.4m; 2026-27 page £99.5m | revised: the 2026-27 page says the government agreed in February 2026 to alter the previously agreed profile |
| Birmingham | 2021-22 | £109.5m; £97.4m | revised, as above |
| Birmingham | 2022-23 | £172.2m; £169.6m | revised, as above |
| Birmingham | 2024-25 | 2024-25 and 2025-26 pages £490.0m; 2026-27 page £405.7m | revised, as above; the revised row gives the earlier figure as £491.1m, not £490.0m |
| Birmingham | 2025-26 | 2025-26 page £180.0m; 2026-27 page £36.7m | revised, as above |
| Thurrock | 2023-24 | 2023-24 page £180.17m and, in the same cell, a reprofiled £184.0m; 2025-26 page £184.0m | not clear |
| Thurrock | 2024-25 | 2024-25 page £73.02m; 2025-26 page £96.0m; 2026-27 page £73.02m | revised: the 2025-26 and 2026-27 pages each print a revision note |
| Croydon | 2019-20 | 2023-24 page £126m; 2024-25 page £9.4m | not stated: MHCLG does not say whether the figures add together or replace each other |
| Croydon | 2020-21 | 2020-21 page £70.0m; 2023-24 page £10m | not stated |
| Croydon | 2021-22 | 2021-22 page £50.0m; 2023-24 page £14.4m | not stated |
| Croydon | 2022-23 | 2022-23 page £25.0m; 2023-24 page £11.2m | not stated |

**Display rule.** Show every figure with its page, its marking and the relation text. Never pick a "current" figure, never add the figures together, and never fill in a relation MHCLG does not state.

## 5. Rules for any page built on this

- No totals across councils or years. The figures mix in-principle and final amounts, capitalisation and grant, and general fund and HRA support. Counts are the number of rows a page lists, stated as such.
- Never rank or compare councils by amount.
- Use MHCLG's terms: "Exceptional Financial Support", "support agreed in-principle", "capitalisation direction". No motive or judgement words; the ukcouncils tests already grep for them.
- No individual is named anywhere in the data. Keep it that way.
- Years are shown in the site style (2026/27), with MHCLG's page titles quoted as printed in source lines.
- Capitalisation direction PDFs, assurance reviews and request letters are listed on the pages, but this build does not link them; that is a later step.

## 6. Not done here

- No check that each capitalisation direction PDF's amount matches its table cell.
- No 2027-28 page exists yet (by pattern, the list comes in late February). C2b adds it through the change check in the brief.
