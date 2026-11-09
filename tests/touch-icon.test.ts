import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { describe, expect, it } from "vitest";

const png = readFileSync(resolve(process.cwd(), "public/apple-touch-icon.png"));

describe("Apple touch icon", () => {
  it("is a 180 by 180 PNG", () => {
    expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    expect(png.toString("ascii", 12, 16)).toBe("IHDR");
    expect(png.readUInt32BE(16)).toBe(180);
    expect(png.readUInt32BE(20)).toBe(180);
  });

  it("matches the site's own SVG mark", () => {
    // Regenerate after a mark change with node scripts/build-touch-icon.mjs.
    const svg = readFileSync(resolve(process.cwd(), "public/favicon.svg"), "utf8");
    const rendered = new Resvg(svg, { fitTo: { mode: "width", value: 180 } }).render().asPng();
    expect(png.equals(rendered)).toBe(true);
  });
});
