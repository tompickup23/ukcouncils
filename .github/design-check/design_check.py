#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["playwright>=1.50,<2", "pillow>=10,<13"]
# ///
"""Capture changed site templates and report the estate design checks.

Adapted from Reports tools/design_capture.py, design audit of 4 November 2026.
The viewport capture, computed style probe, cached Chromium selection and Pillow
contact sheet keep that tool's approach. No Reports checkout is needed at runtime.
"""
from __future__ import annotations

import argparse
import asyncio
import io
import json
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin, urlsplit

from PIL import Image, ImageDraw, UnidentifiedImageError
from playwright.async_api import async_playwright

CACHE = Path.home() / "Library/Caches/ms-playwright"
MODES = [(390, 844, "light"), (390, 844, "dark"), (1440, 900, "light"), (1440, 900, "dark")]
RULES = {
    "load": "Page loads",
    "header": "Phone header",
    "links": "Link colours",
    "figures": "Figure sources",
    "og": "Social image",
    "favicon": "SVG favicon",
    "touch": "Apple touch icon",
    "overflow": "Phone overflow",
    "height": "Desktop height",
    "lcp": "Lab LCP",
    "cls": "Lab CLS",
    "dashes": "Visible text",
    "h1": "Page heading",
}

# Start before navigation so late observers cannot miss early shifts. CLS uses
# the largest session window, with a one second gap and five second maximum.
PERF_INIT = r"""
(() => {
  const state = {lcp: null, shifts: [], supported: PerformanceObserver.supportedEntryTypes || []};
  window.__designPerf = state;
  if (state.supported.includes('largest-contentful-paint')) {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) state.lcp = e.startTime;
    }).observe({type: 'largest-contentful-paint', buffered: true});
  }
  if (state.supported.includes('layout-shift')) {
    new PerformanceObserver(list => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) state.shifts.push([e.startTime, e.value]);
    }).observe({type: 'layout-shift', buffered: true});
  }
})();
"""
PERF = r"""
() => {
  const s = window.__designPerf;
  let peak = 0, total = 0, start = 0, last = 0;
  for (const [time, value] of s.shifts) {
    if (!last || time-last >= 1000 || time-start >= 5000) {start = time; total = 0;}
    total += value; last = time; peak = Math.max(peak, total);
  }
  return {lcp_ms: s.lcp, cls: s.supported.includes('layout-shift') ? peak : null};
}
"""
PROBE = r"""
() => {
  const visible = el => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(el).visibility !== 'visible') return false;
    for (let parent = el; parent; parent = parent.parentElement) {
      if (parent instanceof HTMLDetailsElement && !parent.open
          && !parent.querySelector(':scope > summary')?.contains(el)) return false;
      const c = getComputedStyle(parent);
      if (c.display === 'none' || Number(c.opacity) === 0) return false;
    }
    return true;
  };
  const text = el => (el?.innerText || '').trim().replace(/\s+/g, ' ');
  const meta = n => document.querySelector(`meta[property="${n}"],meta[name="${n}"]`)?.content || '';
  // Find the smallest shared row of the mark and navigation or menu control.
  // A semantic header can be a utility strip or can wrap a whole hero.
  const main = document.querySelector('main, [role="main"]');
  const beforeMain = el => !main || Boolean(el.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING);
  const identity = brand => Boolean(brand.querySelector('img, svg')
    || /brand|logo|mark/i.test(brand.className)
    || (meta('og:site_name') && text(brand).toLowerCase() === meta('og:site_name').toLowerCase()));
  const homes = [...document.querySelectorAll('a[href]')].filter(a => {
    try {
      const url = new URL(a.href);
      return url.origin === location.origin && url.pathname === '/' && visible(a)
        && !a.closest('main, article, aside, footer') && beforeMain(a)
        && (!a.closest('nav, [role="navigation"]') || identity(a));
    } catch { return false; }
  });
  const controls = [...document.querySelectorAll('nav, [role="navigation"], button[aria-controls], button[aria-expanded], button[aria-label*="menu" i]')]
    .filter(el => visible(el) && !el.closest('main, article, aside, footer') && beforeMain(el));
  const rows = homes.flatMap(brand => {
    for (let row = brand.parentElement; row && row !== document.body; row = row.parentElement) {
      if (controls.some(control => row.contains(control) && !brand.contains(control))) return [{row, brand}];
    }
    return [];
  });
  rows.sort((a, b) => Number(identity(b.brand))-Number(identity(a.brand))
    || a.row.getBoundingClientRect().top-b.row.getBoundingClientRect().top);
  const header = rows[0]?.row;
  const brand = rows[0]?.brand;
  const brandName = text(brand) || brand?.getAttribute('aria-label') || brand?.querySelector('img')?.alt || '';
  const facts = [...document.querySelectorAll('[data-fact]')].filter(visible);
  const figures = [...document.querySelectorAll('[data-figure]')].filter(visible);
  const sourced = fact => [...fact.querySelectorAll('.source-line')].some(s =>
    s.closest('[data-fact]') === fact && text(s) && visible(s));
  // The UK Council Tax rule requires data-fact and source-line. Bind to the
  // nearest fact so a nested component cannot lend a caption to its neighbour.
  const missingFacts = facts.filter(f => !sourced(f)).length;
  const missingFigures = figures.filter(f => {
    const fact = f.parentElement?.closest('[data-fact]');
    return !fact || !sourced(fact);
  }).length;
  const headings = [...document.querySelectorAll('h1')].filter(visible).map(text);
  // A range per text node excludes hidden content without leaking page text
  // into logs or reports. Include SVG text and visible generated content too.
  const strings = [], exemptStrings = [];
  const collect = (el, value) => (el.closest('[data-dash-ok]') ? exemptStrings : strings).push(value);
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode, el = node.parentElement;
    if (!el || el.closest('script,style,noscript,template') || !visible(el)) continue;
    const range = document.createRange(); range.selectNodeContents(node);
    if ([...range.getClientRects()].some(r => r.width && r.height)) collect(el, node.textContent);
  }
  for (const el of [document.body, ...document.body.querySelectorAll('*')]) {
    if (!visible(el)) continue;
    for (const pseudo of ['::before', '::after']) {
      const style = getComputedStyle(el, pseudo), content = style.content;
      if (style.display !== 'none' && style.visibility === 'visible' && Number(style.opacity) !== 0
          && content && content !== 'none' && content !== 'normal') collect(el, content.replace(/^"|"$/g, ''));
    }
  }
  return {
    header_height: header ? header.getBoundingClientRect().height : null,
    blue_links: [...document.querySelectorAll('a[href]')].filter(a =>
      getComputedStyle(a).color === 'rgb(0, 0, 238)').length,
    figures: figures.length, missing_figures: missingFigures, missing_facts: missingFacts,
    og_image: meta('og:image'),
    icons: [...document.querySelectorAll('link[rel]')].filter(l =>
      l.rel.split(/\s+/).some(r => ['icon', 'apple-touch-icon', 'apple-touch-icon-precomposed'].includes(r)))
      .map(l => ({rel: l.rel, href: l.href})),
    overflow_width: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
    viewport_width: innerWidth,
    height: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    headings, site_name: meta('og:site_name') || meta('application-name') || brandName,
    visible_text: strings.join('\n'), exempt_text: exemptStrings.join('\n'),
  };
}
"""

# Facts inside a closed drawer are still checked: after the captures, every
# closed details element is opened, the figure rule is measured again, and the
# drawers are closed. A source hidden even with its drawer open still fails.
OPEN_DRAWERS = r"""() => {
  const closed = [...document.querySelectorAll('details:not([open])')];
  for (const d of closed) { d.open = true; d.setAttribute('data-design-check-opened', ''); }
  return closed.length;
}"""
CLOSE_DRAWERS = r"""() => {
  for (const d of document.querySelectorAll('details[data-design-check-opened]')) {
    d.open = false; d.removeAttribute('data-design-check-opened');
  }
}"""


def merge_drawer_record(rec: dict, opened: dict, drawers: int) -> None:
    # Opening drawers only reveals content, so the opened counts are a superset.
    rec["drawers"] = drawers
    rec["drawer_figures"] = opened["figures"]-rec["figures"]
    for key in ("figures", "missing_figures", "missing_facts"):
        rec[key] = opened[key]


def chrome_path(explicit: str | None) -> str | None:
    if explicit:
        return str(Path(explicit).expanduser().resolve())
    shells = list(CACHE.glob("chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell"))
    shells += list(CACHE.glob("chromium-*/chrome-mac*/Chromium.app/Contents/MacOS/Chromium"))
    def build(p):
        match = re.search(r"(?:shell|chromium)-(\d+)", str(p))
        return int(match[1]) if match else 0
    return str(max(shells, key=build)) if shells else None


# Explicit house rule: word hyphens are permitted, including U+2010 and U+2011.
DASHES = re.compile(r"[\u2012-\u2015\u2e3a\u2e3b\ufe58\ufe63\uff0d]")
SPACED_HYPHENS = re.compile(r"(?<=\S)\s+-\s+(?=\S)")


def dash_evidence(text: str, exempt_text: str = "") -> tuple[bool, str]:
    # Visible page text is not Markdown: backticks and a literal title marker
    # confer no exemption. The DOM walker separates marked verbatim titles.
    unicode_hits = len(DASHES.findall(text))
    spaced_hits = len(SPACED_HYPHENS.findall(text))
    exempt_hits = len(DASHES.findall(exempt_text)) + len(SPACED_HYPHENS.findall(exempt_text))
    total = unicode_hits + spaced_hits
    return not total, (f"dash check {total} findings; Unicode dashes {unicode_hits}; "
                       f"spaced hyphens {spaced_hits}; exempt dashes {exempt_hits}")


def check_record(rec: dict, width: int, cap: int, site_name: str | None) -> dict:
    out = {}
    def add(key, passed, evidence):
        out[key] = {"pass": bool(passed), "evidence": evidence}
    add("load", 200 <= rec["status"] < 400, f"HTTP {rec['status']}")
    if width == 390:
        h = rec["header_height"]
        add("header", h is not None and 0 < h < 72, "header missing" if h is None else f"{h:g} px; limit below 72 px")
        add("overflow", rec["overflow_width"] <= 390, f"document {rec['overflow_width']} px; viewport {width} px")
    else:
        add("height", rec["height"] < cap, f"{rec['height']} px; limit below {cap} px")
    add("links", rec["blue_links"] == 0, f"{rec['blue_links']} links use rgb(0, 0, 238)")
    drawer_note = (f" ({rec['drawer_figures']} inside {rec['drawers']} closed drawers, checked open)"
                   if rec.get("drawers") else "")
    add("figures", not rec["missing_figures"] and not rec["missing_facts"],
        f"{rec['figures']} marked figures{drawer_note}; {rec['missing_figures']} without a local source; {rec['missing_facts']} facts without a visible caption")
    for key in ("og", "favicon", "touch"):
        add(key, *rec[key])
    lcp, cls = rec.get("lcp_ms"), rec.get("cls")
    add("lcp", lcp is not None and 0 < lcp < 2500, "measurement unavailable" if lcp is None else f"{lcp / 1000:.3f} s; limit below 2.5 s")
    add("cls", cls is not None and cls < 0.1, "measurement unavailable" if cls is None else f"{cls:.4f}; limit below 0.1")
    add("dashes", *dash_evidence(rec["visible_text"], rec.get("exempt_text", "")))
    normalise = lambda s: re.sub(r"[\W_]+", "", s).casefold()
    name = site_name or rec["site_name"]
    headings = rec["headings"]
    valid = name and headings and all(h and normalise(h) != normalise(name) for h in headings)
    evidence = ("site name unknown; supply the site name option" if not name else
                "visible H1 missing" if not headings else
                f"{len(headings)} visible H1 elements; {'descriptive' if valid else 'empty or bare site name'}")
    add("h1", valid, evidence)
    return out


async def inspect_asset(ctx, url: str, base: str) -> dict:
    try:
        target = urljoin(base, url)
        parts = urlsplit(target)
        if parts.scheme not in ("http", "https") or parts.username or parts.password:
            return {"error": "unsupported asset address"}
        response = await ctx.request.get(target, timeout=15000)
        if not response.ok:
            return {"error": f"asset HTTP {response.status}"}
        body = await response.body()
        if len(body) > 20_000_000:
            return {"error": "asset exceeds 20 MB inspection limit"}
        try:
            with Image.open(io.BytesIO(body)) as im:
                im.load()
                return {"format": im.format, "width": im.width, "height": im.height}
        except (UnidentifiedImageError, OSError, ValueError):
            root = ET.fromstring(body)
            if root.tag in ("svg", "{http://www.w3.org/2000/svg}svg"):
                return {"format": "SVG"}
    except Exception:
        pass
    return {"error": "asset could not be read as an image"}


async def asset_checks(ctx, rec, base):
    og = await inspect_asset(ctx, rec["og_image"], base) if rec["og_image"] else {"error": "og:image missing"}
    rec["og"] = (og.get("width", 0) >= 1200, og.get("error") or f"decoded width {og.get('width', 0)} px; minimum 1200 px")
    favs, touches = [], []
    for icon in rec["icons"]:
        rels = icon["rel"].split()
        info = await inspect_asset(ctx, icon["href"], base)
        if "icon" in rels:
            favs.append(info)
        if "apple-touch-icon" in rels or "apple-touch-icon-precomposed" in rels:
            touches.append(info)
    rec["favicon"] = (any(i.get("format") == "SVG" for i in favs),
                      f"{sum(i.get('format') == 'SVG' for i in favs)} linked SVG favicons verified")
    good = sum(i.get("format") == "PNG" and i.get("width") == 180 and i.get("height") == 180 for i in touches)
    rec["touch"] = (bool(good), f"{good} linked PNG icons verified at 180 by 180 px")


async def shoot(browser, url, dest, width, height, theme, args):
    ctx = await browser.new_context(viewport={"width": width, "height": height}, color_scheme=theme,
                                    device_scale_factor=1, is_mobile=width == 390, has_touch=width == 390,
                                    service_workers="block")
    page = await ctx.new_page()
    await page.add_init_script(PERF_INIT)
    try:
        stage = "navigation"
        response = await page.goto(url, wait_until="load", timeout=45000)
        await page.wait_for_timeout(args.observe_ms)
        stage = "page measurement"
        rec = await page.evaluate(PROBE)
        rec.update(await page.evaluate(PERF))
        rec["status"] = response.status if response else 0
        # Measure before screenshots or asset requests can alter rendering.
        stage = "screenshot"
        await page.screenshot(path=str(dest.with_suffix(".png")), timeout=20000)
        await page.screenshot(path=str(dest.with_name(dest.name + "_full.jpg")),
                              full_page=True, type="jpeg", quality=55, timeout=20000)
        stage = "drawer measurement"
        drawers = await page.evaluate(OPEN_DRAWERS)
        if drawers:
            merge_drawer_record(rec, await page.evaluate(PROBE), drawers)
            await page.evaluate(CLOSE_DRAWERS)
        await asset_checks(ctx, rec, page.url)
        return check_record(rec, width, args.height_cap, args.site_name)
    except Exception as exc:
        # Browser exception messages can contain credentials or page text.
        return {key: {"pass": False, "evidence": f"{stage} failed with {type(exc).__name__}; measurement unavailable"} for key in RULES}
    finally:
        await ctx.close()


def contact_sheet(shots: Path, count: int) -> Path:
    # Adapted from design_capture.py: labelled Pillow tiles, one row per URL.
    sheet = Image.new("RGB", (2000, count * 580), "white")
    columns = [(0, 260), (260, 260), (520, 740), (1260, 740)]
    draw = ImageDraw.Draw(sheet)
    for i in range(count):
        for j, (w, h, theme) in enumerate(MODES):
            x, tile_width = columns[j]
            label = f"Page {i + 1} {w} {theme}"
            draw.text((x + 8, i * 580 + 8), label, fill="black")
            path = shots / f"page{i + 1}_{w}_{theme}.png"
            if path.exists():
                with Image.open(path) as image:
                    tile = image.convert("RGB")
                    tile.thumbnail((tile_width-16, 540))
                    sheet.paste(tile, (x + 8, i * 580 + 28))
            else:
                draw.text((x + 8, i * 580 + 32), "Capture unavailable", fill="red")
    dest = shots / "contact_sheet.jpg"
    sheet.save(dest, quality=85)
    return dest


def report(results, sheet, args):
    lines = ["## Design check", "", f"Contact sheet: `{sheet}`", "",
             f"Desktop height cap: {args.height_cap} px. Lab observation: {args.observe_ms / 1000:g} s after load.",
             "Each capture uses a fresh Chromium context with no network or CPU throttling.",
             "LCP and CLS describe this lab observation only, not field performance.", ""]
    failures = 0
    for i, modes in enumerate(results, 1):
        lines += [f"### Page {i}", ""]
        for key, label in RULES.items():
            readings = [(mode, checks[key]) for mode, checks in modes.items() if key in checks]
            failed = [(mode, check) for mode, check in readings if not check["pass"]]
            failures += bool(failed)
            # Group equal evidence to keep the PR report short without losing modes.
            groups = {}
            for mode, check in failed or readings:
                groups.setdefault(check["evidence"], []).append(mode)
            evidence = "; ".join(f"{', '.join(names)}: {value}" for value, names in groups.items())
            lines.append(f"* {'FAIL' if failed else 'PASS'} {label}: {evidence}.")
        lines.append("")
    page_word = "page" if len(results) == 1 else "pages"
    lines += [f"Result: {'FAIL' if failures else 'PASS'}. {failures} failed checks across {len(results)} {page_word}.", ""]
    return "\n".join(lines), 1 if failures else 0


def outside_git(path: Path) -> bool:
    return not any((parent / ".git").exists() for parent in (path, *path.parents))


class SafeParser(argparse.ArgumentParser):
    def error(self, message):
        # argparse can echo unknown arguments, which may contain credentials.
        if message.startswith(("unrecognized arguments", "argument ", "ambiguous option")):
            message = "invalid command arguments; see help for the accepted options"
        super().error(message)


def parse_args(argv=None):
    parser = SafeParser(description=__doc__.splitlines()[0])
    parser.add_argument("repo", type=Path, help="site repository path; read only")
    parser.add_argument("--url", action="append", help="page URL; repeat for each changed template")
    parser.add_argument("--preview", help="local preview origin")
    parser.add_argument("--path", action="append", help="page path under the preview; repeat as needed")
    parser.add_argument("--shots", type=Path, default=Path.home() / "Documents/design_checks", help="output parent outside git")
    parser.add_argument("--height-cap", type=int, default=12000)
    parser.add_argument("--site-name", help="site name when metadata or header cannot identify it")
    parser.add_argument("--chrome", help="Chromium executable path")
    parser.add_argument("--observe-ms", type=int, default=4000, help="observation after load; minimum 3000 ms")
    args = parser.parse_args(argv)
    args.repo = args.repo.expanduser().resolve()
    if not args.repo.is_dir() or subprocess.run(["git", "-C", str(args.repo), "rev-parse", "--show-toplevel"], capture_output=True).returncode:
        parser.error("the site path must be a git checkout")
    if args.url and (args.preview or args.path):
        parser.error("choose explicit URLs or a preview with paths")
    if args.url:
        args.urls = args.url
    elif args.preview and args.path:
        base = urlsplit(args.preview)
        if base.hostname not in ("localhost", "127.0.0.1", "::1"):
            parser.error("the preview must use a local loopback address")
        if any(not p.startswith("/") or p.startswith("//") or urlsplit(p).scheme for p in args.path):
            parser.error("preview paths must start with one slash")
        args.urls = [urljoin(args.preview, p) for p in args.path]
        if any(urlsplit(u).netloc != base.netloc for u in args.urls):
            parser.error("preview paths must stay on the preview origin")
    else:
        parser.error("supply URLs or a preview with paths")
    for url in args.urls:
        parsed = urlsplit(url)
        if parsed.scheme not in ("http", "https") or not parsed.hostname or parsed.username or parsed.password:
            parser.error("use HTTP or HTTPS page addresses without credentials")
    if args.height_cap <= 0 or args.observe_ms < 3000:
        parser.error("the height cap must be positive and observation at least 3000 ms")
    args.shots = args.shots.expanduser().resolve()
    if not outside_git(args.shots) or args.shots.is_relative_to(args.repo):
        parser.error("screenshots must be outside every git checkout and the site folder")
    return args


async def run(args):
    args.shots.mkdir(parents=True, exist_ok=True)
    shots = Path(tempfile.mkdtemp(prefix=datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ_"), dir=args.shots))
    results = []
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(executable_path=chrome_path(args.chrome))
        try:
            for i, url in enumerate(args.urls, 1):
                modes = {}
                for width, height, theme in MODES:
                    label = f"{width} {theme}"
                    dest = shots / f"page{i}_{width}_{theme}"
                    modes[label] = await shoot(browser, url, dest, width, height, theme, args)
                results.append(modes)
        finally:
            await browser.close()
    sheet = contact_sheet(shots, len(results))
    markdown, code = report(results, sheet, args)
    (shots / "report.md").write_text(markdown, encoding="utf-8")
    # Only derived evidence is saved. Raw page text and asset URLs are omitted.
    (shots / "results.json").write_text(json.dumps(results, indent=2) + "\n", encoding="utf-8")
    print(markdown)
    return code


def main(argv=None):
    args = parse_args(argv)
    try:
        return asyncio.run(run(args))
    except Exception:
        print("Design check could not complete. Check Chromium and the output folder. No pass was recorded.", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
