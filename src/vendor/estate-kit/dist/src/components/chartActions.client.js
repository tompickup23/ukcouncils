/** A table's rows as tab separated text, one line per row, cells trimmed. */
export function tableText(table) {
    return [...table.rows].map((r) => [...r.cells].map((c) => (c.textContent ?? "").trim().replace(/\s+/g, " ")).join("\t")).join("\n");
}
export function enhanceChartActions(root, clipboard) {
    for (const a of root.querySelectorAll("[data-ek-open-twin]")) {
        a.addEventListener("click", () => {
            const twin = root.getElementById(a.dataset.ekOpenTwin ?? "");
            if (twin instanceof root.defaultView.HTMLDetailsElement)
                twin.open = true;
        });
    }
    if (!clipboard)
        return;
    for (const btn of root.querySelectorAll("[data-ek-copy-table]")) {
        const twin = root.getElementById(btn.dataset.ekCopyTable ?? "");
        const table = twin?.querySelector("table");
        if (!twin || !table)
            continue;
        btn.hidden = false;
        const status = btn.parentElement?.querySelector(".ek-action-status");
        btn.addEventListener("click", async () => {
            try {
                await clipboard.writeText(tableText(table));
                if (status)
                    status.textContent = "Table copied";
            }
            catch {
                if (twin instanceof root.defaultView.HTMLDetailsElement)
                    twin.open = true;
                if (status)
                    status.textContent = "Copying is blocked here, so the table is open below";
            }
        });
    }
}
