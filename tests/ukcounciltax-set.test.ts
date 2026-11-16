import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { eligibleDigest } from "../scripts/lib/ukcounciltax-set.mjs";
import { councilPages } from "../src/lib/paths";
import { loadSetManifest, setLinks } from "../src/lib/ukcounciltax-set";

const manifest = loadSetManifest();

describe("UK Council Tax set eligibility copy", () => {
  it("matches its own pinned digest, so a hand edit fails", () => {
    expect(eligibleDigest(manifest.eligible)).toBe(manifest.eligibleSha256);
  });

  it("lists each council once, every one with a page on this site", () => {
    const gss = manifest.eligible.map((row) => row.gss);
    expect(new Set(gss).size).toBe(gss.length);
    const pages = new Set(councilPages().map(({ council }) => council.gss));
    for (const code of gss) expect(pages.has(code)).toBe(true);
    expect(manifest.verifiedLive.setPagesListed).toBe(gss.length);
  });

  it("links only to self canonical UK Council Tax set pages", () => {
    const links = setLinks(manifest);
    expect(links).toHaveLength(manifest.eligible.length);
    for (const link of links) expect(link.href).toMatch(/^https:\/\/ukcounciltax\.co\.uk\/tools\/budget\/[a-z0-9-]+\/set\/$/);
    expect(manifest.hub).toBe("https://ukcounciltax.co.uk/tools/budget/");
  });

  // Drift against UK Council Tax itself. CI has no UK Council Tax checkout, so
  // the comparison runs where one exists; scripts/copy-ukcounciltax-set.mjs
  // --check adds the live sitemap.
  const repo = process.env.UKCT_DIR ?? join(homedir(), "ukcounciltax");
  const hasRepo = existsSync(join(repo, ".git"));
  it.skipIf(!hasRepo)("has not drifted from UK Council Tax origin/main", () => {
    try { execFileSync("git", ["-C", repo, "fetch", "-q", "origin"], { stdio: "ignore", timeout: 20000 }); } catch { /* offline: compare with the local ref */ }
    const raw = execFileSync("git", ["-C", repo, "show", `origin/main:${manifest.copiedFrom.path}`], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
    const sha = createHash("sha256").update(raw).digest("hex");
    const eligible = (JSON.parse(raw).councils as { gss: string; slug: string; name: string; eligible: boolean }[]).filter((row) => row.eligible === true);
    expect(eligibleDigest(eligible), "eligible list changed on UK Council Tax; rerun scripts/copy-ukcounciltax-set.mjs").toBe(manifest.eligibleSha256);
    expect(sha, "source file changed on UK Council Tax; rerun scripts/copy-ukcounciltax-set.mjs and review").toBe(manifest.copiedFrom.sha256);
  }, 30000);
});
