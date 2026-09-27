import { defineConfig } from "astro/config";

// Everything is pre-rendered. The site is a static tree on Cloudflare Pages, so
// there is no adapter and no server output mode. SITE_URL in src/lib/site.ts is
// the one place the host is written for pages; this copy exists only because
// Astro reads its own config before any module in src/ loads, and
// tests/site.test.ts holds the two equal.
export default defineConfig({
  site: "https://ukcouncils.co.uk",
  build: { format: "directory" },
  vite: {
    // Font files are never inlined. Vite base64s any asset under 4 kB into the
    // stylesheet, the fontsource unicode-range subsets qualify, and the CSP
    // allows fonts from 'self' only, so an inlined face is blocked on the host
    // while dev and preview show it loading.
    build: {
      assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined),
    },
  },
});
