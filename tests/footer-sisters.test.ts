import { describe, expect, it } from "vitest";
import { FOOTER_SISTERS } from "../src/lib/site";

describe("footer sister sites", () => {
  it("keeps the four sisters in order and adds UK Council Tax after UK Elections", () => {
    expect(FOOTER_SISTERS).toHaveLength(5);
    expect(FOOTER_SISTERS.map(site => site.name)).toEqual([
      "UK Elections", "UK Council Tax", "UK Demographics", "UK School Holiday Dates", "AI DOGE",
    ]);
    expect(FOOTER_SISTERS.find(site => site.name === "UK Council Tax")?.url).toBe("https://ukcounciltax.co.uk/");
  });
});
