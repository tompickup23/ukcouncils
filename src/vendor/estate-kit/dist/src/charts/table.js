/**
 * The table twin: every chart's figures as a plain HTML table with the same caption and
 * source, for screen readers, for readers who distrust the drawing, and for copying.
 */
import { esc } from "./canvas.js";
export function tableTwin(t) {
    const num = t.numeric ?? true;
    const th = t.head.map((h, i) => `<th scope="col"${num && i > 0 ? ' class="ek-num"' : ""}>${esc(h)}</th>`).join("");
    const body = t.rows
        .map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td${num ? ' class="ek-num"' : ""}>${esc(c)}</td>`)).join("")}</tr>`)
        .join("");
    return `<table class="ek-table"><caption>${esc(t.caption)}</caption><thead><tr>${th}</tr></thead><tbody>${body}</tbody><tfoot><tr><td colspan="${t.head.length}">${esc(t.source)}</td></tr></tfoot></table>`;
}
