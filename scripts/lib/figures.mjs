/**
 * The rule that every figure sits directly with its source, as a function
 * scripts/check-dist.mjs runs over every built page and tests/figures.test.ts
 * runs over markup built to fail.
 */
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

/**
 * Walks the elements of a page and reports every data-figure that is not
 * inside a data-fact, and every data-fact that holds no source line. A small
 * tag walker rather than a DOM: the pages are this build's own output, so the
 * markup is regular, and scripts and styles are skipped whole.
 */
export function unsourcedFigures(html) {
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "");
  const stack = [];
  const problems = [];
  let figures = 0;
  for (const match of body.matchAll(/<(\/?)([a-zA-Z][a-zA-Z0-9-]*)([^>]*?)(\/?)>/g)) {
    const [, closing, rawName, attrs, selfClosing] = match;
    const name = rawName.toLowerCase();
    if (closing) {
      while (stack.length) {
        const top = stack.pop();
        if (top.fact && !top.sourced) problems.push("a data-fact with no source line");
        if (top.name === name) break;
      }
      continue;
    }
    const isFact = /\sdata-fact\b/.test(attrs);
    const isSource = /class="[^"]*\bsource-line\b/.test(attrs);
    if (/\sdata-figure\b/.test(attrs)) {
      figures += 1;
      if (!stack.some((el) => el.fact)) problems.push("a data-figure outside any data-fact");
    }
    if (isSource) for (const el of stack) if (el.fact) el.sourced = true;
    if (!VOID.has(name) && !selfClosing) stack.push({ name, fact: isFact, sourced: false });
  }
  return { figures, problems };
}
