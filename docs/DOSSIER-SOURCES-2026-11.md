# Dossier source decisions | November 2026

Research checked 15 November 2026 against `origin/main` at `f4311a8fbb9408c1bb727a2f25d02e1bb6ded925`. The denominator is the 296 entries in `data/council-tax/england-2026-27.json`, not the 361-body registry. The mid January 2027 dossier gate remains binding. This research does not complete that gate or authorise a rendering change.

The source bundle is [data/sources/dossier-2026-11](../data/sources/dossier-2026-11/). Its [manifest](../data/sources/dossier-2026-11/manifest.json) records SHA-256 hashes and sizes of retained files, plus separate hashes of original responses where obtainable. Retained sources are selected extracts without personal names, not byte-identical HTML or PDF copies. Original content was processed in memory. Names, contacts, signatures, portraits and author metadata were excluded before files were written. A blocked original has a null original hash, never the hash of an error page. The extract itself still has a manifest hash.

Reproduce all three dry runs and the manifest from the pinned extracts with Node 22.23.4 first on PATH:

```sh
node docs/dossier-sources-dry-run.mjs
```

This command has no network or rendering operation. Reconciliation sums are research checks, not new published figures. Source dates, retrieval dates and effective dates remain distinct. The requested `src/lib/redaction.ts` does not exist at this base. The referenced module in the sibling frontend was read; it is a supplier filter, not a general personal-name detector. These extracts instead use selected fields, followed by a name scan and manual inspection.

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

[dry-run-audit.json](../data/sources/dossier-2026-11/dry-run-audit.json) reports **0 of 296 exact GSS or ONS joins for both publications**. Both identify bodies by name. It lists every profile without a code-addressable row, including its GSS code and class. This is a join-key gap, not a claim that all 296 bodies are absent from the publisher's data. No name join, manually fabricated code column or predecessor substitution has been used.

A build needs an independently evidenced mapping between each publisher body identifier and the profile code, with pension funds, other body types, historic bodies and changed boundaries treated separately. A council-name similarity match is not that evidence. The current sources therefore resolve publication discovery and meaning, but do not close C3's exact-identity dependency.

**A build would show:** after identity approval, the selected publisher's dated delivery or publication status, its financial year and source line. The latest inspected PSAA edition also covers 2025/26 before its 31 January 2027 backstop.

**A build would leave absent:** all audit profile sections at present; opinion type, financial condition, reasons, rankings, and any status inferred from an absent row. The two publications would remain separate measures.

**Decision required:** choose the measure, commission an evidenced code crosswalk, and resolve PSAA reuse terms if selecting its per-body data. Accepting a source by name alone would change the current exact-code rule and is not assumed here.

## 2. Section 114 notices

### Register search and verified documents

No maintained official national notice register was located in the GOV.UK, MHCLG, Parliament and council-site searches recorded in `section-114-register-search.json`. This is a bounded search finding, not proof that no register exists. The [House of Commons Library briefing, Local authority financial resilience](https://commonslibrary.parliament.uk/research-briefings/cbp-8520/), **15 May 2025**, contains a historical table and separate discussion of subsection 2 notices. It is an official research publication, not a continuously maintained exhaustive register.

The two original notice documents inspected are recorded in [section-114-notices.json](../data/sources/dossier-2026-11/section-114-notices.json), with original hashes, locators and short extracts:

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

[dry-run-section-114.json](../data/sources/dossier-2026-11/dry-run-section-114.json) holds two inspected documents associated with two profiles through explicit manual review of official council identity. Neither PDF prints a native GSS code, so **native-code joins are zero**. The profile assignments are labelled separately, not presented as publisher-supplied codes. The other 294 profiles have no inspected notice in this bundle; that is not a statement that they have never issued one. Exceptional Financial Support is never evidence of a notice. No cause is recorded.

**A build would show:** once the identity method is approved, a dated link to each inspected notice and the exact statutory provision, explicitly described as a historical document record.

**A build would leave absent:** notices supported only by announcements or inaccessible originals; any negative status for other councils; current restrictions without later evidence; explanations and any inference from financial support.

**Decision required:** approve a non-exhaustive official-document register, its explicit identity assignment and maintenance owner. Require original-notice inspection for additions. Complete the nine retrieval leads before treating them as verified records.

## 3. Seats by party: two source options

### Option A: Open Council Data

Pinned [English Council Compositions 2026](https://opencouncildata.co.uk/councils.php?model=E&y=0), retrieved **15 November 2026**, with the homepage's **15 November 2026** last-updated label recorded separately. The table's original HTML SHA-256 is `0b17adb555571dd84424722367f1604e1ce820670d131cac22a03b95f9163c98`. Each linked council page's original response hash and printed GSS code travel with its row in `composition-option-a.json`. The homepage date is site-wide; it is not an effective date certified for every council.

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

**Isles of Scilly, E06000053, has no row.** The 23 out-of-scope rows are 21 counties and East Surrey and West Surrey. They are listed with their source codes in the dry run and do not replace existing profiles. City of London joins, but its chamber definition still needs review before drawing a generic parties bar.

This is a 2026 source, unlike the held 2025 compilation described in B2. The publisher's [2016 to 2026 composition CSV](https://opencouncildata.co.uk/history2016-26.csv), SHA-256 `c0d9b68024fd0481c745ded76e16cf107ea17b5205c443cedbbe75892500177c`, is described as a snapshot shortly after the May elections. Its 2026 rows cover all 295 joined profiles and reconcile. Selected party fields are pinned in `composition-2026-election-baseline.json`. The archive and current table therefore include the 7 May 2026 election period; they are not a certified effective-date history for every body. A 2026 archive row is not proof that that council's last ordinary election was in 2026.

The diagnostic comparison finds **182 profiles with at least one changed party bucket since the 2026 archive**. The dry run records every before and after value and its explicit bucket mapping. It does not infer a defection from a difference. The publisher's linked party-change table supplies **635 rows after 7 May 2026 across 206 profile codes**, joined through its council IDs. Repeated changes or reversals explain why event coverage and net snapshot differences are different measures; no row is deduplicated just because personal names have been removed.

The separate by-election archive is pinned without wards or names. It includes holds and warns that coverage may be incomplete. Its rows have neither GSS codes nor linked council IDs, so they are not name-joined to profiles. Its date column must not be labelled polling date: Manchester's entry says 11 September whereas the council gives 10 September. These event sources identify councils requiring review; they do not reconstruct current totals or provide an exhaustive history since each council's last election.

### Option B: twenty official council sources

The purposive sample has **four councils in each of the five profile classes**. `composition-option-b-sample.json` contains each URL, exact party or political-group labels, date shown, capture method, original hash where obtainable and reconciliation. `dry-run-seats.json` places these values beside Option A without resolving differences automatically. The source labels below are shortened for space; the source JSON preserves them.

| Council | Class | Date shown | Published totals | Sum / council seats |
|---|---|---|---|---|
| Burnley | SD | None | Independent Party 10; Labour 8; Labour & Cooperative 2; Conservative 3; Liberal Democrats 6; Green 3; Reform 12; Restore Britain 1 | 45 / 45 |
| Cambridge | SD | Reviewed 2 November 2026 | Labour 15; Green 12; Liberal Democrat 11; Independent 3; Conservative 1 | 42 / 42 |
| Oxford | SD | None | Labour group 20; Green group 13; Liberal Democrat group 9; Oxford Independent Alliance group 4; Real Independent group 2 | 48 / 48 |
| Woking | SD | Meeting 19 May 2026 | Liberal Democrat group 23; Independent and Others group 7 | 30 / 30 |
| Bristol | UA | None | Conservative 7; Green 34; Labour 19; Liberal Democrats 9; Independent 1 | 70 / 70 |
| Leicester | UA | None | Labour 32; Conservative 15; Green 4; Liberal Democrat 3 | 54 / 54 |
| Nottingham | UA | None | Labour group 44; People's Alliance group 6; Independents and Independent group 4; ungrouped 1 | 55 / 55 |
| Portsmouth | UA | None | Liberal Democrat 18; Conservative 8; Labour 8; Independents Party 6; Community Independents 2 | 42 / 42 |
| Birmingham | MD | Updated 8 June 2026 | Reform 23; Green 19; Labour 16; Conservative 16; Liberal Democrat 12; Better Birmingham 7; Independent Workers group 5; Independents group 2; Independent 1 | 101 / 101 |
| Leeds | MD | None | Labour 46; Conservative 15; Green 10; Reform 8; Liberal Democrats 6; Garforth and Swillington Independents 3; Morley Borough Independents 3; Social Democratic Party 3; Independent 4; vacancy 1 | 99 / 99 |
| Manchester | MD | Meeting 23 September 2026 | Labour 64; Green 21; Reform 7; Liberal Democrat 4 | 96 / 96 |
| Sheffield | MD | None | Labour group 26; Liberal Democrat group 22; Green group 19; Reform group 11; Community Councillors group 2; New Chartist Reform group 2; Independent 2 | 84 / 84 |
| Camden | ILB | None | Labour 45; Liberal Democrat 5; Conservative 3; Green 1; vacant 1 | 55 / 55 |
| Islington | ILB | None | Labour 44; Green 3; Independent 4 | 51 / 51 |
| Lambeth | ILB | Published 3 June 2026 | Green 27; Labour 26; Liberal Democrats 8; casual vacancies 2 | 63 / 63 |
| Wandsworth | ILB | Published 18 May 2026 | Conservative group 29; Labour group 28; Independent 1 | 58 / 58 |
| Bromley | OLB | None; 7 May election mentioned | Conservative 35; Labour 8; Liberal Democrats 6; Reform 5; Chislehurst Matters 3; Independent 1 | 58 / 58 |
| Harrow | OLB | None | Conservative 41; Labour 12; Arise 1; Independent 1 | 55 / 55 |
| Hillingdon | OLB | None; May election mentioned | Conservative 31; Labour 16; Reform 3; Green 1; Independent 2 | 53 / 53 |
| Kingston upon Thames | OLB | Meeting 21 May 2026 | Liberal Democrats 44; KIRG 2; Conservative 2 | 48 / 48 |

All **20 sums reconcile**. Sixteen sources print the chamber total on the same page; Manchester, Camden, Lambeth and Wandsworth use separately cited official council descriptions for that check. Only **seven** sources show a relevant review, publication or meeting date. Thirteen do not. Footer copyright years and unrelated allowance dates are not composition dates. Eleven main source responses were fetched and hashed directly; nine were available only through indexed official text or the web reader and retain no claimed original-byte hash.

This is a sample of source suitability, not twenty approved current compositions. Woking and Nottingham report mixed political groups which cannot be split into parties without additional evidence. Portsmouth's recruitment page retains a 2023/24 budget context and describes 2025 as its next fallow year. Camden and Islington's undated figures differ substantially from the current compilation. Lambeth's dated article precedes two announced July by-elections. Hillingdon's official `pre` subdomain requires confirmation against the live canonical page. The Woking and Kingston report originals were inaccessible directly. None of these limitations is repaired by arithmetic reconciliation.

Official evidence independently confirms that composition changes after an election. Cambridge's **8 May 2026** result gives Labour 17 and one Your Party seat; its page reviewed **2 November** gives Labour 15 and three Independents, with the other totals unchanged. Harrow's **8 May** result gives Conservatives 42; its current undated page gives 41 and one Independent. Those differences do not by themselves establish the mechanism. Manchester's **23 September** minutes explicitly record a party change and the **10 September** by-election before listing the new totals. Only party totals, dates and document identity are retained in `composition-official-change-evidence.json`.

### Keeping either option current

Option A has no published access charge for the inspected public pages or archive CSV. This acquisition needed one composition table and 318 linked identity pages, plus the separate date, licence, archive and change sources. Once identities are pinned, a refresh can compare one new table, rechecking changed identities and source labels. It still needs human review of vacancies, contradictory official pages, special authorities and changes after polling day. No paid product was purchased or treated as required. Accept the compilation's CC BY-SA terms before adopting this route.

Option B needs at least **296 council-specific source checks per full sweep**, plus missing-date, mixed-group and access follow-up. The twenty-source trial produced thirteen missing dates and nine originals not directly retrievable, so an unreviewed scraper is insufficient. There is no measured staff-time or cash quote to convert this into an hours or pounds estimate. A proposed operating rule is a weekly snapshot and review after ordinary elections, by-elections and published party changes, with a named maintenance owner and an explicit stale-data rule. This is a proposal, not a scheduled automation. Each council needs its own last-election baseline before making a complete claim about changes since its last election.

The sample excludes counties because they have no billing profiles. It is not an extrapolation to the unsampled 276 profiles. City of London and Isles of Scilly need explicit chamber and source treatment. For either option, snapshot differences trigger verification rather than reconstructed totals. Keep vacancies only where printed, fail closed on a total mismatch, and preserve political groups as groups unless party membership totals are separately published.

**A build would show:** after source approval, dated party totals and explicit vacancies that reconcile, with publisher, table, date, licence and coverage caveat. Option A offers 295 exact profile identities; Option B offers twenty researched sources with suitability limits, not national coverage.

**A build would leave absent:** Isles of Scilly under Option A; unverified, stale, undated or incompatible group records under the chosen Option B rule; inferred control, coalition, majority and every personal name. No previous-year scaling or estimated composition is acceptable.

**Decision required:** choose the third-party compilation or official-council route; decide whether the compilation's Other category and site-wide snapshot date are acceptable, or require per-council effective dates and party detail. For official sources, decide whether a clearly labelled retrieval date can support an undated page, without presenting it as the effective date. Assign maintenance ownership and approve special-authority treatment before implementation. C2 remains held until that decision and the selected source gates are satisfied.

## Verification and handoff

No application, page, component, route, test, package, workflow or rendering data file is changed. The three dry runs remain outside the application data loaders. Node 22.23.4 was first on PATH. The three ignored budget workbooks were restored from the existing local cache only after their hashes matched `data/budget/sources.json`.

`npm run check` reports zero errors and warnings. `npm test` reports 325 passed, 25 skipped and two failures caused by this research scope: the source-catalogue test rejects the new `data/sources` directory, and the held-composition filename test rejects `dry-run-seats.json`. Neither test was altered or evaded. Before any merge, a separately authorised change must distinguish held research from rendering data in these guards, or the requested storage layout must be changed.

`npm run test:text -- docs/DOSSIER-SOURCES-2026-11.md data/sources/dossier-2026-11` was attempted and reports that `test:text` is missing. The repository's existing reorganisation brief also documents that absence. An explicit scan of every changed file checks literal and encoded forbidden dash characters, spaced hyphens and personal-name patterns. It does not substitute a claimed pass for the missing npm command. The final scan covered all 18 changed files. A literal known-name grep against 1,202 names read into memory from the twenty sampled compiler pages returned zero matches; no name list was written. The personal-name/contact pattern scan and punctuation scan were also clear. All fourteen retained source and dry-run file hashes matched the manifest. These automated scans complement the selected-field design and manual review; they are not a general proof of name recognition. No full unredacted source document is committed.

The draft PR must retain these unresolved validation and source limits. It does not authorise merge, deployment, a change to the May to June 2027 reversal, or declaring the January dossier complete.
