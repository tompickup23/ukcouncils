# Reviewing page numbers

Run this check before opening any PR that touches a page template or data.
Use the Node version in `.nvmrc`. From the branch worktree, run these two
commands. The first fetches main and builds it in a fresh scratch worktree:

```sh
baseline="$(mktemp -d)/ukcouncils-main" &&
git fetch origin &&
git worktree add --detach "$baseline" origin/main &&
(cd "$baseline" && npm ci && env -u BUILD_OG npm run build)
```

The second builds the branch and compares both built trees:

```sh
npm ci && env -u BUILD_OG npm run build &&
node scripts/diff-numbers.mjs "$baseline/dist" dist
```

The script reads every HTML file in either tree. Each differing page has one
tab separated row with its path, status, body tokens only in each build, SVG
tokens only in each build, the affected text location and its allowance status.
Repeated tokens retain their counts. A removed page or an added page is reported
even if it contains no numbers. Exit status 1 means at least one changed, added
or removed page is outside the allowed globs. Status 2 means the comparison
could not run. An empty comparison exits 0.

This is a static HTML text check. It excludes head, script, style and template
contents, comments, attributes, hidden elements and inline display or visibility
rules that hide elements. SVG text and its spans are counted separately from
body text. It does not execute JavaScript, load stylesheets or infer visibility
from CSS classes. Text in closed drawers remains part of the comparison.
Formatting of tokens matters, including thousands separators; non-breaking
spaces become ordinary spaces. Years such as 2026/27 are single tokens.

If a difference was not requested in the brief, stop. Do not adjust the figure
to make the check pass. Establish why it changed and refer it for review with
its source. Do not broaden an allowance to conceal an unexplained difference.
A multiset comparison cannot detect two figures swapping positions on one page,
so read the changed template and its source as well.

For intended changes, repeat `--allow` with a quoted glob, for example
`--allow 'councils/burnley/index.html'`. Globs match paths relative to `dist`,
using forward slashes: `*` matches within a directory and `**` crosses
directories. An optional leading slash is ignored. Allowed differences remain
in the output for review.

On a PR, put one glob per line in the fenced block under `Pages allowed to
differ`. An absent or empty block allows no pages. The number diff job builds
the PR head and main with BUILD_OG unset, uploads its full output, updates one
summary comment and fails for unallowed differences. Editing the PR body reruns
CI so changes to allowances are checked.

The design check job uses paths in the fenced block under `Pages to capture`,
with `/` and `/councils/burnley/` as the defaults. Each path must be local and
start with one slash. It captures 390 px and 1440 px in both themes and uploads
the report and captures. Its separate comment reports findings for the reviewer
to weigh; design findings do not block the PR. Comments can be updated on PRs
from this repository; fork PRs retain their artifacts and job summaries because
their token cannot write PR comments.
