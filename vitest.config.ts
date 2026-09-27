import { defineConfig } from "vitest/config";

// Unit tests only. e2e/ and e2e-csp/ are Playwright specs and run through their
// own configs against a served build.
export default defineConfig({
  test: { include: ["tests/**/*.test.ts"] },
});
