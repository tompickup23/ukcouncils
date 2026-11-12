// The grammar layer under the charts: scales, axes, marks that register themselves with
// the overlap gate, label placement and the annotation primitive.
export { linear, zeroDomain, zeroScale, bands } from "./scale.js";
export { barPath, openBar, polylineObstacles } from "./marks.js";
export { overlaps, firstClear, stackRows, spread } from "./label.js";
export { annotate, measure } from "./annotation.js";
export { zeroLine } from "./axis.js";
export { lockedWidth, spiral, SPIRAL_RADII, placePlates, leaderAnchor, gutterLabels, segmentHitsBox, segmentsCross } from "./plates.js";
