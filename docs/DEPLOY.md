# Deploying ukcouncils.co.uk

The site is a static tree published to the Cloudflare Pages project
`ukcouncils` by direct upload from `.github/workflows/deploy.yml`, on every push
to `main` and on a manual dispatch. No Cloudflare Git integration is involved.

## The repository secret

| secret | what it is |
|---|---|
| `CLOUDFARE_API_TOKEN` | an API token that can publish to Pages in the one account |

The spelling `CLOUDFARE_API_TOKEN`, with no L after the F, is deliberate: it is
the name the secret was saved under on 4 November 2026, and it is kept. The
workflow passes it to wrangler as the `CLOUDFLARE_API_TOKEN` variable.

Add it under GitHub, repository Settings, Secrets and variables, Actions,
New repository secret. The token is never written in this repository; the
account ID is not a secret and appears in the workflow and in `CLAUDE.md`.

### A least permission Pages token

1. Cloudflare dashboard, My Profile, API Tokens, Create Token, Create Custom Token.
2. Name it for what it does, for example `ukcouncils GitHub deploy`.
3. Permissions: one row, Account, Cloudflare Pages, Edit. Nothing else: no zone
   permission, no Workers, no DNS.
4. Account Resources: Include, the account that holds `ukcouncils`. Not all accounts.
5. Client IP filtering: leave empty; GitHub hosted runners have no fixed address.
6. TTL: optional. If set, put the expiry date in the calendar, because an expired
   token fails the publish step (it does not skip it).
7. Create, copy the token once into the `CLOUDFARE_API_TOKEN` secret, and do not
   store it anywhere else.

## What the deploy workflow does

The gates run first, in the same order as `ci.yml`: install, type check, unit
tests, build (with `BUILD_OG=1`, so the share cards are drawn), the dist check,
the browser tests at 375px and desktop, and the production header run. A failed
gate fails the run and nothing is published.

**On `main` with `CLOUDFARE_API_TOKEN` present**, the workflow publishes `dist/` with
`wrangler pages deploy` to the `main` branch of the project, then runs the
IndexNow step below.

**With `CLOUDFARE_API_TOKEN` absent**, the job stops after the gates. The job
summary carries one line naming `CLOUDFARE_API_TOKEN`, the publish step and the
IndexNow step are skipped, and the run ends green. There is no fallback: nothing
is published by any other route. This is the state until the secret is added;
before this change every run from 27 September 2026 failed.

**On any ref other than `refs/heads/main`** (a manual dispatch from another
branch), the job stops after the gates in the same way, with a notice naming the
ref. Such a run never publishes and never submits to IndexNow.

A token that is present but wrong (revoked, expired, or without the Pages
permission) is not a skip: the publish step runs and fails, and the run is red.

## IndexNow

After a publish that succeeded, and only then, the workflow runs
`node scripts/indexnow.mjs --changed`, which tells IndexNow (Bing, Yandex,
Seznam, Naver and others) which URLs changed:

- The URL list is the build's own `dist/sitemap.xml`.
- Each page's `<main>` element is hashed and compared with the hashes from the
  last build that was submitted, kept in the Actions cache. A URL that is new or
  whose hash differs is submitted. An unchanged build submits nothing.
- With no previous hashes (the first run, or the cache entry evicted after seven
  days without use) every sitemap URL is submitted, capped at the IndexNow batch
  limit of 10,000. The sitemap carries no `lastmod`, so there is no newest first
  ordering to apply; sitemap order stands.
- The key file is `public/17787fde6c2884af115e79feb459b7d4.txt`, served at
  `https://ukcouncils.co.uk/17787fde6c2884af115e79feb459b7d4.txt`. The key is
  public by design. The script checks the file is live before it submits.
- A refused submission shows as a warning in the job summary and does not turn
  the deploy red. Its hashes are not saved, so the same URLs are offered on the
  next deploy.
- When the deploy was skipped, IndexNow is skipped too, with a notice.

IndexNow needs no account. Bing Webmaster Tools may need the site added and
verified once before submissions show there; that is a dashboard step, not
something the workflow does.

## By hand from the Mac, until the secret exists

Run the same gates, then publish with your own Cloudflare login. From the repo
root on `main`, up to date:

```bash
npm ci
```

```bash
npm run check
```

```bash
npm test
```

```bash
export BUILD_OG=1
```

```bash
npm run build
```

```bash
npm run test:dist
```

```bash
npx playwright install chromium
```

```bash
npm run test:e2e
```

```bash
npm run test:csp
```

```bash
npx wrangler@4 login
```

```bash
npx wrangler@4 pages deploy dist --project-name ukcouncils --branch main --commit-hash "$(git rev-parse HEAD)"
```

If the login can see more than one account, wrangler asks which; choose the one
that holds `ukcouncils`.

Then, once the deploy is live, tell IndexNow. This submits every URL in the live
sitemap, capped at the batch limit:

```bash
npm run indexnow
```

`node scripts/indexnow.mjs --changed --dist dist --dry-run` lists what the
workflow would submit from a local build, without any network request.

## The data refresh

`.github/workflows/refresh-data.yml` uses no Cloudflare secret and does not
dispatch the deploy. It pushes a `data/refresh-<date>` branch and opens a pull
request with `GITHUB_TOKEN`. The data reaches the site only when a person merges
that request into `main`, and that push runs the deploy workflow above, which
skips or publishes by the same rule.
