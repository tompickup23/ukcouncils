/*
 * Applies a saved theme choice before first paint.
 *
 * A separate file rather than an inline script on purpose. The site's
 * Content-Security-Policy allows script-src 'self' and no 'unsafe-inline', so
 * an inline script would be blocked and the page would flash the system theme
 * before correcting itself. Loaded synchronously from <head>, this runs before
 * the body renders.
 *
 * No stored value means "follow the system", which the CSS handles on its own
 * through prefers-color-scheme, so nothing is written to the document then.
 */
(function () {
  document.documentElement.classList.add("js");
  try {
    var saved = localStorage.getItem("ukcouncils-theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch (err) {
    /* Private windows and blocked site data throw on read. The system theme is
       a correct answer, so there is nothing to recover from. */
  }
})();
