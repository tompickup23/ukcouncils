import { describe, expect, it } from "vitest";
import { unsourcedFigures } from "../scripts/lib/figures.mjs";

describe("the source line rule", () => {
  it("passes a figure inside a fact with a source line", () => {
    const html = `<div class="fact" data-fact><span data-figure>£1</span><p class="source-line">Source</p></div>`;
    expect(unsourcedFigures(html)).toEqual({ figures: 1, problems: [] });
  });

  it("fails a figure outside any fact", () => {
    const html = `<p><span data-figure>£1</span></p><p class="source-line">Source</p>`;
    expect(unsourcedFigures(html).problems).toContain("a data-figure outside any data-fact");
  });

  it("fails a fact with no source line", () => {
    const html = `<div class="fact" data-fact><span data-figure>£1</span></div>`;
    expect(unsourcedFigures(html).problems).toContain("a data-fact with no source line");
  });

  it("does not credit one fact with another fact's source line", () => {
    const html = `<div data-fact><span data-figure>£1</span></div>`
      + `<div data-fact><span data-figure>£2</span><p class="source-line">Source</p></div>`;
    expect(unsourcedFigures(html).problems).toEqual(["a data-fact with no source line"]);
  });

  it("reads a table of figures under one source line", () => {
    const html = `<div data-fact><table><tbody><tr><td data-figure>£1</td></tr><tr><td data-figure>£2</td></tr>`
      + `</tbody></table><p class="source-line">Source</p></div>`;
    expect(unsourcedFigures(html)).toEqual({ figures: 2, problems: [] });
  });

  it("ignores markup inside scripts and styles", () => {
    const html = `<script type="application/ld+json">{"x":"<span data-figure>"}</script><style>.a{}</style>`;
    expect(unsourcedFigures(html)).toEqual({ figures: 0, problems: [] });
  });
});
