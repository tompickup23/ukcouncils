# UK Councils

## Handoff, 27 September 2026

**State.** Seven stacked pull requests, none merged, CI green on each as it was
checked: #1 scaffold, #2 council tax ingest, #3 registry, #4 council tax pages,
#5 postcode door and static pages, #6 share cards, #7 analytics beacon. Merge in order; each one's
base is the one before. The whole stack builds to 323 pages (296 councils) and
is on a preview at https://phase-1-preview.ukcouncils.pages.dev/ (noindex).

**Phase 0, still open.**
- Zone `ukcouncils.co.uk` exists (id `1eca098af86df9cddbfc9ee0938096d8`),
  nameservers `lennox.ns.cloudflare.com` and `sreeni.ns.cloudflare.com`. The
  one.com change has not been made (Chrome was not connected); Tom approved it.
- The one.com parking records were deleted; the zone is empty. It needs two
  proxied CNAMEs, `@` and `www` to `ukcouncils.pages.dev` (Tom: DNS changes
  were blocked for the agent), and a redirect rule sending `www` to the apex.
- Pages custom domains `ukcouncils.co.uk` and `www` added, pending the zone.
- Web Analytics site created; the beacon is PR #7.
- Not done: the `CLOUDFLARE_API_TOKEN` repository secret (Tom), Google
  Workspace for `info@` (Admin asked for a password), branch protection on
  `validate` (needs GitHub Pro or a public repo, so at launch).

**Next.** Once the secret exists and #1 to #7 are merged, `deploy.yml` ships
main. Then Phase 0 acceptance (domain serving with headers, beacon load), then
Phase 1 acceptance (Search Console sitemap), then Phase 2 (term dates and
elections sections).

**Open question.** The adult social care "element" in MHCLG Tables 8a and 8b
is not printed: the technical notes do not define it and it is not the whole
precept. It stays in the data until its definition is confirmed.

## What it is

One page per UK local authority answering, with the source under every figure:
council tax by band and how much it changed, when the schools break up, who won
the last election, what the council buys. The plan is
`/Users/tompickup/clawd/docs/plans/ukcouncils-plan-2026-09-27.md`; the rules an
agent must follow are in `CLAUDE.md`.

## Running it

Node 22.12 or later (`.nvmrc`).

```bash
npm ci
npm run dev          # http://localhost:4321, no security headers applied
npm test             # unit suite, no type check
npm run check        # type check; grep the "- N errors" line
npm run build        # astro build, then CSP hashes into dist/_headers
npm run test:dist    # the built tree: titles, dashes, sitemap, canonicals, hashes
npm run test:e2e     # 375px and desktop, against astro preview
npm run test:csp     # the production headers, through wrangler pages dev
```

Before every commit: `npm test` and `npm run check`. After any change to a
component `<script>`, a font, an island or `public/_headers`: `npm run build &&
npm run test:csp`.

## Deploying

A push to `main` runs `.github/workflows/deploy.yml`: the same gates as CI, a
build with `BUILD_OG=1`, then `wrangler pages deploy dist --project-name
ukcouncils --branch main`. It needs the `CLOUDFLARE_API_TOKEN` repository
secret. Pull requests run `.github/workflows/ci.yml` and publish nothing.

## Data

Every dataset is written by a script under `scripts/` into committed JSON under
`data/`, with a `generated` stamp and a `source` block. The site reads only that
JSON, from `process.cwd()`. Sources, licences and caveats are listed in the plan,
section 3.
