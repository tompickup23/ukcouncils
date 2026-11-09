# Pinned design checker

`design_check.py` is an unchanged copy of `bin/design_check.py` from
`tompickup23/claude-config`, commit
`ab80018a5cae2d0a492d793ee329eda3a9c9aa38` on
`feat/design-check-2026-11`. That commit was not an ancestor of main when
verified on 9 November 2026.

Source: https://github.com/tompickup23/claude-config/blob/ab80018a5cae2d0a492d793ee329eda3a9c9aa38/bin/design_check.py

The source repository is private. Keeping the exact file here lets the normal
repository CI token run it without a credential for another repository.
The workflow checks its SHA-256 before execution. Update the file, revision and
checksum together when a new checker revision is approved.

The checker uses uv script metadata to install Playwright and Pillow. Its own
mode list captures 390 px and 1440 px in light and dark. Output belongs in the
runner temporary directory, outside any Git checkout, as required by the
checker. Findings are review evidence and are not a merge gate.
