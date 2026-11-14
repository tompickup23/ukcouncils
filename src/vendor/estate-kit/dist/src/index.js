// The Estate Kit. Tokens, the figure record, the charts and the output templates.
export * from "./figures/figures.js";
export { tokens, palette, partyColour, partyKey, partyName, SITE_KEYS, VERSION } from "../generated/tokens.js";
export { printSheet, PRINT_KEYS } from "../generated/tokens.js";
export { skin, skinPalette, deskPalette, SKIN_KEYS, DESK_KEYS } from "../generated/tokens.js";
export { gatePalettes, hexPalette } from "./charts/canvas.js";
export { zeroBar } from "./charts/zeroBar.js";
export { line } from "./charts/line.js";
export { waffle, squaresFor, squareClass, WAFFLE_PAINTS, WAFFLE_MAX_PARTS } from "./charts/waffle.js";
export { billAnatomy } from "./charts/billAnatomy.js";
export { positionStrip, percentile, stripStats, SCALE_LABELS, MIN_CLASS } from "./charts/positionStrip.js";
export { hemicycle } from "./charts/hemicycle.js";
export { locatorMap, rampFor } from "./charts/locatorMap.js";
export { statTile, statTileParts, scoreCard } from "./charts/statTile.js";
export { fillSlots } from "./charts/frame.js";
export { TEMPLATES, TEMPLATE_KEYS, CARD_KEYS } from "./output/templates.js";
export { hasMark, markSvg } from "./output/marks.js";
export { chartActionsHtml, chartPngNames } from "./output/actions.js";
// The card package renders PNG through resvg, so it is its own entry: @tompickup23/estate-kit/card.
export { assertGates, gateErrors, DASHES } from "./qa/gates.js";
export { contrast, seenDistance, VISIONS } from "./qa/colour.js";
export { linkedSource, shortSourceText, shortSourceHtml, sourceEntryHtml, sourceLinesHtml } from "./figures/sources.js";
export { checkSources, sourceErrors } from "./qa/sources.js";
export { checkNames, nameErrors } from "./qa/names.js";
export { summaryRowTiles, summaryRowHtml } from "./charts/summaryRow.js";
export { linear, zeroDomain, zeroScale, bands, barPath, openBar, polylineObstacles, overlaps, firstClear, stackRows, spread, annotate, measure, zeroLine } from "./charts/grammar/index.js";
export { rankedBars } from "./charts/rankedBars.js";
export { areaMap } from "./charts/areaMap.js";
export { defineMapIndicators, mapClass, colourFor } from "./charts/mapIndicators.js";
