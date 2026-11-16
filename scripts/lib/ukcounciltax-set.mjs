import { createHash } from "node:crypto";

export const SET_MANIFEST_PATH = "data/links/ukcounciltax-set.json";

/** The SHA256 of the eligible list in a fixed form: gss, slug and name, sorted by GSS code. */
export function eligibleDigest(eligible) {
  const rows = [...eligible]
    .map(({ gss, slug, name }) => [gss, slug, name])
    .sort((a, b) => a[0].localeCompare(b[0]));
  return createHash("sha256").update(JSON.stringify(rows)).digest("hex");
}
