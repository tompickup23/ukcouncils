import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { CONTACT_EMAIL, SITE_URL } from "../src/lib/site";

const ROOT = resolve(import.meta.dirname, "..");
const read = (...parts: string[]) => readFileSync(join(ROOT, ...parts), "utf8");
// Built from parts so this file does not carry the characters it looks for.
const DASHES = new RegExp(`[\\u${"2013"}\\u${"2014"}]|${[" ", "-", " "].join("")}`);

describe("contact mailbox", () => {
  it("uses the mailbox the owner chose on 27 November 2026, shared with UK Council Tax", () => {
    expect(CONTACT_EMAIL).toBe("info@ukcouncils.co.uk");
  });

  it("shows the address as a mailto link on /contact/ and links security.txt", () => {
    const source = read("src", "pages", "contact.astro");
    expect(source).toContain("href={`mailto:${CONTACT_EMAIL}`}");
    expect(source).toContain("data-contact-email");
    expect(source).toMatch(/including factual corrections/);
    expect(source).toContain('href="/.well-known/security.txt"');
  });
});

describe("security.txt", () => {
  const text = read("public", ".well-known", "security.txt");
  const field = (name: string) =>
    text.split("\n").filter((line) => line.startsWith(`${name}: `)).map((line) => line.slice(name.length + 2).trim());

  it("has the RFC 9116 fields", () => {
    expect(field("Contact")).toEqual([`mailto:${CONTACT_EMAIL}`]);
    expect(field("Preferred-Languages")).toEqual(["en"]);
    expect(field("Canonical")).toEqual([`${SITE_URL}/.well-known/security.txt`]);
  });

  it("expires once, in the future, no more than a year ahead", () => {
    const expires = field("Expires");
    expect(expires).toHaveLength(1);
    expect(expires[0]).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
    const when = Date.parse(expires[0]);
    expect(when).toBeGreaterThan(Date.now());
    expect(when - Date.now()).toBeLessThanOrEqual(366 * 24 * 60 * 60 * 1000);
  });

  it("carries only known fields and no dash", () => {
    const known = new Set(["Contact", "Expires", "Preferred-Languages", "Canonical"]);
    for (const line of text.split("\n").filter(Boolean)) expect(known.has(line.split(":")[0]), line).toBe(true);
    expect(text).not.toMatch(DASHES);
  });
});
