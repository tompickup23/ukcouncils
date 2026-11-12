/**
 * Body names from the data. A chart that names a council, a police body or a precepting
 * authority prints the figure's `name` as recorded from the published document, never a
 * name the site composes ("City of London council" is wrong; the body is the City of
 * London Corporation). The check is opt in: `name` stays optional in the figure record and
 * the charts keep their 0.4.0 fallback to the label unless `requireNames` is set.
 */
import type { FigureSet } from "../figures/figures.js";
/** Problems with the names of the bodies behind these figure keys; empty when every name is held. */
export declare function nameErrors(set: FigureSet, keys: string[]): string[];
/** Throws when any body behind these keys has no published name. */
export declare function checkNames(set: FigureSet, keys: string[], where?: string): void;
