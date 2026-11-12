/**
 * The one script enhancement of ChartActions: "Copy table" copies the chart's table twin as
 * tab separated text, and "Table" opens the twin it points at. Without script the button
 * stays hidden and the link still lands on the twin's summary. Exported for the test, and
 * run by ChartActions.astro on load.
 */
interface Clip { writeText(text: string): Promise<void> }

/** A table's rows as tab separated text, one line per row, cells trimmed. */
export function tableText(table: HTMLTableElement): string {
  return [...table.rows].map((r) => [...r.cells].map((c) => (c.textContent ?? "").trim().replace(/\s+/g, " ")).join("\t")).join("\n");
}

export function enhanceChartActions(root: Document, clipboard: Clip | undefined): void {
  for (const a of root.querySelectorAll<HTMLAnchorElement>("[data-ek-open-twin]")) {
    a.addEventListener("click", () => {
      const twin = root.getElementById(a.dataset.ekOpenTwin ?? "");
      if (twin instanceof root.defaultView!.HTMLDetailsElement) twin.open = true;
    });
  }
  if (!clipboard) return;
  for (const btn of root.querySelectorAll<HTMLButtonElement>("[data-ek-copy-table]")) {
    const twin = root.getElementById(btn.dataset.ekCopyTable ?? "");
    const table = twin?.querySelector("table");
    if (!twin || !table) continue;
    btn.hidden = false;
    const status = btn.parentElement?.querySelector(".ek-action-status");
    btn.addEventListener("click", async () => {
      try {
        await clipboard.writeText(tableText(table));
        if (status) status.textContent = "Table copied";
      } catch {
        if (twin instanceof root.defaultView!.HTMLDetailsElement) twin.open = true;
        if (status) status.textContent = "Copying is blocked here, so the table is open below";
      }
    });
  }
}
