import { type ChartOptions, type ChartOutput } from "./frame.js";
import { type FigureSet } from "../figures/figures.js";
export interface StatTileOptions extends ChartOptions {
    /** A value figure key. */
    figure: string;
    /** The label above the number. Defaults to the figure's label. */
    label?: string;
    /** The perspective clause, with figure slots: "about {key} for each household". */
    perspective?: string;
    /** Why a money figure carries no perspective clause. Required when there is none. */
    perspectiveWaived?: string;
}
export interface StatTileParts {
    label: string;
    value: string;
    perspective?: string;
    caption: string;
    captionHtml: string;
    /** Every figure key the tile shows, for the caption. */
    keys: string[];
}
/** The checked strings of a tile. Throws if a money figure has no perspective and no stated reason. */
export declare function statTileParts(o: StatTileOptions, set?: FigureSet, hasSlot?: boolean): StatTileParts;
export declare function statTile(o: StatTileOptions): ChartOutput;
/**
 * ScoreCard: the score card variant of the stat tile, for the UK Council Tax budget game's
 * summary and its share image. A label, the total in the display face with what it is out
 * of, then one row per round: its name, a bar from zero to its score on a track that runs
 * to the round's maximum, and the score. A round the player skipped draws its track empty
 * and says so, and the total counts only the rounds played. Scores are figures like any
 * other, taken by key with a source, so the card says what the answers were checked
 * against.
 */
export interface ScoreCardRow {
    /** The round's name. */
    label: string;
    /** A count figure holding the score, from 0 to max. Leave out for a skipped round. */
    figure?: string;
}
export interface ScoreCardOptions extends ChartOptions {
    /** The line above the total, for example "Your score, Burnley budget game". */
    label: string;
    rows: ScoreCardRow[];
    /** The top of every round's scale. Defaults to 100. */
    max?: number;
}
export declare function scoreCard(o: ScoreCardOptions): ChartOutput;
