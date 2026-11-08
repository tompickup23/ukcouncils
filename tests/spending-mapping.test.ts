import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { mapBodyKeys } from "../scripts/fetch-spending-summaries.mjs";

const body = {
  id: "testborough",
  url: "https://aidoge.co.uk/councils/testborough/",
  generated: "2026-10-19",
  thresholdGbp: 500,
  bank: true,
  years: { "2025/26": { monthsHeld: 12, records: 2 } },
  headline: { year: "2025/26", records: 2, totalNet: 1500 },
};
const council = {
  gss: "E07000001",
  slug: "differentlocalname",
  name: "Test Borough",
  sisters: { aidoge: body.url },
};
const registry = { councils: { [council.gss]: council } };
const paths: string[] = [];
const script = resolve("scripts/fetch-spending-summaries.mjs");

afterEach(() => {
  for (const path of paths.splice(0)) rmSync(path, { recursive: true, force: true });
});

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "spendingmapping"));
  paths.push(root);
  function write(path: string, data: unknown) {
    const fullPath = join(root, path);
    mkdirSync(resolve(fullPath, ".."), { recursive: true });
    writeFileSync(fullPath, `${JSON.stringify(data, null, 2)}\n`);
  }
  write("data/registry/councils.json", registry);
  return { root, write };
}

describe("spending body keys", () => {
  it("adds the registry GSS key to an id keyed summary without altering its data", () => {
    const input = { [body.id]: body };
    const result = mapBodyKeys(input, registry);
    expect(result.bodies).toEqual({ [body.id]: body, [council.gss]: body });
    expect(input).toEqual({ [body.id]: body });
    expect(result.mapping).toEqual({ source: "data/registry/councils.json", mapped: 1, unmapped: [] });
    expect(result.bodies).not.toHaveProperty(council.slug);
  });

  it("adds the URL id to an existing GSS entry and is stable on a second pass", () => {
    const result = mapBodyKeys({ [council.gss]: body }, registry);
    expect(result.bodies).toEqual({ [body.id]: body, [council.gss]: body });
    expect(mapBodyKeys(result.bodies, registry)).toEqual(result);
  });

  it("reads the URL pathname with or without a trailing slash and ignores query and fragment", () => {
    for (const url of [body.url.slice(0, -1), `${body.url}?view=summary#transactions`]) {
      const result = mapBodyKeys({ [body.id]: body }, {
        councils: { [council.gss]: { ...council, sisters: { aidoge: url } } },
      });
      expect(result.bodies[council.gss]).toEqual(body);
    }
  });

  it("retains and reports unknown bodies without guessing from names or other fields", () => {
    const unknown = { ...body, id: council.slug, name: council.name, gss: council.gss };
    const result = mapBodyKeys({ [unknown.id]: unknown }, registry);
    expect(result.bodies).toEqual({ [unknown.id]: unknown });
    expect(result.mapping).toEqual({
      source: "data/registry/councils.json",
      mapped: 0,
      unmapped: [{ id: unknown.id, reason: "No matching AI DOGE URL id in the council registry" }],
    });
  });

  it("does not map a registry entry without an AI DOGE link", () => {
    const result = mapBodyKeys({ [body.id]: body }, {
      councils: { [council.gss]: { ...council, sisters: { aidoge: null } } },
    });
    expect(result.bodies).toEqual({ [body.id]: body });
    expect(result.mapping.unmapped).toHaveLength(1);
  });

  it("refuses ambiguous registry ids", () => {
    expect(() => mapBodyKeys({ [body.id]: body }, {
      councils: { ...registry.councils, E07000002: { ...council, gss: "E07000002" } },
    })).toThrow("Ambiguous registry mapping");
  });

  it("refuses missing or inconsistent registry GSS codes", () => {
    for (const gss of [undefined, "invalid", "E07000002"]) {
      expect(() => mapBodyKeys({ [body.id]: body }, {
        councils: { [council.gss]: { ...council, gss } },
      })).toThrow("Invalid registry GSS code");
    }
  });

  it("refuses to overwrite different bodies or disagreeing aliases", () => {
    expect(() => mapBodyKeys({ [body.id]: body, [council.gss]: { ...body, id: "another" } }, registry))
      .toThrow("Conflicting summary");
    expect(() => mapBodyKeys({ [body.id]: body, [council.gss]: { ...body, headline: null } }, registry))
      .toThrow("Conflicting summaries");
  });
});

describe("spending mapping commands", () => {
  it("maps the committed snapshot without refreshing dates, figures or council counts", () => {
    const { root, write } = workspace();
    const unknown = { ...body, id: "unlisted" };
    const original = {
      generated: "2026-10-19",
      source: { publisher: "AI DOGE", summaries: { generated: "2026-10-18" } },
      counts: { held: 2, headline: 2, bank: 2 },
      bodies: { [body.id]: body, unlisted: unknown },
    };
    write("data/spending/aidoge-summaries.json", original);
    const log = execFileSync(process.execPath, [script, "--map-only"], { cwd: root, encoding: "utf8" });
    const path = join(root, "data/spending/aidoge-summaries.json");
    const first = readFileSync(path, "utf8");
    const output = JSON.parse(first);
    expect(output.generated).toBe(original.generated);
    expect(output.source.summaries).toEqual(original.source.summaries);
    expect(output.counts).toEqual(original.counts);
    expect(output.bodies).toEqual({ ...original.bodies, [council.gss]: body });
    expect(output.mapping.unmapped.map((entry: { id: string }) => entry.id)).toEqual(["unlisted"]);
    expect(log).toContain("unmapped unlisted:");
    expect(log).toContain("1 bodies mapped, 1 bodies unmapped");
    execFileSync(process.execPath, [script, "--map-only"], { cwd: root });
    expect(readFileSync(path, "utf8")).toBe(first);
  });

  it("writes both keys during a cached fetch and counts each council once", () => {
    const { root, write } = workspace();
    write(".cache/aidoge-summaries/summaries__index.json", { councils: [{ id: body.id }] });
    write(".cache/aidoge-summaries/banks.json", { councils: [body.id] });
    write(`.cache/aidoge-summaries/summaries__${body.id}.json`, {
      id: body.id,
      generated: body.generated,
      coverage: { threshold_gbp: 500, years: { "2025/26": { months_held: 12, records: 2 } } },
      headline: { latest_fy: "2025/26", record_count: 2, total_spend_net: 1500 },
    });
    execFileSync(process.execPath, [script, "--offline"], { cwd: root });
    const output = JSON.parse(readFileSync(join(root, "data/spending/aidoge-summaries.json"), "utf8"));
    expect(output.bodies).toEqual({ [body.id]: body, [council.gss]: body });
    expect(output.counts).toEqual({ mapped: 1, held: 1, headline: 1, bank: 1 });
    expect(output.mapping.mapped).toBe(1);
    expect(output.mapping.unmapped).toEqual([]);
  });
});
