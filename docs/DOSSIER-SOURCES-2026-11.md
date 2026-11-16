# Dossier source decisions | November 2026

**Later decision, 16 November 2026:** Option A is now adopted only under the pinned snapshot and control gates in [the implementation record](COMPOSITION-SNAPSHOT-2026-11-16.md). The research and hold descriptions below record the earlier decision state.

Research checked 15 November 2026, originally against `f4311a8fbb9408c1bb727a2f25d02e1bb6ded925`. Rebased after PR 59 merged, onto `origin/main` at `96df5d19cb386ab78dda76af8d6937e1070748d6`. The denominator is the 296 entries in `data/council-tax/england-2026-27.json`, not the 361-body registry. The mid January 2027 dossier gate remains binding. This research does not complete that gate or authorise a rendering change.

The source bundle is [docs/dossier-sources-2026-11](./dossier-sources-2026-11/). Its [manifest](./dossier-sources-2026-11/manifest.json) records SHA-256 hashes and sizes of retained files, plus separate hashes of original responses where obtainable. Retained sources are selected extracts without personal names, not byte-identical HTML or PDF copies. Original content was processed in memory. Names, contacts, signatures, portraits and author metadata were excluded before files were written. A blocked original has a null original hash, never the hash of an error page. The extract itself still has a manifest hash.

Verify all retained hashes and reproduce the audit and notice dry runs in memory from the pinned extracts with Node 22.23.4 first on PATH:

```sh
node docs/dossier-sources-dry-run.mjs
```

The default command is read-only and offline: it checks every retained-file hash and both input hashes, then compares all three regenerated results in memory with the committed dry runs. `--write` explicitly regenerates the dry runs and their hashes, while still requiring unchanged source and input hashes. `--verify-psaa` additionally retrieves the workbook in memory, verifies its original hash and reconstructs every retained organisation label and occurrence count. It writes no original workbook. No command renders application data. Reconciliation sums are research checks, not new published figures. Source dates, retrieval dates and effective dates remain distinct. The requested `src/lib/redaction.ts` does not exist at this base. The referenced module in the sibling frontend was read; it is a supplier filter, not a general personal-name detector. These extracts instead use selected fields, followed by a name scan and manual inspection.

## 1. External audit status

### Publications found

**MHCLG**, [Addressing the local audit backlog in England: Non-compliance lists](https://www.gov.uk/government/publications/addressing-the-local-audit-backlog-in-england-non-compliance-lists/addressing-the-local-audit-backlog-in-england-non-compliance-lists--2), updated **26 March 2026**, with subsequent-publication information as at **9 March 2026**. Licence: Open Government Licence v3.0, identified on GOV.UK. Original HTML SHA-256: `49e66ae8896985dfa87202c925c3cb36da643ef181b2dd6e7822cdaeb74d9d78`. The retained file is `audit-mhclg-tables.json`.

| Table identified by backstop | Financial years | Retained body rows |
|---|---|---:|
| 13 December 2024 | Up to and including 2022/23 | 67 |
| 28 February 2025 | 2023/24 | 50 |
| 27 February 2026 | 2024/25 | 33 |

These are lists of selected bodies that did not publish by the relevant backstop, not a census of councils. The first table has 67 rows although the surrounding publisher text says 68 bodies. Preserve that discrepancy. Do not add a row or infer the missing identity. The separate six-row table of backstop dates is not body data.

The column headings retained verbatim, apart from dash typography, define the values: draft accounts published by the specified inspection deadline; appointed audit firm; audit opinion delivered by the backstop; date delivered; and opinion published as of 9 March 2026. A `yes` is the answer to that specific dated question. It is not an unqualified opinion. The oldest table asks about all opinions up to 2022/23, rather than one opinion for a single year. A pension-fund-only entry cannot become a main-council-accounts status. A missing row is not evidence of publication or exemption.

**Public Sector Audit Appointments Limited**, [September 2026 audit opinion data](https://www.psaa.co.uk/managing-audit-quality/monthly-audit-opinion-data/september-2026-audit-opinion-data/), announced **19 October 2026**, as at **30 September 2026**. The monthly index exposed September as its latest edition when checked. [Detailed workbook](https://www.psaa.co.uk/wp-content/uploads/2026/10/Opinion-data-detailed-30Sep2026-website.xlsx), SHA-256 `4f7f0ace0b299113205faec36f4d13230d708ec4aeab5ad3f34146fa0a11f988`.

The workbook has one sheet per year from **2018/19 to 2025/26**. In that order, their audit-row counts are **561, 552, 547, 540, 540, 534, 531 and 534**. A further CRM sheet repeats the records and must not be counted again. The columns are `Audit Year`, `Organisation Name`, `Firm`, `Sector Type`, `Audit Status` and `Audit Signed Date`. No geography code column exists.

The publisher calls this data **audit opinion delivery** for bodies opted into its appointment scheme. Its printed statuses include `Unsigned`, `Delivered On Time`, `Late Opinion Delivered`, `Delivered by backstop` and `Post backstop opinion delivered`. They describe delivery timing under the applicable year's deadline, not the content of the opinion. The separate monthly summary distinguishes bodies from audits by including pension funds in bracketed values. For example, its 2025/26 scope is 460 bodies and 534 audits. Do not equate the sheet's 534 rows with 534 councils, or delivery with publication of accounts. `audit-psaa-inspection.json` retains sheet schemas and counts by the printed status, not the full per-body workbook.

PSAA's [legal terms](https://www.psaa.co.uk/legal/) are **not OGL**. They permit non-commercial reproduction with acknowledgement and retained notices, and restrict modification without prior written consent. The original workbook has populated creator metadata. It is not committed. A transformed full per-body redistribution remains held pending licence resolution; the GOV.UK licence does not travel to the linked PSAA workbook.

### Exact-code dry run and dependency

[dry-run-audit.json](./dossier-sources-2026-11/dry-run-audit.json) reports **0 of 296 exact GSS or ONS joins for both publications**. Both identify bodies by name. It lists every profile without a code-addressable row, including its GSS code and class. This is a join-key gap, not a claim that all 296 bodies are absent from the publisher's data. This exact-code dry run uses no name join, manually fabricated code column or predecessor substitution. The separate name diagnostic below does not change that result.

A build needs an independently evidenced mapping between each publisher body identifier and the profile code, with pension funds, other body types, historic bodies and changed boundaries treated separately. A council-name similarity match is not that evidence. The current sources therefore resolve publication discovery and meaning, but do not close C3's exact-identity dependency.

**A build would show:** after identity approval, the selected publisher's dated delivery or publication status, its financial year and source line. The latest inspected PSAA edition also covers 2025/26 before its 31 January 2027 backstop.

**A build would leave absent:** all audit profile sections at present; opinion type, financial condition, reasons, rankings, and any status inferred from an absent row. The two publications would remain separate measures.

**Decision required:** choose the measure, commission an evidenced code crosswalk, and resolve PSAA reuse terms if selecting its per-body data. Accepting a source by name alone would change the current exact-code rule and is not assumed here.

### Separate official-name diagnostic

[dry-run-audit-names.json](./dossier-sources-2026-11/dry-run-audit-names.json) compares source body labels with **registry `officialName`**, the pinned GOV.UK Local Links Manager names in `data/registry/councils.json`. The denominator remains the 296 billing profiles, selected by code before comparing names. Registry short names are not used.

The only normalisation is lower case, replacement of `&` with `and`, and removal of one trailing `Council` together with its preceding space. There is no whitespace folding or trimming, punctuation removal, footnote stripping, word reordering, abbreviation expansion, alternate name, historic predecessor substitution or fuzzy matching. A body that matches multiple profile codes is ambiguous and is never assigned. Repetition of the same body in separate years is not ambiguity.

| Publication, all inspected cohorts | Exact code profiles | Literal-name profiles | Normalised-name profiles matched | Profiles unmatched | Profiles ambiguous | Distinct source bodies matched / unmatched / ambiguous |
|---|---:|---:|---:|---:|---:|---|
| MHCLG backstop lists | 0 of 296 | 68 | 69 of 296 | 227 | 0 | 69 / 51 / 0 |
| PSAA workbook | 0 of 296 | 253 | 259 of 296 | 37 | 0 | 259 / 337 / 0 |

MHCLG has 150 body rows across three tables and 120 distinct labels; PSAA has 4,339 audit rows across eight year sheets and 596 distinct labels. These are source scopes, not counts of current billing councils. The combined figures are unions of names across cohorts, not a single-year status. PSAA's CRM sheet is excluded.

| Source cohort | Profiles matched | Profiles unmatched | Profiles ambiguous | Source bodies matched / unmatched / ambiguous | Exact code profiles |
|---|---:|---:|---:|---|---:|
| MHCLG up to 2022/23 | 45 | 251 | 0 | 45 / 22 / 0 | 0 of 296 |
| MHCLG 2023/24 | 30 | 266 | 0 | 30 / 20 / 0 | 0 of 296 |
| MHCLG 2024/25 | 14 | 282 | 0 | 14 / 19 / 0 | 0 of 296 |
| PSAA 2025-2026 | 259 | 37 | 0 | 259 / 275 / 0 | 0 of 296 |
| PSAA 2024-2025 | 259 | 37 | 0 | 259 / 272 / 0 | 0 of 296 |
| PSAA 2023-2024 | 259 | 37 | 0 | 259 / 275 / 0 | 0 of 296 |
| PSAA 2022-2023 | 250 | 46 | 0 | 250 / 290 / 0 | 0 of 296 |
| PSAA 2021-2022 | 250 | 46 | 0 | 250 / 290 / 0 | 0 of 296 |
| PSAA 2020-2021 | 248 | 48 | 0 | 248 / 299 / 0 | 0 of 296 |
| PSAA 2019-2020 | 247 | 49 | 0 | 247 / 305 / 0 | 0 of 296 |
| PSAA 2018-2019 | 245 | 51 | 0 | 245 / 316 / 0 | 0 of 296 |

The JSON lists **every unmatched source body** in each publication's `combined.unmatched_bodies`, preserving its exact label and all cohort occurrences, and **every unmatched profile** in `combined.unmatched_profiles`, with official name, GSS code and class. Both `ambiguous_bodies` and `ambiguous_profiles` are empty for both publications. Matched labels, candidate official names and cohort counts are included so every classification can be checked. No body is silently dropped because it is a pension fund, police body, historic council or outside the profile set.

For example, MHCLG's `Basildon Borough Council *` stays unmatched: the asterisk is not stripped. PSAA's `Bexley London Borough Council` is not reordered to `London Borough of Bexley`. Those source gaps and naming differences remain visible. The pension-fund-only Merton label is not reduced to a main-council label.

[audit-psaa-body-names.json](./dossier-sources-2026-11/audit-psaa-body-names.json) retains factual organisation labels and occurrence counts only, extracted from the workbook after its original SHA-256 verified. No per-body audit status, signed date, firm or workbook metadata is copied into that inventory. The full workbook and a transformed audit dataset remain uncommitted. This diagnostic adopts **no crosswalk** and changes no application loader. Source measure, identity acceptance and PSAA reuse remain decisions for Tom.

## 2. Section 114 notices

### Register search and verified documents

No maintained official national notice register was located in the GOV.UK, MHCLG, Parliament and council-site searches recorded in `section-114-register-search.json`. This is a bounded search finding, not proof that no register exists. The [House of Commons Library briefing, Local authority financial resilience](https://commonslibrary.parliament.uk/research-briefings/cbp-8520/), **15 May 2025**, contains a historical table and separate discussion of subsection 2 notices. It is an official research publication, not a continuously maintained exhaustive register.

The two original notice documents inspected are recorded in [section-114-notices.json](./dossier-sources-2026-11/section-114-notices.json), with original hashes, locators and short extracts:

| Council | Notice date | Provision cited | Council's original document |
|---|---|---|---|
| Thurrock | 19 December 2022 | Local Government Finance Act 1988, section 114(3) | [Notice, page 1 and paragraph 1.2](https://www.thurrock.gov.uk/sites/default/files/assets/documents/section114-notice.pdf) |
| Nottingham | 29 November 2023 | Local Government Finance Act 1988, section 114(3) | [Report, page 1 heading and date](https://www.nottinghamcity.gov.uk/media/jmzb22b0/report-made-under-part-viii-s114-3-of-the-local-government-finance-act-1988-291123.pdf) |

Official confirmations also identify the following dates. These are **retrieval leads, excluded from verified notice coverage**, because the original notice and its subsection have not both been inspected. The full URLs and access limitations are in the same source file.

| Council | Date reported | Official evidence located |
|---|---|---|
| Birmingham | 5 September 2023 | Council FAQ; notice download returned HTTP 403 |
| Birmingham | 21 September 2023 | Council FAQ identifies a supplementary notice |
| Woking | 7 June 2023 | Council notice page; direct access returned HTTP 403 |
| Slough | 2 July 2021 | Council announcement and notice download; download returned HTTP 403 |
| Croydon | 11 November 2020 | Council announcement |
| Croydon | 2 December 2020 | Council minutes of 16 December |
| Croydon | 22 November 2022 | Council announcement and linked notice; PDF returned HTTP 403 |
| Barnet | 20 January 2025 | MHCLG letter gives the joint report's publication date, not a separately verified issue date |
| Northumberland | 23 May 2022 | Council agenda identifies the statutory report date |

The original documents retain council copyright. Only selected factual identification extracts are retained here; no broad open licence is assumed. No signature, personal name, financial amount or explanation is copied. The Act's [section 114](https://www.legislation.gov.uk/ukpga/1988/41/section/114) has distinct subsections: record the exact provision in each document instead of treating all notices as section 114(3).

### Register requirements and dry run

A council-by-council register needs the original notice on the council's own site, its issue date, the Act and exact subsection, an extract locator, original and retained-file hashes, retrieval date, licence and redaction record. It also needs evidenced body identity, separate supplementary notices, and a search log distinguishing unsearched, inaccessible and inspected records. A later statement about cessation or supersession needs its own official document. An old notice does not establish a current restriction.

[dry-run-section-114.json](./dossier-sources-2026-11/dry-run-section-114.json) holds two inspected documents associated with two profiles through explicit manual review of official council identity. Neither PDF prints a native GSS code, so **native-code joins are zero**. The profile assignments are labelled separately, not presented as publisher-supplied codes. The other 294 profiles have no inspected notice in this bundle; that is not a statement that they have never issued one. Exceptional Financial Support is never evidence of a notice. No cause is recorded.

**A build would show:** once the identity method is approved, a dated link to each inspected notice and the exact statutory provision, explicitly described as a historical document record.

**A build would leave absent:** notices supported only by announcements or inaccessible originals; any negative status for other councils; current restrictions without later evidence; explanations and any inference from financial support.

**Decision required:** approve a non-exhaustive official-document register, its explicit identity assignment and maintenance owner. Require original-notice inspection for additions. Complete the nine retrieval leads before treating them as verified records.

## 3. Seats by party: two source options

### Option A: Open Council Data

Pinned [English Council Compositions 2026](https://opencouncildata.co.uk/councils.php?model=E&y=0), retrieved **15 November 2026**, with the homepage's **15 November 2026** last-updated label recorded separately. The table's original HTML SHA-256 is `0b17adb555571dd84424722367f1604e1ce820670d131cac22a03b95f9163c98`. Each linked council page's URL and original response hash are preserved in the provenance appendix below. The former machine-readable copy is removed under the composition hold. The homepage date is site-wide; it is not an effective date certified for every council.

The current table is website content under **Creative Commons Attribution ShareAlike 4.0**, linked by the publisher. Its [reuse page](https://opencouncildata.co.uk/aboutthissite.php) separately declares **CSV downloads public domain**. Do not apply the CSV declaration to a scraped current website table. Attribution and the transformation record accompany the retained website extracts. These are third-party compiled values, not official council returns.

There are **318 English-body rows**, all reconciling across the printed `Lab`, `Con`, `LD`, `Grn`, `Ref`, `Oth` and `Vac` columns to `Total`. `Oth` is the publisher's aggregate category, not a named party. `Vac` is a stated vacancy count, not a party. Control and coalition fields are excluded. GSS codes are obtained through the table's actual linked council IDs, then joined exactly to profiles, not assigned from names.

| Profile class | Exact matches |
|---|---:|
| Shire district | 164 of 164 |
| Unitary authority | 62 of 63 |
| Metropolitan district | 36 of 36 |
| Inner London borough | 13 of 13 |
| Outer London borough | 20 of 20 |
| Total | 295 of 296 |

**Isles of Scilly, E06000053, has no row.** The 23 out-of-scope rows are 21 counties and East Surrey and West Surrey. They are listed below and do not replace existing profiles. City of London joins, but its chamber definition still needs review before drawing a generic parties bar.

This is a 2026 source, unlike the held 2025 compilation described in B2. The publisher's [2016 to 2026 composition CSV](https://opencouncildata.co.uk/history2016-26.csv), SHA-256 `c0d9b68024fd0481c745ded76e16cf107ea17b5205c443cedbbe75892500177c`, is described as a snapshot shortly after the May elections. Its 2026 rows cover all 295 joined profiles and reconcile. The former baseline copy is recoverable from commit `3e708ae`; its provenance and reconciliation findings remain below. The archive and current table therefore include the 7 May 2026 election period; they are not a certified effective-date history for every body. A 2026 archive row is not proof that that council's last ordinary election was in 2026.

The diagnostic comparison finds **182 profiles with at least one changed party bucket since the 2026 archive**. The former dry run at commit `3e708ae` records every before and after value. Its diagnostic mapping groups UKIP, PC and SNP into Other and does not backfill archive vacancies. No such composition dataset remains at this branch tip. It does not infer a defection from a difference. The publisher's linked party-change table supplies **635 rows after 7 May 2026 across 206 profile codes**, joined through its council IDs. Repeated changes or reversals explain why event coverage and net snapshot differences are different measures; no row is deduplicated just because personal names have been removed.

The separate by-election archive is pinned without wards or names. It includes holds and warns that coverage may be incomplete. Its rows have neither GSS codes nor linked council IDs, so they are not name-joined to profiles. Its date column must not be labelled polling date: Manchester's entry says 11 September whereas the council gives 10 September. These event sources identify councils requiring review; they do not reconstruct current totals or provide an exhaustive history since each council's last election.

### Option B: twenty official council sources

The purposive sample has **four councils in each of the five profile classes**. The table and provenance appendix preserve each URL, exact party or political-group label, date shown, capture method, original hash where obtainable and reconciliation. The former side-by-side diagnostic remains recoverable from commit `3e708ae`; no disagreement was resolved automatically.

| Council | Class | Date shown | Published totals | Sum / council seats |
|---|---|---|---|---|
| Burnley | SD | None | Burnley Independent Party 10; Labour 8; Labour & Cooperative 2; Conservative 3; Liberal Democrats 6; Green Party 3; Reform UK 12; Restore Britain 1 | 45 / 45 |
| Cambridge | SD | Reviewed 2 November 2026 | Labour 15; Green Party 12; Liberal Democrat 11; Independent 3; Conservative 1 | 42 / 42 |
| Oxford | SD | None | Labour Group 20; Green Group 13; Liberal Democrat Group 9; Oxford Independent Alliance Group 4; Real Independent Group 2 | 48 / 48 |
| Woking | SD | Meeting 19 May 2026 | Liberal Democrat Group 23; Independent and Others Group 7 | 30 / 30 |
| Bristol | UA | None | Conservative Party 7; Green Party 34; Labour Party 19; Liberal Democrats 9; Independent 1 | 70 / 70 |
| Leicester | UA | None | Labour Party 32; Conservative Party 15; Green Party 4; Liberal Democrat Party 3 | 54 / 54 |
| Nottingham | UA | None | Labour Group 44; Nottingham People's Alliance Group 6; Nottingham Independents and Independent Group 4; Not a member of a political group 1 | 55 / 55 |
| Portsmouth | UA | None | Liberal Democrat 18; Conservative 8; Labour 8; Portsmouth Independents Party 6; Portsmouth Community Independents 2 | 42 / 42 |
| Birmingham | MD | Updated 8 June 2026 | Reform UK 23; Green Party 19; Labour 16; Conservative 16; Liberal Democrat 12; Better Birmingham 7; Birmingham Independent Workers Group 5; Birmingham Independents Group 2; Independent 1 | 101 / 101 |
| Leeds | MD | None | Labour 46; Conservative 15; Green 10; Reform UK 8; Liberal Democrats 6; Garforth and Swillington Independents 3; Morley Borough Independents 3; Social Democratic Party 3; Independent 4; Vacancy 1 | 99 / 99 |
| Manchester | MD | Meeting 23 September 2026 | Labour 64; Green 21; Reform 7; Liberal Democrat 4 | 96 / 96 |
| Sheffield | MD | None | Labour Group 26; Liberal Democrat Group 22; Green Group 19; Reform UK Group 11; Sheffield Community Councillors Group 2; The New Chartist Reform Group 2; Independent 2 | 84 / 84 |
| Camden | ILB | None | Labour 45; Liberal Democrat 5; Conservative 3; Green 1; Vacant 1 | 55 / 55 |
| Islington | ILB | None | Labour 44; Green 3; Independent 4 | 51 / 51 |
| Lambeth | ILB | Published 3 June 2026 | Green Party 27; Labour 26; Liberal Democrats 8; Casual vacancies 2 | 63 / 63 |
| Wandsworth | ILB | Published 18 May 2026 | Conservative group 29; Labour group 28; Independent 1 | 58 / 58 |
| Bromley | OLB | None; 7 May election mentioned | Conservatives 35; Labour 8; Liberal Democrats 6; Reform UK 5; Chislehurst Matters 3; Independent 1 | 58 / 58 |
| Harrow | OLB | None | Conservatives 41; Labour 12; Arise 1; Independent 1 | 55 / 55 |
| Hillingdon | OLB | None; May election mentioned | Conservative 31; Labour 16; Reform 3; Green 1; Independent 2 | 53 / 53 |
| Kingston upon Thames | OLB | Meeting 21 May 2026 | Lib Dems 44; KIRG 2; Conservatives 2 | 48 / 48 |

All **20 sums reconcile**. Sixteen sources print the chamber total on the same page; Manchester, Camden, Lambeth and Wandsworth use separately cited official council descriptions for that check. Only **seven** sources show a relevant review, publication or meeting date. Thirteen do not. Footer copyright years and unrelated allowance dates are not composition dates. Eleven main source responses were fetched and hashed directly; nine were available only through indexed official text or the web reader and retain no claimed original-byte hash.

This is a sample of source suitability, not twenty approved current compositions. Woking and Nottingham report mixed political groups which cannot be split into parties without additional evidence. Portsmouth's recruitment page retains a 2023/24 budget context and describes 2025 as its next fallow year. Camden and Islington's undated figures differ substantially from the current compilation. Lambeth's dated article precedes two announced July by-elections. Hillingdon's official `pre` subdomain requires confirmation against the live canonical page. The Woking and Kingston report originals were inaccessible directly. None of these limitations is repaired by arithmetic reconciliation.

Official evidence independently confirms that composition changes after an election. Cambridge's **8 May 2026** result gives Labour 17 and one Your Party seat; its page reviewed **2 November** gives Labour 15 and three Independents, with the other totals unchanged. Harrow's **8 May** result gives Conservatives 42; its current undated page gives 41 and one Independent. Those differences do not by themselves establish the mechanism. Manchester's **23 September** minutes explicitly record a party change and the **10 September** by-election before listing the new totals. Only the source findings and provenance are retained in this document; the former official-change extract is recoverable from commit `3e708ae`.

### Keeping either option current

Option A has no published access charge for the inspected public pages or archive CSV. This acquisition needed one composition table and 318 linked identity pages, plus the separate date, licence, archive and change sources. Once identities are pinned, a refresh can compare one new table, rechecking changed identities and source labels. It still needs human review of vacancies, contradictory official pages, special authorities and changes after polling day. No paid product was purchased or treated as required. Accept the compilation's CC BY-SA terms before adopting this route.

Option B needs at least **296 council-specific source checks per full sweep**, plus missing-date, mixed-group and access follow-up. The twenty-source trial produced thirteen missing dates and nine originals not directly retrievable, so an unreviewed scraper is insufficient. There is no measured staff-time or cash quote to convert this into an hours or pounds estimate. A proposed operating rule is a weekly snapshot and review after ordinary elections, by-elections and published party changes, with a named maintenance owner and an explicit stale-data rule. This is a proposal, not a scheduled automation. Each council needs its own last-election baseline before making a complete claim about changes since its last election.

The sample excludes counties because they have no billing profiles. It is not an extrapolation to the unsampled 276 profiles. City of London and Isles of Scilly need explicit chamber and source treatment. For either option, snapshot differences trigger verification rather than reconstructed totals. Keep vacancies only where printed, fail closed on a total mismatch, and preserve political groups as groups unless party membership totals are separately published.

**A build would show:** after source approval, dated party totals and explicit vacancies that reconcile, with publisher, table, date, licence and coverage caveat. Option A offers 295 exact profile identities; Option B offers twenty researched sources with suitability limits, not national coverage.

**A build would leave absent:** Isles of Scilly under Option A; unverified, stale, undated or incompatible group records under the chosen Option B rule; inferred control, coalition, majority and every personal name. No previous-year scaling or estimated composition is acceptable.

**Decision required:** choose the third-party compilation or official-council route; decide whether the compilation's Other category and site-wide snapshot date are acceptable, or require per-council effective dates and party detail. For official sources, decide whether a clearly labelled retrieval date can support an undated page, without presenting it as the effective date. Assign maintenance ownership and approve special-authority treatment before implementation. C2 remains held until that decision and the selected source gates are satisfied.

## Composition provenance retained for the decision

All seven composition source files and `dry-run-seats.json` are removed from the branch tip. They remain recoverable from commit `3e708ae`. The composition hold applies to committed datasets wherever stored. This document retains research findings and provenance so a source decision does not require recovering those files. No composition source is adopted.

All composition sources below were retrieved on **15 November 2026**. A date printed by a source is identified separately. Every hash labelled original is SHA-256 of the original response bytes. `n/a` means those bytes were unavailable, not an empty file or a hash of an error response.

### Removed extracts and retained counts

| Former file in commit 3e708ae | Retained-file SHA-256, not original response | Count and reconciliation finding |
|---|---|---|
| `composition-2026-election-baseline.json` | `3fc26c06ca81751a9cfc728814889cbc6a60ee655da73e7646ecfe6bc7ffd196` | 384 UK 2026 archive rows retained in the former extract; 295 joined profiles all have a baseline and reconcile; 182 have changed buckets. |
| `composition-by-elections.json` | `e769fb48154b0cd5bcc062ba62cf6137c6e110db6743b6cb0b9dc8ee2f55ab62` | 212 rows after 7 May, including holds; zero exact profile joins; coverage may be incomplete; source dates are not verified polling dates. |
| `composition-official-change-evidence.json` | `42e2a6cf8d4809dceb8b7d27e428076b2576e7c607918b40c6accc3e03be8cb1` | Three official documents; two originals hashed, one unavailable; confirms changed totals without inferring a mechanism from snapshot differences. |
| `composition-option-a.json` | `d2bee2796b743df747114c5f3179628431f4ba8daa30870e38fb98d6478c27d0` | 318 English rows; all 318 reconcile; 295 exact profile codes; one missing profile; 23 out of scope. |
| `composition-option-b-sample.json` | `fb72fe0a398b601cfcd9ff9a4d0dd5747bb07aaef8f85f594e0e915a58f31071` | 20 official sources, four per class; 20 sums reconcile; 16 totals on the same page, four separately supported; seven dated, thirteen undated; eleven main originals hashed, nine unavailable. |
| `composition-party-changes.json` | `5c65dbe6a0af08fcc121745b713802bc06927b809b3db90da6a16b3448f383fe` | 846 retained rows after 7 May; 635 events join to 206 profile codes. Repeated changes and reversals retained; no deduplication after removing names. |
| `composition-publisher-metadata.json` | `f8ae9d47e7585508abc7c5860c6e24b54070ddf3e4979b2e20a244f5a2268c6e` | Three pages: last-updated label, reuse terms and archive scope; all original responses hashed. |
| `dry-run-seats.json` | `861781074b33a4ae67bf69e9a72a96f42e030e024746b64c8c6a133be23b5f61` | 295 exact profile joins; 318 current rows reconcile; 295 matched baseline rows reconcile; 20 sample totals reconcile; 182 changed profile buckets. |

The 23 Option A bodies outside the billing profiles are: Cambridgeshire (E10000003); Derbyshire (E10000007); Devon (E10000008); East Surrey (E06000067); East Sussex (E10000011); Essex (E10000012); Gloucestershire (E10000013); Hampshire (E10000014); Hertfordshire (E10000015); Kent (E10000016); Lancashire (E10000017); Leicestershire (E10000018); Lincolnshire (E10000019); Norfolk (E10000020); Nottinghamshire (E10000024); Oxfordshire (E10000025); Staffordshire (E10000028); Suffolk (E10000029); Surrey (E10000030); Warwickshire (E10000031); West Surrey (E06000068); West Sussex (E10000032); Worcestershire (E10000034).

In the twenty-source comparison, all chamber totals agree between the two routes. Party and political-group labels do not establish interchangeable buckets; no automatic resolution is permitted. The archive comparison only reconciles the 295 matched profile rows, not the whole UK archive.

### Compiler publications, dates and licences

Website content uses [Creative Commons Attribution ShareAlike 4.0](http://creativecommons.org/licenses/by-sa/4.0/). The [publisher reuse statement](https://opencouncildata.co.uk/aboutthissite.php) declares CSV downloads public domain separately. These terms are source research, not permission to import a held composition dataset.

| Source | Original SHA-256 | Licence and source scope |
|---|---|---|
| [composition-option-a](https://opencouncildata.co.uk/councils.php?model=E&y=0) | `0b17adb555571dd84424722367f1604e1ce820670d131cac22a03b95f9163c98` | Creative Commons Attribution ShareAlike 4.0. Current table, site-wide last-updated label 15 November 2026; not a per-council effective date. |
| [composition-2026-election-baseline](https://opencouncildata.co.uk/history2016-26.csv) | `c0d9b68024fd0481c745ded76e16cf107ea17b5205c443cedbbe75892500177c` | Public domain, as stated for CSV downloads. Publisher describes the archive as shortly after the May elections, not a current composition feed. Control and unrelated fields excluded. |
| [composition-by-elections](https://opencouncildata.co.uk/changesC.php?y=2026) | `5d5469e7f46e6b15d28cecba945fbe424e47ce24008f24298079e782c4b680d3` | Creative Commons Attribution ShareAlike 4.0. Party change events after 7 May 2026; includes holds. Dates are as printed, not independently verified polling dates. Manchester is labelled 11 September here but the council gives polling date 10 September. No GSS or publisher council ID on these rows, so no exact-code profile join. |
| [composition-party-changes](https://opencouncildata.co.uk/changes.php?y=2026) | `ab613ab7b971f0df9ab770a63026d94630a4fb8ebd46625220967d673cbbaba4` | Creative Commons Attribution ShareAlike 4.0. Rows after 7 May 2026; date is publisher date, not asserted to be event effective date. Last ordinary election dates not established for every council. |
| [Homepage last-updated label](https://opencouncildata.co.uk/) | `2f81eef6c52670c965ab8c7fd2c218ced9f4bc98d0ee6bfd68302cd6679b1afe` | Website CC BY-SA 4.0. GB Councillors & Councils; Last Updated: 15-11-2026. |
| [Reuse statement](https://opencouncildata.co.uk/aboutthissite.php) | `2159e9256fd3dfa41fa3ee3c33a46e08c3b89084499c3fb08f8ce4189a8ccb79` | Website CC BY-SA 4.0. The CSV downloads are public domain.; The website and its contents are provided under an Attribution Sharealike Licence.. |
| [Archive scope](https://opencouncildata.co.uk/productsAndDownloads.php) | `818d6423f48edf848892bcccae91b5cbaac852e0376905363aaaca2a694ec46c` | Website CC BY-SA 4.0. shortly after the May elections in each year. |

### Official sample provenance and reconciliation

Each entry has council copyright; factual values only, with no general open licence assumed. All were retrieved on 15 November 2026. Profile codes were assigned by review of the official council domain, not claimed as native publisher codes. Each reconciliation below is arithmetic, not evidence of currency.

#### Burnley

Source: [official source](https://burnley.gov.uk/council-democracy/council-structure/), locator: The Council seats. Date shown: n/a; No composition date shown. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Current composition claim, undated. Party or group sum: 45; reconciliation total: 45; reconciles: yes. Total on the main source: 45.

#### Cambridge

Source: [official source](https://www.cambridge.gov.uk/control-of-the-council), locator: The Council currently consists of. Date shown: 2026-11-02; Page last reviewed. Original SHA-256: `b22b008a41b20838d6bde4df16a27e68752c74a6346fbde8a861743066d8d97a`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Current composition claim. Party or group sum: 42; reconciliation total: 42; reconciles: yes. Total on the main source: 42.

#### Oxford

Source: [official source](https://mycouncil.oxford.gov.uk/mgMemberIndex.aspx?FN=PARTY&PIC=0&VW=LIST), locator: Political make-up. Date shown: n/a; No composition date shown. Original SHA-256: `d9ac07a3d7d0d6f691e3ee593ea20145c1c755dfd11610a605f16c3bc31ff1ae`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Political groups following most recent election; undated. Current compiler buckets agree after explicit label mapping.. Party or group sum: 48; reconciliation total: 48; reconciles: yes. Total on the main source: 48.

#### Woking

Source: [official source](https://woking.moderngov.co.uk/mgConvert2PDF.aspx?ID=45718), locator: Paragraph 5.1 and Table 1. Date shown: 2026-05-19; Meeting date. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Political groups in dated committee report; mixed group cannot be split into parties. Party or group sum: 30; reconciliation total: 30; reconciles: yes. Total on the main source: 30.

#### Bristol

Source: [official source](https://www.bristol.gov.uk/council/councillors-and-the-lord-mayor/political-makeup-of-the-council), locator: Number of councillors for each party. Date shown: n/a; No composition date shown. Original SHA-256: `2ea18693d465829cbce0ebbce02e1801fc22acba1ec7a8e967539b81a30ec586`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Current composition claim, undated. Party or group sum: 70; reconciliation total: 70; reconciles: yes. Total on the main source: 70.

#### Leicester

Source: [official source](https://www.leicester.gov.uk/about-council/councillors-and-mps/councillors), locator: The political makeup of the council. Date shown: n/a; No composition date shown. Original SHA-256: `2612ee141ec895ffda7e1ce5bbca6de7d6a65cbf21cd998d9be4e07ba10f80f4`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Current composition claim, undated. Party or group sum: 54; reconciliation total: 54; reconciles: yes. Total on the main source: 54.

#### Nottingham

Source: [official source](https://nottinghamcity.gov.uk/your-council/about-the-council/councillors-and-leadership/nottingham-city-councillors/), locator: Political groups on the Council. Date shown: n/a; No composition date shown. Original SHA-256: `3533d7a06ebf3d5ac1269aff2f569bfa64f9f5ec44b377dd703241f1ec153f6f`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Political groups; mixed group cannot be split into parties. Party or group sum: 55; reconciliation total: 55; reconciles: yes. Total on the main source: 55.

#### Portsmouth

Source: [official source](https://directorrecruitment.portsmouth.gov.uk/the-council/), locator: Portsmouth political composition. Date shown: n/a; No composition date shown. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Stale recruitment page: refers to 2023/24 budget and 2025 as next fallow year. Do not treat as current. Party or group sum: 42; reconciliation total: 42; reconciles: yes. Total on the main source: 42.

#### Birmingham

Source: [official source](https://www.birmingham.gov.uk/info/50068/how_the_council_works/882/political_composition_of_the_council), locator: Current number of councillors in each political party. Date shown: 2026-06-08; Page last updated. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Published parties and named political groups, not inferred administration. Party or group sum: 101; reconciliation total: 101; reconciles: yes. Total on the main source: 101.

#### Leeds

Source: [official source](https://www.leeds.gov.uk/councillors-and-democracy/councillors-and-committees), locator: Current political composition. Date shown: n/a; No composition date shown. Original SHA-256: `c0afcac2c976ca2e49eaa20fbe082200d95478c94d136b8805afa9fda52a6991`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Current composition claim including explicit vacancy, undated. Party or group sum: 99; reconciliation total: 99; reconciles: yes. Total on the main source: 99.

#### Manchester

Source: [official source](https://democracy.manchester.gov.uk/mgAi.aspx?ID=20295), locator: Item 18, composition paragraph. Date shown: 2026-09-23; Meeting date. Original SHA-256: `624877737cc35b45fea2148f18d4e3f41355a1ce0476659feb7497a17609825f`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Dated change report following a party change and 10 September 2026 by-election. Council seat total checked separately. Party or group sum: 96; reconciliation total: 96; reconciles: yes. Total on the main source: n/a.

Separate total source: [official council description](https://democracy.manchester.gov.uk/mgCommitteeDetails.aspx?ID=135), locator: Purpose of committee; printed total 96; date shown n/a; original SHA-256: `0ec3cf39b645d63cc434a4df5d23265d70178aa999dcbbdff977c1ef2ee3b5c0`. Direct original bytes hashed. Same retrieval date and council copyright qualification.

#### Sheffield

Source: [official source](https://www.sheffield.gov.uk/your-city-council/about-council/elected-representatives), locator: Councillors. Date shown: n/a; No composition date shown. Original SHA-256: `013dfa43ff0e97ff98456f1347eaf46294a295e1552f40b78a61bd50610550c2`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Current political groups, undated. Party or group sum: 84; reconciliation total: 84; reconciles: yes. Total on the main source: 84.

#### Camden

Source: [official source](https://www.camden.gov.uk/en/find-your-ward-and-ward-map), locator: Composition of the council. Date shown: n/a; No composition date shown. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Undated page disagrees with current compiler. Seat total checked separately. Party or group sum: 55; reconciliation total: 55; reconciles: yes. Total on the main source: n/a.

Separate total source: [official council description](https://democracy.camden.gov.uk/mgCommitteeDetails.aspx?ID=149), locator: Council description; printed total 55; date shown n/a; original SHA-256: n/a. Official web reader or indexed text only. Same retrieval date and council copyright qualification.

#### Islington

Source: [official source](https://www.islington.gov.uk/about-the-council/who-we-are/how-the-council-works/how-decisions-are-made), locator: Current political representation. Date shown: n/a; No composition date shown. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Undated page disagrees with current compiler. Party or group sum: 51; reconciliation total: 51; reconciles: yes. Total on the main source: 51.

#### Lambeth

Source: [official source](https://love.lambeth.gov.uk/lambeth-new-council-administration-agreed/), locator: Current composition paragraph. Date shown: 2026-06-03; Publication date. Original SHA-256: `5635763b07d9d18b02a6a49d3c7f64dc3b2e20048b0a8b8ec45df7794bfd71bf`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Dated snapshot before two scheduled 9 July by-elections. Seat total checked separately. Party or group sum: 63; reconciliation total: 63; reconciles: yes. Total on the main source: n/a.

Separate total source: [official council description](https://www.lambeth.gov.uk/about-council/councillors-and-mayor/lambeth-councillors/councillors), locator: Opening description; printed total 63; date shown n/a; original SHA-256: n/a. Official web reader or indexed text only. Same retrieval date and council copyright qualification.

#### Wandsworth

Source: [official source](https://www.wandsworth.gov.uk/news/news-may-2026/wandsworth-council-leader-elect-sets-out-first-steps/), locator: Notes to editors. Date shown: 2026-05-18; Publication date. Original SHA-256: `b316e591af7ee0cf16342663eca924df3800695f04cc649685d352d3cee58409`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: 2026 election snapshot. Seat total checked separately. Party or group sum: 58; reconciliation total: 58; reconciles: yes. Total on the main source: n/a.

Separate total source: [official council description](https://www.wandsworth.gov.uk/the-council/how-the-council-works/how-the-council-is-organised/), locator: Political leadership; printed total 58; date shown n/a; original SHA-256: `37583c04117e82e0722fe8039f38a22e1cfa7e8679b2b58353b1ad1c620ea5ad`. Direct original bytes hashed. Same retrieval date and council copyright qualification.

#### Bromley

Source: [official source](https://www.bromley.gov.uk/elections-voting/councillors), locator: Opening composition paragraph. Date shown: n/a; No composition date shown; election date 7 May 2026 stated. Original SHA-256: `57fbd642bfe26b18ae56e83e21dca2e98110e2793131f3cdfdf4df7f33fb0972`. Direct HTTP status: 200. Direct original bytes hashed; selected factual values transcribed.

Scope: Composition following 7 May 2026 election, no subsequent update date. Party or group sum: 58; reconciliation total: 58; reconciles: yes. Total on the main source: 58.

#### Harrow

Source: [official source](https://www.harrow.gov.uk/elections/local-councillor), locator: Which political parties are council members of. Date shown: n/a; No composition date shown; allowance dates are unrelated. Original SHA-256: n/a. Direct HTTP status: 403. Official page read through web reader; original bytes unavailable, retained transcription only.

Scope: Current composition claim, undated. Party or group sum: 55; reconciliation total: 55; reconciles: yes. Total on the main source: 55.

#### Hillingdon

Source: [official source](https://pre.hillingdon.gov.uk/councillors-meetings-democracy/council-works), locator: Political control table. Date shown: n/a; No composition date shown; May 2026 election mentioned. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Official pre subdomain page; undated and needs canonical live-page confirmation. Party or group sum: 53; reconciliation total: 53; reconciles: yes. Total on the main source: 53.

#### Kingston upon Thames

Source: [official source](https://moderngov.kingston.gov.uk/documents/b23748/Late%20Material%20Thursday%2021-May-2026%2019.30%20Council.pdf?T=9), locator: Annex 2 A6, political composition table. Date shown: 2026-05-21; Meeting date. Original SHA-256: n/a. Direct HTTP status: 403. Official page text exposed by web search or reader; original bytes unavailable, retained transcription only.

Scope: Dated political groups snapshot in committee report. Party or group sum: 48; reconciliation total: 48; reconciles: yes. Total on the main source: 48.

### Official change evidence provenance

Council copyright; selected factual findings only. Retrieved 15 November 2026. No mechanism inferred from a snapshot difference.

- Cambridge: [Last election composition](https://www.cambridge.gov.uk/news/2026/05/08/cambridge-city-council-election-results-may-2026), dated 2026-05-08. Original SHA-256: `e14b8e6d6068764559d1d7f6abb8acf7690cf4a4c60202570335077e16ec4b99`. Published counts: Labour 17; Green Party 12; Liberal Democrats 11; Conservative 1; Your Party 1. Printed chamber total in this source: 42. Compared with the council page reviewed 2 November. Difference establishes changed composition, not its mechanism.
- Harrow: [Last election composition](https://www.harrow.gov.uk/news/article/11507/2026-local-election-results), dated 2026-05-08. Original SHA-256: n/a. Published counts: Conservative 42; Labour 12; Arise 1. Printed chamber total in this source: n/a. Current page reports 41 Conservative and 1 Independent. Difference establishes changed composition, not its mechanism. Article polling-date text conflicts with its linked 7 May election.
- Manchester: [Official confirmation of party change and by-election](https://democracy.manchester.gov.uk/mgAi.aspx?ID=20295), dated 2026-09-23. Original SHA-256: `624877737cc35b45fea2148f18d4e3f41355a1ce0476659feb7497a17609825f`. Published counts: Labour 64; Green 21; Reform 7; Liberal Democrat 4. Printed chamber total in this source: n/a. Council records a party change and Burnage by-election on 10 September 2026 before this composition. No person name retained.

### Option A linked identity response register

All 318 linked pages were retrieved on 15 November 2026 under the website CC BY-SA 4.0 terms above. All 318 current-table party sums, including explicit vacancies, equal their printed totals. This table retains the identity URL, original response hash and reconciliation finding without retaining the compiled composition rows. The one unmatched profile is Isles of Scilly (E06000053).

| Source body | Linked original response | Original SHA-256 | Current table reconciliation |
|---|---|---|
| Adur | [Publisher identity](https://opencouncildata.co.uk/council.php?c=165&y=0) | `b448eac342a462ff00e8075f5489b379b2f8e16513777e5209ea427b8124ca41` | Sum equals total |
| Amber Valley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=170&y=0) | `8c30cfad2eb098bb03842d439709cb4ad75a7052432fd153dd1e40d5dd45af22` | Sum equals total |
| Arun | [Publisher identity](https://opencouncildata.co.uk/council.php?c=29&y=0) | `bbbc282089a35df15df5b25891b1bce2b374c6f4f8b665cea1e1ef627991e939` | Sum equals total |
| Ashfield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=30&y=0) | `d9bd4f64561a8f6d5b7ebb3e70f605bf17b8a6b8cb41aff8323d15569f74b841` | Sum equals total |
| Ashford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=31&y=0) | `c91b9cb9278fae237102f63140890d204f2b44f1c8dcb2f719527a98725752e5` | Sum equals total |
| Babergh | [Publisher identity](https://opencouncildata.co.uk/council.php?c=33&y=0) | `0133895bdf5ceeb81069205df4e6ec57aae8eae70638b91169dfdb94fb1432c0` | Sum equals total |
| Barking and Dagenham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=227&y=0) | `551ee7c451fe2dcee3e78f74f1868884bae55067628490cfd1bda4f002fa7ecc` | Sum equals total |
| Barnet | [Publisher identity](https://opencouncildata.co.uk/council.php?c=228&y=0) | `d48d264473f0e8c73f781165481a7a3af3f88806f4c959bd8aabf0c22917acc0` | Sum equals total |
| Barnsley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=264&y=0) | `a9a4000386327ea280742e402a571fce68578967970989c89dd39d0bca05dbb3` | Sum equals total |
| Basildon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=171&y=0) | `b3ed9d58ac1702835a6fa633d2e8338c9ae37507c9fe27a9c8e8b1ebea7fa712` | Sum equals total |
| Basingstoke and Deane | [Publisher identity](https://opencouncildata.co.uk/council.php?c=172&y=0) | `e5da0ed2d0b58d02e5908b19e9627edbb9b4b58c5f7f0a521fb5f97699d29bd4` | Sum equals total |
| Bassetlaw | [Publisher identity](https://opencouncildata.co.uk/council.php?c=35&y=0) | `0386b2c26f6f89c15bddc61ad10a5e9d49702afbddc1f7d625154fbe1e197334` | Sum equals total |
| Bath and North East Somerset | [Publisher identity](https://opencouncildata.co.uk/council.php?c=327&y=0) | `5f4d2bb5f86d7042d6030506e8f0e8323c2bce7775281521ce1f1c8dce7936b1` | Sum equals total |
| Bedford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=328&y=0) | `f2de66800cd03ced651d5ce8da2697832c9657d0cf33e47403b915da53d78f79` | Sum equals total |
| Bexley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=229&y=0) | `c55ac246e528858d9daa47e7fac4570319357b519a436a2275f35696ed494209` | Sum equals total |
| Birmingham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=259&y=0) | `bb6996e2d84ea6729a0f2e7b05ca79f17da4b24df04c3e5bf753d40b18cfefdd` | Sum equals total |
| Blaby | [Publisher identity](https://opencouncildata.co.uk/council.php?c=36&y=0) | `776c8bb5798ddfd094b6eb76f4e9fd4d44fd04dc8eb45d336321b39ed4039950` | Sum equals total |
| Blackburn with Darwen | [Publisher identity](https://opencouncildata.co.uk/council.php?c=365&y=0) | `6272c1afee6a408c4def924bc5bb0e793a41e04811302bb86ffb608c77111c14` | Sum equals total |
| Blackpool | [Publisher identity](https://opencouncildata.co.uk/council.php?c=329&y=0) | `1e3ba6927f086748373fa9d9c96830abe8ad29147aa23c669c8f599ff7463552` | Sum equals total |
| Bolsover | [Publisher identity](https://opencouncildata.co.uk/council.php?c=37&y=0) | `1718ea83bbd0dad98451bbd4f9f6d772393ea4ce10ffc90e8e9404bf19d1acee` | Sum equals total |
| Bolton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=265&y=0) | `3479c50793ffc3141716eb53e952e14f35005f9d30d914703e2c87408b9b32b2` | Sum equals total |
| Boston | [Publisher identity](https://opencouncildata.co.uk/council.php?c=38&y=0) | `69c6bba8cfe3bbc7cc9b78e929f33aeb0b905ff7ba8b5251f7b1c56aef0d69fc` | Sum equals total |
| Bournemouth, Christchurch and Poole | [Publisher identity](https://opencouncildata.co.uk/council.php?c=409&y=0) | `1051440ad8998eabe857860e517d3e0e7f006619d544a2cebaa8173d56e2b501` | Sum equals total |
| Bracknell Forest | [Publisher identity](https://opencouncildata.co.uk/council.php?c=331&y=0) | `2c7bf0eae7fd6dde5c7b2ebd98cac9380a1dcb3504d7c91cd7dc7d6905381278` | Sum equals total |
| Bradford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=266&y=0) | `520abfff77e96e2cc9ecece56287e1a93733767786a915131be8c205c730ecc0` | Sum equals total |
| Braintree | [Publisher identity](https://opencouncildata.co.uk/council.php?c=39&y=0) | `bcae2d6ceae29892fddcf36b25c567489a3e93a0a6612abf04a71aca844c2d32` | Sum equals total |
| Breckland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=40&y=0) | `bfba4c34a79cf878f87b0ecc7352d6f737ffedf9bec98a59d959c4e3724c244b` | Sum equals total |
| Brent | [Publisher identity](https://opencouncildata.co.uk/council.php?c=230&y=0) | `c924f0fd0624b573f582de124764149eb94ef3703009a06d613eaf6c185139e6` | Sum equals total |
| Brentwood | [Publisher identity](https://opencouncildata.co.uk/council.php?c=173&y=0) | `3446101e4f982cb8f58517dd64c4991e42fd83f36bff990554c415f44472e314` | Sum equals total |
| Brighton and Hove | [Publisher identity](https://opencouncildata.co.uk/council.php?c=332&y=0) | `9f04d51e49b79f947cd2a4a2db577c3f0de9da98736e09d1671260a2f63d9bc6` | Sum equals total |
| Bristol | [Publisher identity](https://opencouncildata.co.uk/council.php?c=366&y=0) | `00a257d817bc9e51c281ef80bb808d15c2559f37183b7f34199cf35909147067` | Sum equals total |
| Broadland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=41&y=0) | `b169b9b6f5ba6b9fd1dc760267e7368bfc6e7f1bf01b5b454d1f65af622e77cd` | Sum equals total |
| Bromley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=231&y=0) | `a6556f69b4eb96e278e6910f308a3e2a49b664283f0a6ece9802714411360e5d` | Sum equals total |
| Bromsgrove | [Publisher identity](https://opencouncildata.co.uk/council.php?c=42&y=0) | `34faa047ded944005ba1f6e830ced4af87fb2ee16446c5285703500bc686c0d5` | Sum equals total |
| Broxbourne | [Publisher identity](https://opencouncildata.co.uk/council.php?c=174&y=0) | `8c062efccf948368308ec2de9f24651f6e716910720933cc0d8732be153581a1` | Sum equals total |
| Broxtowe | [Publisher identity](https://opencouncildata.co.uk/council.php?c=43&y=0) | `34e1d7d56833cb91f4d9db23c1e074369ded635f92bf4cff2a653408fb5d55a5` | Sum equals total |
| Buckinghamshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=413&y=0) | `99b2b9febdff4e4eae70b83bf3359b66eda7e7c39e8b6402fcc943aec10d9cdb` | Sum equals total |
| Burnley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=175&y=0) | `95256d27020bb15c5b66d05251e7368c8b4d6f0adb37ba455a360c7c6f788b9e` | Sum equals total |
| Bury | [Publisher identity](https://opencouncildata.co.uk/council.php?c=267&y=0) | `7e59521517b3ea53d07134df8b78efdffd82c19c3ee28cc2de869041b39aacb0` | Sum equals total |
| Calderdale | [Publisher identity](https://opencouncildata.co.uk/council.php?c=268&y=0) | `02d1f8d7056c0b08c0fe1a7de0a51ae22ff34c1203c329c276981765f28a1b66` | Sum equals total |
| Cambridge | [Publisher identity](https://opencouncildata.co.uk/council.php?c=176&y=0) | `59e21bc4671900ec1c4aa9ab17b81594172dc4d507a565f9b190110600bff079` | Sum equals total |
| Cambridgeshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=2&y=0) | `2cbacecf7fbd966cdd2cf995fd4826be0c7689f2574d3c27f8df82bdf07f780f` | Sum equals total |
| Camden | [Publisher identity](https://opencouncildata.co.uk/council.php?c=232&y=0) | `1ee8d666df1e6e3b0c1b94adbce1fec22761ab5f68edde918e6e81d6e1fca13c` | Sum equals total |
| Cannock Chase | [Publisher identity](https://opencouncildata.co.uk/council.php?c=177&y=0) | `ddc7b3b4bf59a27727fdf7a13fa6b3e3940718ef1242fe9b0c62516b0c240215` | Sum equals total |
| Canterbury | [Publisher identity](https://opencouncildata.co.uk/council.php?c=44&y=0) | `388f4bbebcb696e12ff54538c9c6c640aee33d910f1d614b7bbfaab57df559f8` | Sum equals total |
| Castle Point | [Publisher identity](https://opencouncildata.co.uk/council.php?c=179&y=0) | `b3f1526565f5d033b56d2d55b5bf8aad284ea01b416bff91ed0c49eb23f13891` | Sum equals total |
| Central Bedfordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=333&y=0) | `a2bb8531d2c674648183558af03b05c157301cd3ba5e30ed8776cb336ee1d021` | Sum equals total |
| Charnwood | [Publisher identity](https://opencouncildata.co.uk/council.php?c=45&y=0) | `d0dd1f912c0df4f2d8fa63e40f055ddd9e61c2eb4c40fa8dcef67feac7a80fe6` | Sum equals total |
| Chelmsford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=46&y=0) | `59fd69182905937de3dbacfd2fea9cd07a5004ffb174c3a153ca8f3b9507f273` | Sum equals total |
| Cheltenham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=166&y=0) | `8bd7c3d297d9f91b273e53c24dcb732fbd608ae8ebed5846156562776dc23a8e` | Sum equals total |
| Cherwell | [Publisher identity](https://opencouncildata.co.uk/council.php?c=180&y=0) | `ec65b5e84c5bb2f8f8ed76020fa349fbb15709a0986e1b88b46f85195cd6527c` | Sum equals total |
| Cheshire East | [Publisher identity](https://opencouncildata.co.uk/council.php?c=334&y=0) | `822feee0f8ba5b3f206fbfcc88eedf98c0465b31117360474f32b534b7ef84bc` | Sum equals total |
| Cheshire West and Chester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=335&y=0) | `e71c7955956967e7b41cfbde78bc774bed2e94ff49e890f1afeda62ec6e8285a` | Sum equals total |
| Chesterfield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=47&y=0) | `bea84abbcf352a59d1c983d7a2650ddfab65ddd919102196f6f8b48f8702d7ed` | Sum equals total |
| Chichester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=48&y=0) | `ac0af1bf8e0f0caf83af2941f6efbb16ec1e16be4a2d8276a661f34758abb077` | Sum equals total |
| Chorley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=181&y=0) | `eb31377c46d7616cc071aeeafc387ec47809cf419276bc1a1602f74ff76e4200` | Sum equals total |
| City of London | [Publisher identity](https://opencouncildata.co.uk/council.php?c=406&y=0) | `b27b3bba8fdf102d407c06f3301f3eead21f450418b102b5d5206d1eceaad256` | Sum equals total |
| Colchester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=182&y=0) | `0dc2829fd7a77409ac81cb32bfb4947bd68710790e3964aafc44ccb4e41c8ab3` | Sum equals total |
| Cornwall | [Publisher identity](https://opencouncildata.co.uk/council.php?c=336&y=0) | `335fb73d7856239a92e0666bb74a615df3da70695f4fcbd5f4f5d18caa00049e` | Sum equals total |
| Cotswold | [Publisher identity](https://opencouncildata.co.uk/council.php?c=53&y=0) | `54c67f7e5090f3040f19bb2ab2fc27b4483ec49f7f78a18b5099076c53117f68` | Sum equals total |
| Coventry | [Publisher identity](https://opencouncildata.co.uk/council.php?c=269&y=0) | `441e5fab00604706e66a9820234ec2140f0eed35c2b15709e902676ff8a5a8d7` | Sum equals total |
| Crawley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=184&y=0) | `bc5a50694bbf2c2135804247737c5f1368871c223704aa5ae93f4514d80d8f5b` | Sum equals total |
| Croydon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=233&y=0) | `1c3eb31b587b01ccea641aeebd3f4fdf4400497b995da07424f33cef2e58678d` | Sum equals total |
| Cumberland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=418&y=0) | `5181e0878d5b70d229968f418dcfa9c35dc7397343667c9dabe22fa778317f50` | Sum equals total |
| Dacorum | [Publisher identity](https://opencouncildata.co.uk/council.php?c=54&y=0) | `ab38ac1a2e835f082025b2785a419267652ed6a40a4ed925c01f62a4c44c2768` | Sum equals total |
| Darlington | [Publisher identity](https://opencouncildata.co.uk/council.php?c=337&y=0) | `8052e8fb9fab357f5c728cdc1ecd61914004dd461fc9b832f9d4ddeef276fe8e` | Sum equals total |
| Dartford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=55&y=0) | `1df95b32b4c1c709a018e479dcd1dfd0965259e684e82e779ff2e07568f94148` | Sum equals total |
| Derby | [Publisher identity](https://opencouncildata.co.uk/council.php?c=367&y=0) | `4cd615204e42ee2103fb88d068265c43f66bb4335883ec4311881e0240a841af` | Sum equals total |
| Derbyshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=4&y=0) | `647b8651ce27bd13c01a4dd3e2136969bb18c48bb941cdb77b24a539b628ac5b` | Sum equals total |
| Derbyshire Dales | [Publisher identity](https://opencouncildata.co.uk/council.php?c=56&y=0) | `5378609c69ddb0db2206054418789f60ea329eb41de0824a80e476cb44431787` | Sum equals total |
| Devon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=5&y=0) | `ef9932629638c6ea07f9126f4281dcf5fadac9f045f1f9576d6a8554ed57dce0` | Sum equals total |
| Doncaster | [Publisher identity](https://opencouncildata.co.uk/council.php?c=260&y=0) | `5e6d70a323a4287ad7732fdcb917e1ff2e44b7c8cdb8adcb5d9cfe1fa2e28508` | Sum equals total |
| Dorset | [Publisher identity](https://opencouncildata.co.uk/council.php?c=408&y=0) | `90caa2741e3f34fee7264b63e352dee4e7c223cf8932d51ce5416a2a64034fab` | Sum equals total |
| Dover | [Publisher identity](https://opencouncildata.co.uk/council.php?c=57&y=0) | `8703420bdd0ef7ddf729570c7251cac58119efcde67ce72f49b897ed3a25b23d` | Sum equals total |
| Dudley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=270&y=0) | `72115c86589e6bbdff82432280f6ff4ba90722d12b5a206bde43ace43a0b507f` | Sum equals total |
| Durham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=338&y=0) | `9906ee7740d9d98eb4c25d0b52fa612413aa142181ef05a5ae8bdedb0d80482e` | Sum equals total |
| Ealing | [Publisher identity](https://opencouncildata.co.uk/council.php?c=234&y=0) | `0af804d8a1d78da0f44d288c52818343dace1e5c5a1f26d902b32af62c021837` | Sum equals total |
| East Cambridgeshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=58&y=0) | `d48092aad5f788e45c2041efc7f42d5eb12d92d2b83a2b898e9710bfdcda6380` | Sum equals total |
| East Devon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=59&y=0) | `25e09ddd8a017fed4c2b88a776930fedf7b5eb57d9f6989d780b72e3cbb53e35` | Sum equals total |
| East Hampshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=61&y=0) | `5f0569b342472f44efeb917f778ea7feb131565b94ca7274920e4bb9c56488ba` | Sum equals total |
| East Hertfordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=62&y=0) | `7afece35540af38f663e9fbb0ab356a6999b3b6f0b25d13160fe4d5c09855937` | Sum equals total |
| East Lindsey | [Publisher identity](https://opencouncildata.co.uk/council.php?c=63&y=0) | `8728712a358557ca4d546c3c6a78d7410bcb1e204519fecf6a9916ed297cf379` | Sum equals total |
| East Riding of Yorkshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=339&y=0) | `3fa2e4d1a77d8b1b3e3ffb67824dfe41117505099591de46753b1ee33a261996` | Sum equals total |
| East Staffordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=65&y=0) | `34ace62e357ea2eacb041af34b7e65e43b59720327e4afd305940c0c6c0427ae` | Sum equals total |
| East Suffolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=412&y=0) | `6b809c11471224f5ec6140d08f0e9a33b836c92dea55b193219c85ca8d3d270d` | Sum equals total |
| East Surrey | [Publisher identity](https://opencouncildata.co.uk/council.php?c=421&y=0) | `3744ee116de1f5684d656997bdc6b1efd93aa38c99ee7b5bc3964898fb6173a7` | Sum equals total |
| East Sussex | [Publisher identity](https://opencouncildata.co.uk/council.php?c=7&y=0) | `3bff57037837c11814eb0ba856405b28d3497ce58974a2ed91723763c58e6b3b` | Sum equals total |
| Eastbourne | [Publisher identity](https://opencouncildata.co.uk/council.php?c=66&y=0) | `f54377ebd4fe5498784441e4a9bfbe84d85d16deb397f606c8b2ad68e264a7e4` | Sum equals total |
| Eastleigh | [Publisher identity](https://opencouncildata.co.uk/council.php?c=67&y=0) | `e0043743b0290353596c04f7fe5b950678d2a17ee0f6c78e65877c0925b50943` | Sum equals total |
| Elmbridge | [Publisher identity](https://opencouncildata.co.uk/council.php?c=186&y=0) | `eea7ac0fb82f534707c8f61018cf1e727904cc8145306e40874352b7d514b966` | Sum equals total |
| Enfield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=235&y=0) | `7f33bbc6ed7e1b8f652b83f83326d363f7c00cf9a48806a00b09a258ffe052fc` | Sum equals total |
| Epping Forest | [Publisher identity](https://opencouncildata.co.uk/council.php?c=187&y=0) | `478aa732ba0d5c5413ec8451c5d9bfbc36bee97994c921ccc346762da49fc527` | Sum equals total |
| Epsom and Ewell | [Publisher identity](https://opencouncildata.co.uk/council.php?c=69&y=0) | `3c36857ba4d714b532a4d38f03422e8bff83de54770e4153e8f979f88c6381ad` | Sum equals total |
| Erewash | [Publisher identity](https://opencouncildata.co.uk/council.php?c=70&y=0) | `274c724838448cd649c1689079ec79d8661b984b094fb1d06986322b696d8b7c` | Sum equals total |
| Essex | [Publisher identity](https://opencouncildata.co.uk/council.php?c=8&y=0) | `a73e295695ef3f6a8990c494d772bf730c79c045534e388c00ecab4b092d21a8` | Sum equals total |
| Exeter | [Publisher identity](https://opencouncildata.co.uk/council.php?c=188&y=0) | `e34a556c543116c69ed8001a3ce9ddac3c08af585b1f312bc66c005858fdae0c` | Sum equals total |
| Fareham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=189&y=0) | `621c96acf802c427991ef1405578039d72aecf1b9b4eb78e7d223d508f0f8118` | Sum equals total |
| Fenland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=71&y=0) | `9df74f39ef13ee3267297f7d8dc7eafadf784ea53a61804a13bd241d5eb7c57e` | Sum equals total |
| Folkestone and Hythe | [Publisher identity](https://opencouncildata.co.uk/council.php?c=123&y=0) | `b39a79cf24a85af79ca920d3b39a05f238f31ce2a9c7961589fcfefc7c9cf2b7` | Sum equals total |
| Forest of Dean | [Publisher identity](https://opencouncildata.co.uk/council.php?c=73&y=0) | `c58680a278db15fec5e19ac021b99d99d96e39fb7a0452e7954fdb24e2e03c95` | Sum equals total |
| Fylde | [Publisher identity](https://opencouncildata.co.uk/council.php?c=74&y=0) | `7f359b889c9538f71cf35555728ed3cedbea34fd6ae773c759b68f6e1d1ab6d6` | Sum equals total |
| Gateshead | [Publisher identity](https://opencouncildata.co.uk/council.php?c=271&y=0) | `dcc9bb358595aade425ab36a9c8102ea1342f121513eeb9faff404f25459e799` | Sum equals total |
| Gedling | [Publisher identity](https://opencouncildata.co.uk/council.php?c=75&y=0) | `7c7f1586bcbb00d2d1608116d93ad4e1f778687b1e029264627cd04086a247c2` | Sum equals total |
| Gloucester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=76&y=0) | `fceb52a90c9a049c63383d5bc9c6de2a0d0044fa025624a65b3e95c3115aff08` | Sum equals total |
| Gloucestershire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=9&y=0) | `8c71f04211cfe52170bac81b0bfe50073d59b6372f9dc8c8511473c985edbfc4` | Sum equals total |
| Gosport | [Publisher identity](https://opencouncildata.co.uk/council.php?c=167&y=0) | `241768f087261418de3ce3ffe89c50cd91a32afc11acc5d8e3328cc2ce0638a0` | Sum equals total |
| Gravesham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=77&y=0) | `40b000cd5ef8a65ecf608863f9453701981201142c8ef5f525f889e1b190f0ea` | Sum equals total |
| Great Yarmouth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=190&y=0) | `ebdcc066305557138a7f3549b09208aca1c8c4be0cee48f31f1b074f515719d6` | Sum equals total |
| Greenwich | [Publisher identity](https://opencouncildata.co.uk/council.php?c=236&y=0) | `43d0da9dbe22db0199dff0608a880b563789868918527c24f40dc740180465ef` | Sum equals total |
| Guildford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=78&y=0) | `896eb9b8043289e2b7e456c8af6768b56f05dea6e2a79a7297f28a7dd1a337fc` | Sum equals total |
| Hackney | [Publisher identity](https://opencouncildata.co.uk/council.php?c=237&y=0) | `6a595a92595d427ec6f9670329c10f7f784c96f01bca9031d2905f4dc2d861ad` | Sum equals total |
| Halton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=368&y=0) | `cbbe30d17cb3c515e1f5368a769e9a37eb2a2f66c4024a87ef324c18b041c32b` | Sum equals total |
| Hammersmith and Fulham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=238&y=0) | `6609126a69240e12be139cd0f42096fb7c80ff7a93241e6afb1225148ef1e356` | Sum equals total |
| Hampshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=10&y=0) | `f561ac4be5a7f2615b41b1965a64eebcfaffaa55f01e440a54625fca49c18d38` | Sum equals total |
| Harborough | [Publisher identity](https://opencouncildata.co.uk/council.php?c=80&y=0) | `6558fd7390627cb094401cf61b6769ceb946e858bdf852bc7240dca19c238c9d` | Sum equals total |
| Haringey | [Publisher identity](https://opencouncildata.co.uk/council.php?c=239&y=0) | `b892feb031df595bf1d5594d537810d7ff93f4e8c494b1745fa43d8b0cef6acf` | Sum equals total |
| Harlow | [Publisher identity](https://opencouncildata.co.uk/council.php?c=191&y=0) | `576eec55ea4edc4f8bd17e4cd317a2520748468a33690510a0ef78ab9e98e522` | Sum equals total |
| Harrow | [Publisher identity](https://opencouncildata.co.uk/council.php?c=240&y=0) | `a6a22ecac6d927a01a218c2244f742be9a9091ed32fb4d3ea2eb658250ea8c71` | Sum equals total |
| Hart | [Publisher identity](https://opencouncildata.co.uk/council.php?c=192&y=0) | `245e79a418f6975b1bffe761dfc824dcd00fe0de0e895508969447c5e4adda0c` | Sum equals total |
| Hartlepool | [Publisher identity](https://opencouncildata.co.uk/council.php?c=369&y=0) | `7bb1f75a3cbf8712356db7348b555a726b85cbaa8ec995fa31f9d6014ba8ae2a` | Sum equals total |
| Hastings | [Publisher identity](https://opencouncildata.co.uk/council.php?c=82&y=0) | `6f39375dcd2864b87a84d5e88a5ce2d17bbdaf532237ec1e55af3c639863a10d` | Sum equals total |
| Havant | [Publisher identity](https://opencouncildata.co.uk/council.php?c=193&y=0) | `8cf6216d5fa9dd699cc89576541e37de9c4ba9ee3ad76807e134880f1d6e1bae` | Sum equals total |
| Havering | [Publisher identity](https://opencouncildata.co.uk/council.php?c=241&y=0) | `2d264c4755fc1ca811dd604408cdc080a96d83e055bac78d162f99a8361d470e` | Sum equals total |
| Herefordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=340&y=0) | `ac7385a4c2a62716c743146ac51477fb88d3a160e738c7a1283dcad4eb49c0bd` | Sum equals total |
| Hertfordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=11&y=0) | `ec290eb1a56cab191bc5f9af433bbf4f6cc37371ba88b37040b858c032993412` | Sum equals total |
| Hertsmere | [Publisher identity](https://opencouncildata.co.uk/council.php?c=83&y=0) | `e1315ecbc83204a1472e9b803d996a0cd1c9a5879b7d55a5591933073e7f8253` | Sum equals total |
| High Peak | [Publisher identity](https://opencouncildata.co.uk/council.php?c=84&y=0) | `778df73099c7bf72db358f2f32c364e2f17d938706af02bc33f1618b8647533b` | Sum equals total |
| Hillingdon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=242&y=0) | `e346576798ea6f0411a4de256c1e73415214214162808e88f5aebb3d14332496` | Sum equals total |
| Hinckley and Bosworth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=85&y=0) | `414b7f73701705ef426b2a1d5c5cc5242a6ab779e49a6eb1f6fda467d5a76e2b` | Sum equals total |
| Horsham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=86&y=0) | `448ad0116dad63ba76c9e3f4e993cdcffdc4c1bf26e63508ad9de2c37d8729a3` | Sum equals total |
| Hounslow | [Publisher identity](https://opencouncildata.co.uk/council.php?c=243&y=0) | `0835f2d19c34f9dcd35943867f641acd8be43b4c2456900fb751f2e640849f35` | Sum equals total |
| Huntingdonshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=87&y=0) | `f43af205f9c7d75f7b7f2e9eaec114bb1ea029b2773a7c14ccd0399dfd03c4af` | Sum equals total |
| Hyndburn | [Publisher identity](https://opencouncildata.co.uk/council.php?c=194&y=0) | `5d0e4dcf5f4f7f482e0cf11bd1696a1d85d660ed661e521411797797f5d903a9` | Sum equals total |
| Ipswich | [Publisher identity](https://opencouncildata.co.uk/council.php?c=195&y=0) | `2bb93bd92a1a3113217d511941a34f1820414eb856dc336a84df0f1fae2ee98c` | Sum equals total |
| Isle of Wight | [Publisher identity](https://opencouncildata.co.uk/council.php?c=342&y=0) | `a70f5437058b81bffb6a03fa6b8e14b327b87410b962840ade4d6d2fb793d2c1` | Sum equals total |
| Islington | [Publisher identity](https://opencouncildata.co.uk/council.php?c=244&y=0) | `19439e3df6576611ed6b278075d108555ff6b521cdbbaa3e1ed22318ecf06d78` | Sum equals total |
| Kensington and Chelsea | [Publisher identity](https://opencouncildata.co.uk/council.php?c=245&y=0) | `79be455c94dbadd7e283b719f187c8de088b68adbac61e04a8c6abc72c3cee5f` | Sum equals total |
| Kent | [Publisher identity](https://opencouncildata.co.uk/council.php?c=12&y=0) | `83e5e5e0ded7c18700a72e76ff07029f95b9508af3c52398fa131a238faf21db` | Sum equals total |
| King's Lynn and West Norfolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=89&y=0) | `67a518ca9a6e3247bfeef5a3c1fbed8b4bf9ee8e789f86f8ed07ff3184e39f40` | Sum equals total |
| Kingston upon Hull | [Publisher identity](https://opencouncildata.co.uk/council.php?c=341&y=0) | `669cdc315a6ceac5436d4ebaf4ad3d7147a8f1a16d0b11269bc977c0efe7c2a2` | Sum equals total |
| Kingston upon Thames | [Publisher identity](https://opencouncildata.co.uk/council.php?c=246&y=0) | `1b8cda16080a75c08fa487dc6ba48024e8d7a026fec5dc35aa4ca6db1ccdabec` | Sum equals total |
| Kirklees | [Publisher identity](https://opencouncildata.co.uk/council.php?c=272&y=0) | `48517665a5fb1f0f7928562a65cb9d5167f8b9cf595a3fc97d01eeedb05e216d` | Sum equals total |
| Knowsley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=273&y=0) | `ff4254663b9207910825cd2e8f1263e788b91ef5ef341681beff1315f245ad90` | Sum equals total |
| Lambeth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=247&y=0) | `c824b2fe425e560ad86495c918d192e8959e303759effffaa15279932dcbde3c` | Sum equals total |
| Lancashire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=13&y=0) | `ae86faba29b99940ff0b07c65663e1eb846db83e02aa8faad05bf963c4183909` | Sum equals total |
| Lancaster | [Publisher identity](https://opencouncildata.co.uk/council.php?c=90&y=0) | `5b3cde2a2e40ac81101f904793a3c3895acfa9c566f75fe5f6fa318273a30c96` | Sum equals total |
| Leeds | [Publisher identity](https://opencouncildata.co.uk/council.php?c=261&y=0) | `459240e79f34afbfb42c127d961b2a304005a7a591e376662bcff8d9da3d1252` | Sum equals total |
| Leicester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=343&y=0) | `59daf824a1331a18018f85376d23f709599311e0c51ddd14117e7c322d178976` | Sum equals total |
| Leicestershire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=14&y=0) | `6a4e595ba3ff21a8fab8e4fda427ce36854dc13a560abe10d3a5609b6dcb6d80` | Sum equals total |
| Lewes | [Publisher identity](https://opencouncildata.co.uk/council.php?c=91&y=0) | `056d9530419f39b518ad176c6a6d9f9bb31ce81c2d56a4c0c37f2ee156d7a8af` | Sum equals total |
| Lewisham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=248&y=0) | `bca7e5adbcb68b3d16ffc0723bcf7665778396ba62f0e5a89aa68cde409ba859` | Sum equals total |
| Lichfield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=92&y=0) | `448b71b93949f1d7f6574b1daea8f2857e05b2b7a0095dc71775b2a2e08736d5` | Sum equals total |
| Lincoln | [Publisher identity](https://opencouncildata.co.uk/council.php?c=196&y=0) | `502303f6bc92ac2587b5ea11216799185356ba0fb2a86e4b99032483e1a5b824` | Sum equals total |
| Lincolnshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=15&y=0) | `797a1c08ff68b7a8111a6ee55b8d58e5356dbe215449b03fa156243ca32f44cb` | Sum equals total |
| Liverpool | [Publisher identity](https://opencouncildata.co.uk/council.php?c=274&y=0) | `b6d502d16d2809012ed53c891d9a4b34aa7c2ab073cada51dd4f1e496ee0f83b` | Sum equals total |
| Luton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=344&y=0) | `45ebdbbeb895a732cec73df81a1404cac04f5ef74193c4167b88232ebf6dd5c9` | Sum equals total |
| Maidstone | [Publisher identity](https://opencouncildata.co.uk/council.php?c=197&y=0) | `c9febe6d86863548a1311fcbb8449897034671251e586fca943b4f200b8a700a` | Sum equals total |
| Maldon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=93&y=0) | `a66bd472f65b3a3f4465e910e1cbaaee387bdc6dbb88d3e2bb8a6ae0f75331ca` | Sum equals total |
| Malvern Hills | [Publisher identity](https://opencouncildata.co.uk/council.php?c=94&y=0) | `2c363a7bb4c18396cc73f4733dc0f1c6960dca604212bd8bf2ee64f4dc518551` | Sum equals total |
| Manchester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=262&y=0) | `20e88dc40608477b3e1faf14966638b694202a99c169361a70f4fe5993fa2b39` | Sum equals total |
| Mansfield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=95&y=0) | `a3a3dac885e5c6630ab60cdda741b1495992ca6307ff5a86211e61395f30ea5c` | Sum equals total |
| Medway | [Publisher identity](https://opencouncildata.co.uk/council.php?c=345&y=0) | `17062ee12e79d58b0be4c03d8a65bbcde8c11c4d8f780afddcb377362c19a222` | Sum equals total |
| Melton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=96&y=0) | `130830c1b75d1a58aabf62c74f159808e47e6d688957d2e08a26c68d928cb57a` | Sum equals total |
| Merton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=249&y=0) | `af135a5f51429a8ee47e75d06007281bf75d94892c506ea7551e88ba145090e3` | Sum equals total |
| Mid Devon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=98&y=0) | `b1aa38e6e20bb9d8ff3b49a3a1fd763b7aebd6f9072d2d6ba1d71440af07ed08` | Sum equals total |
| Mid Suffolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=99&y=0) | `177b8abba58f3d693162470e43af1da7ccb249340826aae180b01306a4f3b3ac` | Sum equals total |
| Mid Sussex | [Publisher identity](https://opencouncildata.co.uk/council.php?c=100&y=0) | `90ba91f2b338c38253c1dab4472954913a838185bdfd993cb4cd38f7ab2d4381` | Sum equals total |
| Middlesbrough | [Publisher identity](https://opencouncildata.co.uk/council.php?c=346&y=0) | `8f941f5b52f72d85c0a4a6321a3b2b4b2131d076e596f60792d8696bb8f2cb75` | Sum equals total |
| Milton Keynes | [Publisher identity](https://opencouncildata.co.uk/council.php?c=370&y=0) | `739aca1aa8db7d8a126e3a360db95ab6741c1c0a4ad4d6fe31b0e71bb9b621b2` | Sum equals total |
| Mole Valley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=198&y=0) | `6fe55995a1a494f2a777f0dc20b33b4acef2bde23e511592efb9a50776b9c07a` | Sum equals total |
| New Forest | [Publisher identity](https://opencouncildata.co.uk/council.php?c=101&y=0) | `d2a762c306a3631f1f0a339a94ccc55ccfff1941bb87df0e87323abdf02c5916` | Sum equals total |
| Newark and Sherwood | [Publisher identity](https://opencouncildata.co.uk/council.php?c=102&y=0) | `1923dc4931344843e9a438722617753e3f098ddce549ec368c526a1bcda9d0b7` | Sum equals total |
| Newcastle upon Tyne | [Publisher identity](https://opencouncildata.co.uk/council.php?c=263&y=0) | `73eced8b387dc2510deb314a7f87c8e3dfae8274f794da75abaf6da8b89f0f60` | Sum equals total |
| Newcastle-under-Lyme | [Publisher identity](https://opencouncildata.co.uk/council.php?c=103&y=0) | `6f46867cf71b021a3015b8390061a389bfcfa05f2b71bffb940e4cc1baa30392` | Sum equals total |
| Newham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=250&y=0) | `d112f9352e9d24d08011fbb0218d0d9bda32014d7afa27950c36e8f541a60703` | Sum equals total |
| Norfolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=16&y=0) | `343271e3ffd25e5cbd3b1108cd09e7e35f916da77e1c114a735e088a93fd808d` | Sum equals total |
| North Devon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=104&y=0) | `be76f6368d11d12a09c3738060fe4013622c97dc06da496d70803621252267fa` | Sum equals total |
| North East Derbyshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=106&y=0) | `85fafb3b639c011590b289afefb2df9214093be33dfcf378d6b61260888f1f94` | Sum equals total |
| North East Lincolnshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=371&y=0) | `628ff0b74a4ab12beb7615a8b6e0ca41a52775860fb098fc205429fc9f0fbe74` | Sum equals total |
| North Hertfordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=199&y=0) | `4b6edef80845535b07f42a1e50c79d3389b5f7e2e27864be3c0fd1f21956ff6a` | Sum equals total |
| North Kesteven | [Publisher identity](https://opencouncildata.co.uk/council.php?c=107&y=0) | `6867a39279fdfe4bf64b570cb5ac256ce27d1a68b00509b9a887f72b6096468b` | Sum equals total |
| North Lincolnshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=347&y=0) | `5ef76eb5d929719a71aaec813f76bd38b3beccb1b03d8d951cbcb5264edb1c26` | Sum equals total |
| North Norfolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=108&y=0) | `c3cda4d37e3563ecf7681fd1f906b2798d380e9c1371ea0004c2072d392cc767` | Sum equals total |
| North Northamptonshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=414&y=0) | `5069b2a9d4375ae57d1b9716bd293e161e28ee456c8642c95ff13e04f145cc87` | Sum equals total |
| North Somerset | [Publisher identity](https://opencouncildata.co.uk/council.php?c=348&y=0) | `22a239caf5cf74d21281a41ca95a4a6bc6b75ef0f89af3b43f29b667c6315147` | Sum equals total |
| North Tyneside | [Publisher identity](https://opencouncildata.co.uk/council.php?c=275&y=0) | `020428ff83089f7a4fd7af7400ca6f4184848fb39192a95459145353b3151f8a` | Sum equals total |
| North Warwickshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=109&y=0) | `808f024e1f8edd2ff3a31b5322a26407af1d7d06f206bd9c5180e165f32da812` | Sum equals total |
| North West Leicestershire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=110&y=0) | `2205de39b93d6352e1cb267721b35dad2cec43d3f965d379d694606d38adcc40` | Sum equals total |
| North Yorkshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=417&y=0) | `be97f82622105d4532c85662214c526b42c529cb62471d6cea9c2f01073a5f39` | Sum equals total |
| Northumberland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=349&y=0) | `fd52b4748eff16821898d0df9bdd983db714f0a0c0bfefbf184c789fd3e4d1cd` | Sum equals total |
| Norwich | [Publisher identity](https://opencouncildata.co.uk/council.php?c=200&y=0) | `bd420a7328eca4d5f5b82c844fd6340b0ac38624cb3e61d7c2e8acda297cec27` | Sum equals total |
| Nottingham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=350&y=0) | `2814164cc980dedf284d68c69822e54815eb61ca982c7923cd5dc0b04a47b8c8` | Sum equals total |
| Nottinghamshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=19&y=0) | `106b6fc748f7fbe4e7fe330ad41c9f7c76605323a6669e4431ff834c7d8dd77d` | Sum equals total |
| Nuneaton and Bedworth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=168&y=0) | `5e5af2593df3bc534fecc9089a5aab7cc626cc6ef30d72db6b79c077553af475` | Sum equals total |
| Oadby and Wigston | [Publisher identity](https://opencouncildata.co.uk/council.php?c=112&y=0) | `a51663c75b8d4c1cf2e44ef7c4773352e788adb402e8d1bc62568b7dd47ab028` | Sum equals total |
| Oldham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=276&y=0) | `6a3182915026fab4edc00c0f785022e77127b8251bf310404f84381650a0b8bd` | Sum equals total |
| Oxford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=169&y=0) | `f75f6e640599b5a632c555a11e14f0e2f0757cdffdbe83454112b8d8ea17a147` | Sum equals total |
| Oxfordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=20&y=0) | `7557de0fbce42ebc4aefa9a338ee0ac727deaba79b9f48b6bcfebac9bed84f32` | Sum equals total |
| Pendle | [Publisher identity](https://opencouncildata.co.uk/council.php?c=201&y=0) | `6113859140f4ddbce115e0c8ebe0533e5c26c8e1b1c1f772c9966e52d8a7135a` | Sum equals total |
| Peterborough | [Publisher identity](https://opencouncildata.co.uk/council.php?c=372&y=0) | `b6d813b95db295bac60b01f990633eb8c502799560404adf073290ca2647276f` | Sum equals total |
| Plymouth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=373&y=0) | `90adc04a8f40f4a61238fec5a587a357efa4f25e86787f42cbc2cc99f81f5278` | Sum equals total |
| Portsmouth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=374&y=0) | `58ac3a6f0417ef8e12fa9619b3a32e151ce55d030709f5747d8d903311976bcb` | Sum equals total |
| Preston | [Publisher identity](https://opencouncildata.co.uk/council.php?c=202&y=0) | `c2c27a9b8d542c9d4bd5ac2082459ffec1936d8079479c27441671b0cb479dde` | Sum equals total |
| Reading | [Publisher identity](https://opencouncildata.co.uk/council.php?c=375&y=0) | `68b425e5144a9d065d34c7448aaa1998b6a90a40188a351c83f6be1ca769ede4` | Sum equals total |
| Redbridge | [Publisher identity](https://opencouncildata.co.uk/council.php?c=251&y=0) | `f43e34334495b4ae6ab60cb7846ad2b9b8a3e8b2c365491fbcd71da55499d363` | Sum equals total |
| Redcar and Cleveland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=352&y=0) | `7bdffe4ae2b27877f8f84c1c73cdc03c890d800cd8c90c62c85c4ae0d3288646` | Sum equals total |
| Redditch | [Publisher identity](https://opencouncildata.co.uk/council.php?c=203&y=0) | `07a3b3f24c5ca1b6fb62733bded97c0490415b610d9ec00710050435c6137cbb` | Sum equals total |
| Reigate and Banstead | [Publisher identity](https://opencouncildata.co.uk/council.php?c=204&y=0) | `8337745f4191542fe77121c2692c0da45c72d9b79a38259e08a681c56f3f64c4` | Sum equals total |
| Ribble Valley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=114&y=0) | `4f3d4a1a8f65d9e7315b68e685e77fd4e7332659f4ef2d18ef0184b44a0b44da` | Sum equals total |
| Richmond upon Thames | [Publisher identity](https://opencouncildata.co.uk/council.php?c=252&y=0) | `3420a5ee1020f48080ed2945a8b82eff0c15877fbdaf093a1bf091e48df6ab84` | Sum equals total |
| Rochdale | [Publisher identity](https://opencouncildata.co.uk/council.php?c=277&y=0) | `16f67a5b09a0a0fa95cf1cef08b90cb3124d78b2d6f817bc391920d2a3aa26e2` | Sum equals total |
| Rochford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=205&y=0) | `28fdee63e2eaf3c931707e00e5e3b9a6d9af4e911076cb5f472d616e49386356` | Sum equals total |
| Rossendale | [Publisher identity](https://opencouncildata.co.uk/council.php?c=206&y=0) | `f914cc32aa89848e51e6cacffb15067da67fdd5fee8ad8c32d2f3fe3410f3775` | Sum equals total |
| Rother | [Publisher identity](https://opencouncildata.co.uk/council.php?c=116&y=0) | `4a1171f9842e4fefb58958dd8bbcdb8b53f7cdd64afbf901e8d126033521d8fe` | Sum equals total |
| Rotherham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=278&y=0) | `f6e16529f7ad20b29360fa1ba775a3b61b742c091b2ea490ef69a7e88ef165c6` | Sum equals total |
| Rugby | [Publisher identity](https://opencouncildata.co.uk/council.php?c=207&y=0) | `017fc42a4e44343ec822575ed334156fedaaa48dc865c1c08f906513c26a9159` | Sum equals total |
| Runnymede | [Publisher identity](https://opencouncildata.co.uk/council.php?c=208&y=0) | `c984eac74c77891d5afeb554bad74f9725c1c02405dcd29027c3c1affe36c421` | Sum equals total |
| Rushcliffe | [Publisher identity](https://opencouncildata.co.uk/council.php?c=117&y=0) | `2ab423912238a62d2fa5345ba40f057d7db1d6a24041fe99f7017fa5261a17fe` | Sum equals total |
| Rushmoor | [Publisher identity](https://opencouncildata.co.uk/council.php?c=209&y=0) | `7c8ace3f698f293a65c8d6c7589366594dd746bc970dbb1204f39c88522614a4` | Sum equals total |
| Rutland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=353&y=0) | `2638f48f1007bf7288032a5cd7009896446d7d7017ab513a0ad437d0420d77c3` | Sum equals total |
| Salford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=279&y=0) | `bc772461075adcd6aa1d802a7ba2993cecd2530abf2755966a19f865196a6a70` | Sum equals total |
| Sandwell | [Publisher identity](https://opencouncildata.co.uk/council.php?c=280&y=0) | `585e0e398a5347b5f39a0a6d9e88f7d88fbd11b9cc5e22a402a5ca92ce6163de` | Sum equals total |
| Sefton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=281&y=0) | `ab52e98cbfc3b5e9266dc7c475f1dc2eed67cba831d4d32cec2df179213cdabd` | Sum equals total |
| Sevenoaks | [Publisher identity](https://opencouncildata.co.uk/council.php?c=122&y=0) | `6f222a3e64adb144bda0ea7cd51c5d1c683c176087cf980eb2b1b61fb79b09a6` | Sum equals total |
| Sheffield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=282&y=0) | `485ad861702a986c6dcab7eb09e620b34631a0352f38a5d79b08ceab4f8f240f` | Sum equals total |
| Shropshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=354&y=0) | `e71eb0fede57fdafb135bca3c89e5865e428c1ea59b69532fafa17567ec537bb` | Sum equals total |
| Slough | [Publisher identity](https://opencouncildata.co.uk/council.php?c=376&y=0) | `41cb69e1d20eb4e33eb8207ec7ef6a2dd8d6a848bf5849122373fedef3d5999d` | Sum equals total |
| Solihull | [Publisher identity](https://opencouncildata.co.uk/council.php?c=283&y=0) | `de2b2ca677fb07ea395d3e5050e87cfb6da828717f3f2c0c1ec00fafd046bec5` | Sum equals total |
| Somerset | [Publisher identity](https://opencouncildata.co.uk/council.php?c=416&y=0) | `95c67f31ad4f1c46fcfe1d3954f44142db2d5135b4188c59c25ef904bc6e1d9d` | Sum equals total |
| South Cambridgeshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=125&y=0) | `353df45fe094db7d357f15f10632a28e6ddc2bed53fdfaecbad3a36977b5ed6a` | Sum equals total |
| South Derbyshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=126&y=0) | `e192e385ccd661f40ca00834ac3f5020578fc8c9d354e65ad725aaf992bdd37c` | Sum equals total |
| South Gloucestershire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=355&y=0) | `13006b19a0503a51b2cf2e84abf5c5a3a0dd9e66baf8f19fbb6f12bd07dcc083` | Sum equals total |
| South Hams | [Publisher identity](https://opencouncildata.co.uk/council.php?c=127&y=0) | `a8b4f4449bce10ae6669e91f6cb9dba13128c9ead7ce6cb113112a58382c86e2` | Sum equals total |
| South Holland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=128&y=0) | `2be8d051442e96ee8d9ea6f70d0bfc2f05a21c9dc57ad53621eab0969223c10d` | Sum equals total |
| South Kesteven | [Publisher identity](https://opencouncildata.co.uk/council.php?c=129&y=0) | `8b635fb5bfb7da6e93ab0218f1002be2726f7d9510329d7404023f19d70395a6` | Sum equals total |
| South Norfolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=131&y=0) | `62f11e354b676a97dab3a348e5adb2952cb7c6f1459b3c11d86ddd731da44728` | Sum equals total |
| South Oxfordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=133&y=0) | `5f75726796e5af255f66eda10f61112a9ada99c6d45ff78308f54db4377e701b` | Sum equals total |
| South Ribble | [Publisher identity](https://opencouncildata.co.uk/council.php?c=134&y=0) | `9bc195ab1a53fa8f4e1aac9f7b0454024b23b84e7c626948ff43ee570e37d682` | Sum equals total |
| South Staffordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=136&y=0) | `92616055c0003ab66a7e12d89bf0c3a0b13d10b80875e394cbdda0596e6ca5bd` | Sum equals total |
| South Tyneside | [Publisher identity](https://opencouncildata.co.uk/council.php?c=284&y=0) | `6bc3ceff28c1c518474c7e73dfb7809e0ba39b5f830b97337e9cbe5797900f75` | Sum equals total |
| Southampton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=377&y=0) | `a4fe98d3777aeb236bb2ba26e2ecfd844a7fa4bb2f9733a4c37f7a160f586f17` | Sum equals total |
| Southend-on-Sea | [Publisher identity](https://opencouncildata.co.uk/council.php?c=378&y=0) | `84ff1e4be8fe44422e9545c933cedc2c44aa2404cdcb6471a5abd1dfc91fd52b` | Sum equals total |
| Southwark | [Publisher identity](https://opencouncildata.co.uk/council.php?c=253&y=0) | `731c42b4e95d78bfe933776f1bc47dee706696e0a5c1bcf1fdaaef049824c99f` | Sum equals total |
| Spelthorne | [Publisher identity](https://opencouncildata.co.uk/council.php?c=137&y=0) | `04637a3f8c7e424b5d22f310d81f2a481e8f49aff3249e7ca07e20f61df839d3` | Sum equals total |
| St Albans | [Publisher identity](https://opencouncildata.co.uk/council.php?c=210&y=0) | `1a68760b0073c1f0a62a7cd5a864b41a5c6ca09dc34f9f0108205f9338f0e288` | Sum equals total |
| St. Helens | [Publisher identity](https://opencouncildata.co.uk/council.php?c=285&y=0) | `786c78d4bd780fbf53eb4326233cfd86c6b7393e1381f9d020bc12721cffe302` | Sum equals total |
| Stafford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=407&y=0) | `b8030ba8aa7d2341ea7aa7887a2585d057cff37004a61b6dc101cb2111051547` | Sum equals total |
| Staffordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=22&y=0) | `f89d92d903485e01211282fa40b6301295b20ca7ddbf575c70808bf7172d88a9` | Sum equals total |
| Staffordshire Moorlands | [Publisher identity](https://opencouncildata.co.uk/council.php?c=139&y=0) | `4f6f464bb103b2d64190ba81d5bf2e4ae1ac9f3b896188be0790611220355409` | Sum equals total |
| Stevenage | [Publisher identity](https://opencouncildata.co.uk/council.php?c=211&y=0) | `991814676226dd1a722048e9b09f57f0aa5aaf81e6825e0594e0f95925752cae` | Sum equals total |
| Stockport | [Publisher identity](https://opencouncildata.co.uk/council.php?c=286&y=0) | `3e189f3d76e9d0838f90e946c8b1e344c3b00eeb51a9980786bb2510d629d46a` | Sum equals total |
| Stockton-on-Tees | [Publisher identity](https://opencouncildata.co.uk/council.php?c=356&y=0) | `da132eeaffd0811bf6cecf9be748cbec230dc03d225a9147798bae7d5aa61a6c` | Sum equals total |
| Stoke-on-Trent | [Publisher identity](https://opencouncildata.co.uk/council.php?c=357&y=0) | `69522dc6b56b006132526486b39975f6b0383eb0079ee65f9bae229d55a2c508` | Sum equals total |
| Stratford-on-Avon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=140&y=0) | `2efcb2e5c01d7255f4fe83f70a0a4dc7d5df3f0372b03e8086dc55505efdff7d` | Sum equals total |
| Stroud | [Publisher identity](https://opencouncildata.co.uk/council.php?c=212&y=0) | `7f97d2c27574a5acead0b2fb9c4e91faf5cfc345aaef6ced4f750cfd0bc35a0d` | Sum equals total |
| Suffolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=23&y=0) | `b5ffd4e8e9e9b899e4df76c7d68eaba5e456de14ba54726cd13d9b87d55161ad` | Sum equals total |
| Sunderland | [Publisher identity](https://opencouncildata.co.uk/council.php?c=287&y=0) | `8df9bf1f5f176109c19d56856aa0185fe4c2fd7bc7d7610f3f3fb4c95571a5fc` | Sum equals total |
| Surrey | [Publisher identity](https://opencouncildata.co.uk/council.php?c=24&y=0) | `c839b78b78b4fa3f74ee7c9c94c4e48948bf2bef9c4badd34cb0d1ab04f78346` | Sum equals total |
| Surrey Heath | [Publisher identity](https://opencouncildata.co.uk/council.php?c=142&y=0) | `6c080011bc2cc252e2f84002e81ad0840e45fb38215d98b2e478144695de96b1` | Sum equals total |
| Sutton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=254&y=0) | `41199985b56f231d92c70b6b9caa8600a62ef8909a01f918a0956eb5a65c20bd` | Sum equals total |
| Swale | [Publisher identity](https://opencouncildata.co.uk/council.php?c=143&y=0) | `78bf697cc5fd9135433c7d02fc8e51eac441255296923cd2b38cbe365a6de739` | Sum equals total |
| Swindon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=379&y=0) | `413850e2e5efdfa2647473f30ac458a0a9550a4b425f96c7857ee3b6450e3f82` | Sum equals total |
| Tameside | [Publisher identity](https://opencouncildata.co.uk/council.php?c=288&y=0) | `d367573bc3b5442e62631cc5c01be1bbbf6c6407e12dc0a5e3268f6bb077a785` | Sum equals total |
| Tamworth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=213&y=0) | `71b2e587b0f00bad249589278860f79f832bcbcfae4bbb919e92dc3fa19ff51a` | Sum equals total |
| Tandridge | [Publisher identity](https://opencouncildata.co.uk/council.php?c=214&y=0) | `9a8ca8822d9bed611c94b1175bba9a96a8e06639e8d37475bb7e249462c89dee` | Sum equals total |
| Teignbridge | [Publisher identity](https://opencouncildata.co.uk/council.php?c=145&y=0) | `2330628a0fb9cd44dc13aeb4754ad6361731e93fee8475c7e9855e04649d09f5` | Sum equals total |
| Telford and Wrekin | [Publisher identity](https://opencouncildata.co.uk/council.php?c=358&y=0) | `2200520818c2f22825a88d2a774d004e397d1d14631de37f88e5eaa708b76714` | Sum equals total |
| Tendring | [Publisher identity](https://opencouncildata.co.uk/council.php?c=146&y=0) | `cc1530deee76c6e2cd4d167d703f2de6e276a6ea25bfb489f80821f64835bf00` | Sum equals total |
| Test Valley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=147&y=0) | `3e7042f958992ba50b452db1147cec5f7c6be2ad5faf2c49521b6ba75ac3e089` | Sum equals total |
| Tewkesbury | [Publisher identity](https://opencouncildata.co.uk/council.php?c=148&y=0) | `a7bef11480b591b548513adc4a152b536f093cd48240afae7119f8244bf224a9` | Sum equals total |
| Thanet | [Publisher identity](https://opencouncildata.co.uk/council.php?c=149&y=0) | `03c63a1d9c075ac4b468f128962d64533609ceebff1e5f3bd58f886240f8c2e0` | Sum equals total |
| Three Rivers | [Publisher identity](https://opencouncildata.co.uk/council.php?c=215&y=0) | `4fc14d090a862e5663c9501360c69ea57b752410f9f8296853e5564a09c6cb88` | Sum equals total |
| Thurrock | [Publisher identity](https://opencouncildata.co.uk/council.php?c=380&y=0) | `76f4545eccd3947f4c2ab6ca8c263b158ea5f1da3c23da6791d6b3f4761e7fd9` | Sum equals total |
| Tonbridge and Malling | [Publisher identity](https://opencouncildata.co.uk/council.php?c=150&y=0) | `71a8c67ffbfbf943c91960c1cb0b8500ab2b67a1a7e9ef14d650ccdee01cecc3` | Sum equals total |
| Torbay | [Publisher identity](https://opencouncildata.co.uk/council.php?c=359&y=0) | `b3c417630800c095eb5b0351ba1753d9850da716837a33a4404a5129a4bb8ec2` | Sum equals total |
| Torridge | [Publisher identity](https://opencouncildata.co.uk/council.php?c=151&y=0) | `42e442f88f0232b1828d9378fc97f1e363e5afef6a491e1549533d776cd394b8` | Sum equals total |
| Tower Hamlets | [Publisher identity](https://opencouncildata.co.uk/council.php?c=255&y=0) | `dc15f1fffffd4574893c4bb4290a1db851d12d5d48eb939c95f671dd6c8afc3d` | Sum equals total |
| Trafford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=289&y=0) | `9f2602d2f523564eb273e159cb798a024451700119a8537485856b081dd86ded` | Sum equals total |
| Tunbridge Wells | [Publisher identity](https://opencouncildata.co.uk/council.php?c=216&y=0) | `ebb285cddbadf429a94c3065da66a8bb56be0e1856585aee3c63ef066a8f3ca4` | Sum equals total |
| Uttlesford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=152&y=0) | `4e7569ca44fdb9d50c1285c45a7b04f7c23305ff51dfc64e9831035f28440ce2` | Sum equals total |
| Vale of White Horse | [Publisher identity](https://opencouncildata.co.uk/council.php?c=153&y=0) | `0436496b3037f6a925882cf888da3938285f1c1edd72d68e98ef52373063ec7d` | Sum equals total |
| Wakefield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=290&y=0) | `2a0d42a42b9cdbe57358d813a0036b000e6a6699434779e4e653807da5c863e7` | Sum equals total |
| Walsall | [Publisher identity](https://opencouncildata.co.uk/council.php?c=291&y=0) | `e19040d97a6213418d93b9290e7bd812132f8a5511dc906faa76555a23faca7b` | Sum equals total |
| Waltham Forest | [Publisher identity](https://opencouncildata.co.uk/council.php?c=256&y=0) | `1444ebfbba1b3ef376fd850755dc16e60b9df5aaf672b96da78e3d8aceb60849` | Sum equals total |
| Wandsworth | [Publisher identity](https://opencouncildata.co.uk/council.php?c=257&y=0) | `25a98ce67a246366d6c6c999579e670a4ffea724d50b2d14c1f2297ad18328ce` | Sum equals total |
| Warrington | [Publisher identity](https://opencouncildata.co.uk/council.php?c=360&y=0) | `132e48990d353a2eb19a66859df33985cbbc8d3160192a6a215cff710e1ab1e9` | Sum equals total |
| Warwick | [Publisher identity](https://opencouncildata.co.uk/council.php?c=154&y=0) | `a4dde0954224326aeca7876da2af4bfbced8a3e51cd74693077192f91c490172` | Sum equals total |
| Warwickshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=25&y=0) | `8409daec06b33e8604815b35b31619596a3f0203eb565177f0523209fd57bc53` | Sum equals total |
| Watford | [Publisher identity](https://opencouncildata.co.uk/council.php?c=217&y=0) | `8a89188eceeedf06e383689b9d7dc741bbfc5cae0f6829565971abe38b9523e8` | Sum equals total |
| Waverley | [Publisher identity](https://opencouncildata.co.uk/council.php?c=156&y=0) | `7356c8bd0ab68bd7fa3b313a17dc76f61ddafaae4024f09880cf51b70ed12045` | Sum equals total |
| Wealden | [Publisher identity](https://opencouncildata.co.uk/council.php?c=157&y=0) | `61f718f0f8acd38ddc5bc234cf29276b90ea3d74f9c9b83933b93956335277f4` | Sum equals total |
| Welwyn Hatfield | [Publisher identity](https://opencouncildata.co.uk/council.php?c=218&y=0) | `d4252367cf1c8cb2fd7011788e71a1f4cde784ea15f16618bc6403f6519d94e8` | Sum equals total |
| West Berkshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=361&y=0) | `56a42ec220270b255748592b6403ac5ea8f22ef509def043d453daef0bd46bd4` | Sum equals total |
| West Devon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=159&y=0) | `90c77a586e4e99a6c71c9b81e260c9fc3c25a9998c59d457ddcf8ed809b0ea3c` | Sum equals total |
| West Lancashire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=219&y=0) | `b3c90e8307725d8cf09d8410b70adbbaf78184890a73585e7a28dcade3c0604c` | Sum equals total |
| West Lindsey | [Publisher identity](https://opencouncildata.co.uk/council.php?c=160&y=0) | `25d99a2db240251a66e8d7e9c716109d775daab8b5d2e3ba6050b9a311dcf2f5` | Sum equals total |
| West Northamptonshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=415&y=0) | `eb1f444dad725c37669e30f447a778efdf7b7526a2f34aa8b7b0949283f3d04a` | Sum equals total |
| West Oxfordshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=220&y=0) | `662e1ef151a6a3a2218f6c6238d8086e0ac0a87bf88900159c757ca376078eb2` | Sum equals total |
| West Suffolk | [Publisher identity](https://opencouncildata.co.uk/council.php?c=410&y=0) | `db244fc9811c8cfc4dff6920ea6a1c41f1dd20e006f343e813fbdf3481914e81` | Sum equals total |
| West Surrey | [Publisher identity](https://opencouncildata.co.uk/council.php?c=420&y=0) | `a0dc410140ad69eb1203d31d87794fb9c6d9e7193dea3a224478cde186bd3da5` | Sum equals total |
| West Sussex | [Publisher identity](https://opencouncildata.co.uk/council.php?c=26&y=0) | `db7f0cb56ce27e6d4b8fb026a184a42f105de29db296b4ddd27cd59f3ff08463` | Sum equals total |
| Westminster | [Publisher identity](https://opencouncildata.co.uk/council.php?c=258&y=0) | `71400008d37ff5d40f4d0c14225bf45809979787d5b53a843952bbbaef663351` | Sum equals total |
| Westmorland and Furness | [Publisher identity](https://opencouncildata.co.uk/council.php?c=419&y=0) | `8c301af615e3ca75e40e1df462f5a369cfdde838533ff55ab99dad3b11097433` | Sum equals total |
| Wigan | [Publisher identity](https://opencouncildata.co.uk/council.php?c=292&y=0) | `6c3d5d125272dce476556799e0c87ad98d83a11b7d8a14509efcb6d157881878` | Sum equals total |
| Wiltshire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=362&y=0) | `a11c7a0a6337dd69bf3e224f3b55348b4042ac2da3f4638a5dffc5e6c4f781c0` | Sum equals total |
| Winchester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=222&y=0) | `63a2e928a3b0f9bab687df1b12242e53037a11ce920ac13f457602c5b5624bd9` | Sum equals total |
| Windsor and Maidenhead | [Publisher identity](https://opencouncildata.co.uk/council.php?c=363&y=0) | `edac4640356c000148875505203fbc05243bbe56df96b15e9ff38c72616e030c` | Sum equals total |
| Wirral | [Publisher identity](https://opencouncildata.co.uk/council.php?c=293&y=0) | `daddc6a4c53dd3142e47c3847ef4f0fb13693b2addcc7dd50d02332140431e7c` | Sum equals total |
| Woking | [Publisher identity](https://opencouncildata.co.uk/council.php?c=223&y=0) | `a0541f3ecd86a841cb4e99b5f0942c46ad7404a4663edff9d847f390bf9e2085` | Sum equals total |
| Wokingham | [Publisher identity](https://opencouncildata.co.uk/council.php?c=381&y=0) | `19cf3ab643eaf15243f1c7025785991b69e9fc6cb6a049186e2bb7b69fc03f73` | Sum equals total |
| Wolverhampton | [Publisher identity](https://opencouncildata.co.uk/council.php?c=294&y=0) | `8dd73004a54479c57a910dfb207ce492d86b19dca2f3cedfcd2ced9f745b12da` | Sum equals total |
| Worcester | [Publisher identity](https://opencouncildata.co.uk/council.php?c=224&y=0) | `5d34a178f29a1338e92f3364fa1cb58c63c597dfd365c606eb71aebe6971628e` | Sum equals total |
| Worcestershire | [Publisher identity](https://opencouncildata.co.uk/council.php?c=27&y=0) | `5c6eda421d447df3bf1bf4659adb71830b7d0efc45e08edc6790127fcac5ca73` | Sum equals total |
| Worthing | [Publisher identity](https://opencouncildata.co.uk/council.php?c=225&y=0) | `40bbfc63c26582a31ec9d0ebe657373a488d5a31c30bfed9190bc7edfe7dd984` | Sum equals total |
| Wychavon | [Publisher identity](https://opencouncildata.co.uk/council.php?c=162&y=0) | `a3fb6bb0fe5b85118e7850e7ca694e41f9b7a0c415a0b62c94886b02bb4dbe94` | Sum equals total |
| Wyre | [Publisher identity](https://opencouncildata.co.uk/council.php?c=164&y=0) | `e8b521b190eb4d1e93cdb163ea294c9cfa8f9dac08aa0d3f1482a869d9d8688d` | Sum equals total |
| Wyre Forest | [Publisher identity](https://opencouncildata.co.uk/council.php?c=226&y=0) | `949db80f481d7c7f23db1d6d250a12399d5ea07398aa46cfc98aaba6e22f173f` | Sum equals total |
| York | [Publisher identity](https://opencouncildata.co.uk/council.php?c=364&y=0) | `bbddad31e733b4deff33187c86db76ee4716f22ac23cb57d49f8d0c48b36b936` | Sum equals total |

## Verification and handoff

Node 22.23.4 was first on PATH for all Node, npm and commit operations. No application, page, component, route, test, package or workflow is changed. The research files are outside `data/`; no composition dataset remains at the branch tip. Main's `docs/STATE.md` is preserved with exactly three appended lines after rebasing onto `96df5d1`, following PR 59's merge.

| Check | Before cleanup at 3e708ae | After cleanup and rebase |
|---|---|---|
| `npm test` | 325 passed, 25 skipped, 2 failed; 352 total | 327 passed, 25 skipped, 0 failed; 352 total |
| Test files | 43 passed, 6 skipped, 2 failed; 51 total | 45 passed, 6 skipped, 0 failed; 51 total |
| `npm run check` | Previously recorded 0 errors, 0 warnings | 0 errors, 0 warnings |

Both original failures are resolved without changing either guard: `tests/council-profile.test.ts` still holds composition data, and `tests/sources-coverage.test.ts` still requires site datasets to appear in the source catalogue. No test was changed.

`node docs/dossier-sources-dry-run.mjs` verifies all eight retained-file hashes, the profile and registry input hashes, and all three dry-run results. The four moved source extracts are byte-identical to commit `3e708ae`; all fourteen hashes in the old manifest verified before cleanup. The regenerated audit and notice dry runs change only their base commit. `--verify-psaa` also verifies the original workbook hash and reproduces the organisation-name inventory from its eight year sheets. No original workbook is committed.

Independent Python counting confirms the 69 MHCLG and 259 PSAA profile matches. Temporary diagnostic assertions check case, ampersand and trailing Council handling; reject footnote stripping, word reordering, punctuation removal and whitespace folding; and check that a duplicated registry name produces an ambiguous result with no assignment. A temporary modified source is rejected by both verification and regeneration modes. No test files were added or changed for these checks.

The punctuation scan covers all twelve surviving changed files, including JSON, and checks literal and encoded forbidden dashes and spaced hyphens. The personal-name/contact-field scan is clear. A literal full-name scan against 1,203 distinct names from 1,204 roster rows on twenty source pages found no matches; names were held in memory and no name list was written. These scans support selected-field retention and manual review; they are not a general proof of name recognition. The repository has no `test:text` script, so no pass is claimed for that command.

Only named paths are staged. The commit uses the normal pre-commit hook. PR 60 remains a draft on `docs/dossier-sources-2026-11`; removed files remain recoverable from `3e708ae`. The source choices, audit crosswalk and PSAA reuse remain decisions for Tom. No merge, tag or deployment is authorised.
