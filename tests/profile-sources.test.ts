import { describe, expect, it } from "vitest";
import { councilPages } from "../src/lib/paths";
import { profileSources } from "../src/lib/council-profile";
import { populationFor, populationSource } from "../src/lib/population";
import { ownPagesFor, localLinksSource } from "../src/lib/local-links";
import { electionFor } from "../src/lib/elections";
import { collectionSource } from "../src/lib/collection";
describe("profile source coverage", () => {
  it("adds each new citation only when its content appears and in page order", () => {
    for (const {council, tax} of councilPages()) {
      const refs = profileSources(council, tax);
      const urls = refs.map(r => r.url);
      expect(urls.includes(populationSource().url)).toBe(populationFor(council.gss) !== null);
      expect(urls.includes(localLinksSource().url)).toBe(ownPagesFor(council.gss) !== null);
      const expected = [populationFor(council.gss) !== null ? populationSource().url : null,
        ownPagesFor(council.gss) ? localLinksSource().url : null, collectionSource().url,
        electionFor(council.gss)?.sourceUrl].filter((url): url is string => Boolean(url));
      const positions = expected.map(url => urls.indexOf(url));
      expect(positions.every((p, i) => p >= 0 && (i === 0 || p > positions[i - 1])), council.slug).toBe(true);
      expect(new Set(refs.map(r => `${r.url}|${r.table ?? ''}`)).size).toBe(refs.length);
    }
  });
});
