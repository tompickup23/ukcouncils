import { describe, expect, it } from "vitest";
import { elections, electionFor, electionSourceLine, electionQuoteIsHeld } from "../src/lib/elections";
import { councilPages } from "../src/lib/paths";
import { verifyPinnedHash } from "../scripts/lib/pinned-json.mjs";
import { ELECTION_HASH, PREDECESSOR_HASH } from "../scripts/import-next-elections.mjs";

const rows = Object.values(elections.councils);
const page = (slug: string) => electionFor(councilPages().find(p => p.council.slug === slug)!.council.gss);
describe("pinned next elections", () => {
  it("rejects changed bytes for both inputs", () => {
    for (const hash of [ELECTION_HASH, PREDECESSOR_HASH]) expect(() => verifyPinnedHash(Buffer.from("changed"), hash, "source")).toThrow("pinned hash differs");
  });
  it("retains 174 records whose quotes state their year", () => {
    expect(rows).toHaveLength(174);
    for (const row of rows) {
      expect(row.quote).toContain(String(row.nextYear));
      expect(row).not.toHaveProperty("notes");
    }
    for (const [year, count] of [[2027, 152], [2028, 8], [2029, 12], [2030, 2]]) expect(rows.filter(r => r.nextYear === year)).toHaveLength(count);
    for (const [pattern, count] of Object.entries({whole: 113, thirds: 57, halves: 4})) expect(rows.filter(r => r.pattern === pattern)).toHaveLength(count);
  });
  it("keeps the anchored dates, patterns and predecessor provenance", () => {
    expect(page("burnley")).toMatchObject({nextYear: 2027, pattern: "thirds", joinedVia: null});
    expect(page("birmingham")).toMatchObject({nextYear: 2030, pattern: "whole", joinedVia: null});
    expect(page("barnsley")).toMatchObject({nextYear: 2027, pattern: "thirds", joinedVia: "E08000016"});
    expect(page("city-of-london")).toMatchObject({nextYear: 2029, dateLabel: "March 2029"});
    expect(rows.filter(r => r.nextYear === 2029 && r.dateLabel === null)).toHaveLength(11);
    expect(page("isles-of-scilly")).toMatchObject({nextYear: 2029, pattern: "whole"});
    for (const slug of ["sheffield", "westminster", "woking"]) expect(page(slug)).toBeNull();
    expect(rows.filter(r => r.joinedVia !== null)).toEqual([page("barnsley")]);
    expect(electionSourceLine(page("burnley")!).attribution).toBe("quoted in the UK Elections council election register, checked 24 October 2026");
  });
  it("holds exactly the seven quotes with reorganisation content", () => {
    const held = councilPages().filter(({council}) => {
      const record = electionFor(council.gss);
      return record && electionQuoteIsHeld(record.quote);
    }).map(({council}) => council.slug).sort();
    expect(held).toEqual(["babergh", "mid-suffolk", "oxford", "south-oxfordshire", "test-valley", "vale-of-white-horse", "worthing"]);
    for (const slug of ["burnley", "birmingham"]) expect(electionQuoteIsHeld(page(slug)!.quote)).toBe(false);
    for (const row of rows) expect(row.quote).not.toMatch(/[\u2013\u2014]|\s-\s|\b(hiding|failing|waste|wasted|wasteful|scandal|shocking|secretive)\b/i);
  });
});
