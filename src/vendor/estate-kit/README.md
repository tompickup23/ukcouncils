# Estate Kit, vendored

Written by the kit's own `scripts/vendor.mjs` at the tag and commit in `VERSION`. This site takes the `charts` part only: the built library, the Astro components, the fonts and their licences, the figure schema and the figure check. Its tokens come from the estate template rendered into `src/styles/global.css`, and the kit has no UK Councils token block, so the `tokens` part is not taken.

Do not edit anything here. `npm run build` runs `verify-vendor.mjs` first, and it fails on any file that differs from its recorded hash, or any file added or removed. `tests/vendor.test.ts` checks the same in `npm test`.

To move to a new tag, from a separate worktree of estate-kit checked out at that tag, with its dependencies installed:

    node scripts/vendor.mjs <this repository>/src/vendor/estate-kit --parts charts

This README is kept by the command.
