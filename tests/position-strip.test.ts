import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { stripGeometry } from "../src/lib/position-strip";
import { councilPages } from "../src/lib/paths";
import { profileTax } from "../src/lib/council-profile";
import { collectionFor } from "../src/lib/collection";
const pages = councilPages();
const points = (slug: string, kind = "tax") => {
  const {council, tax} = pages.find(p => p.council.slug === slug)!;
  const peers = profileTax(council, tax)!.points;
  return stripGeometry(kind === "tax" ? peers : peers.map(p => ({...p, value: collectionFor(p.gss)!.rate!})), council.gss);
};
describe("server rendered position strips", () => {
  it("matches the Band D anchors within each MHCLG class", () => {
    const burnley = points("burnley");
    expect(burnley.peers).toHaveLength(164);
    expect(burnley.lowest).toMatchObject({name: "Basingstoke and Deane", value: 2255.21});
    expect(burnley.highest).toMatchObject({name: "Lewes", value: 2756.17});
    const birmingham = points("birmingham");
    expect(birmingham.peers).toHaveLength(36);
    expect(birmingham.lowest).toMatchObject({name: "Dudley", value: 2144.84});
    expect(birmingham.highest).toMatchObject({name: "Gateshead", value: 2715.81});
  });
  it("matches collection anchors and keeps an end marker in the plot", () => {
    const birmingham = points("birmingham", "collection");
    expect(birmingham.lowest).toMatchObject({name: "Liverpool", value: 86.85});
    expect(birmingham.highest).toMatchObject({name: "Stockport", value: 97.25});
    const city = points("city-of-london", "collection");
    expect(city.highest).toMatchObject({name: "City of London", value: 98.09});
    expect(city.current.x).toBe(city.plot.right);
    expect(city.current.labelAnchor).toBe("end");
  });
  it("places endpoints and equal values without changing the figures", () => {
    const fixture = [{gss: "a", name: "A", value: 1.234}, {gss: "b", name: "B", value: 9.876}];
    const g = stripGeometry(fixture, "a");
    expect(g.peers.map(p => p.x)).toEqual([g.plot.left, g.plot.right]);
    expect(g.current.value).toBe(1.234);
    expect(g.current.labelAnchor).toBe("start");
    const equal = stripGeometry(fixture.map(p => ({...p, value: 5})), "b");
    expect(equal.peers.map(p => p.x)).toEqual([320, 320]);
    expect(equal.current.labelAnchor).toBe("middle");
    expect(equal.lowest.name).toBe("A");
    expect(equal.highest.name).toBe("A");
    expect(() => stripGeometry(fixture, "missing")).toThrow();
    expect(() => stripGeometry([{...fixture[0], value: NaN}], "a")).toThrow();
    expect(() => stripGeometry([{...fixture[0], value: Infinity}], "a")).toThrow();
  });
  it("adds no client script or literal colour", () => {
    const component = readFileSync("src/components/PositionStrip.astro", "utf8");
    expect(component).not.toMatch(/<script|client:|#[\da-f]{3,8}\b/i);
    expect(component).toContain('<SourceLine source={source} />');
  });
});
