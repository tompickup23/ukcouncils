# Composition snapshot | 16 November 2026

The owner selected Open Council Data on 16 November 2026, recorded in UK Council Tax
`docs/DECISIONS-2026-11-16.md`, section 2. This task also authorised the compiler's
control field and two checks. During implementation the owner confirmed: "Hold all
unsupported control labels". This supersedes the composition hold in the earlier
source research only for this pinned snapshot and these admission rules.

The publisher's English Council Compositions 2026 table was retrieved on
16 November 2026. Its original response SHA-256 is
`0b17adb555571dd84424722367f1604e1ce820670d131cac22a03b95f9163c98`.
The separate homepage label is `Last Updated: 15-11-2026`. Neither date is a
certified effective date for each council. Website content uses CC BY-SA 4.0;
the CSV public domain declaration is not applied. Share alike applies to the
composition table only. Original responses were processed in memory and never
written to disk. Only the selected numeric columns, compiler control, publisher
ID and its linked GSS identity and provenance were retained.

## Dry run

| Measure | Count |
|---|---:|
| English table rows | 318 |
| Reconciling table rows | 318 |
| Exact GSS profile joins | 295 of 296 |
| Out of scope rows | 23 |
| Seats admitted | 294 |
| Control admitted | 129 |
| Admitted control corroborated by a quoted council statement | 16 |
| Admitted control with no eligible council statement held | 113 |
| Control held, including both special authorities | 167 |
| Eligible council statements with a different control label | 22 |

The complete per-profile rows, both control checks, class totals, unmatched
identities and out of scope rows are in
`data/elections/composition-review-2026-11-16.json`. The manifest pins that file
and `composition-2026-11-16.json`. The latter preserves all 318 source rows and
their linked identity response hashes. The application admits 294 tables:
City of London is held for chamber review and Isles of Scilly has no row.

## Control checks

The printed heading is `Control`. The complete distinct printed values are
recorded in source metadata. The source has no explicit no overall control
value in this snapshot. It includes minority, mayoral and mixed labels, so
none of these may be converted into no overall control. `IND` cannot be checked
against the publisher's aggregate Other column as if Other named one party.
There are 166 joined profile rows with unsupported labels, including City of
London; the 129 supported single-party rows all pass the strict majority check.
There is no majority-size output. Empty fields never produce control.

UK Elections `origin/main` was read with `git show` at
`df1f340348f76ddb91af448f225167794cc08984`; its `checked_at` is
24 October 2026. No checkout changes or fetch were made there. Exact slug
comparison matches 153 profile slugs; 143 profile slugs and 59 source slugs
are unmatched and listed. Only a control value with a quote and without a
`basis` field qualifies. There are 38 eligible matched statements: 16 agree
and 22 have a different label. All 22 already have unsupported compiler labels
and stay held. No otherwise admitted single-party control is rejected by check 2.

Comparison expands the five supported compiler party abbreviations and otherwise
compares the compiler's label literally with the council statement value. A
`disagrees` outcome for an unsupported label means the labels differ under that
rule, not proof that the underlying political circumstances contradict each
other. Minority control and no overall control may describe different aspects
of the same situation. No interpretation or inferred no overall control is
used to resolve that. The PR lists both labels and their separate dates for
review. Only outcome, slug and commit are copied from the council evidence;
no council statement value, quote or seat count enters this repository.

## Rendering boundary

The table spells out Lab, Con, LD, Grn, Ref, Oth, Vac and Total. Zero is retained
where the publisher prints zero. Other remains the publisher's aggregate.
The source line identifies the table, retrieval date and third-party status;
the table licence and date caveat sit beside it. An admitted control line uses
only the compiler field, with its required scope caveat. Held control has the
requested reason in the profile coverage section. UK Elections is not cited
on the composition section.

No stacked bar is added. The vendored kit's `BillAnatomy` is the existing single
stacked bar, but its reconciliation function requires `gbp` or `pence` and its
labels say charge and share of the bill. Counts do not fit it. No chart type,
unit conversion, derived percentage or vendored edit is introduced.

The loader checks pins, field allowlists, identities, reconciliation and
control eligibility. The build and distribution gates compare rendered table
cells and control text with admitted rows, and reject forbidden fields.
The composition guard has deliberate mutation tests for changed values,
forbidden fields, empty and unsupported control, disagreement and missing rows.

## Refresh

Run with Node 22.23.4 first on PATH, with `UKELECTIONS_ROOT` pointing at the
read-only local UK Elections checkout:

```sh
node scripts/snapshot-composition.mjs --write
```

The command refuses existing same-date snapshot files. It retrieves the table,
every actual linked identity page, the homepage label and reuse statement,
then selects permitted fields before any write. Stop if the control column or
expected coverage changes. Review every difference from the previous snapshot;
a difference triggers review, never a reconstructed total. Update the pinned
snapshot date and file paths in the loader only after that review. Keep the
special-authority and unsupported-control holds unless the owner changes the rule.
Rerun the dry run, full build, distribution, browser, CSP and number checks.
The source snapshot must be committed before any accompanying page work.
