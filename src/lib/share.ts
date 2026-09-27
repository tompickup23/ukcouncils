/** Explicit canonical state only. Never share arbitrary URL parameters. */
export async function shareView(url: string, title: string, status: HTMLElement, fallback: HTMLInputElement) {
  fallback.hidden = true; status.textContent = '';
  try {
    if (navigator.share) {await navigator.share({url, title}); status.textContent = 'Shared.'; return;}
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {status.textContent = 'Sharing cancelled.'; return;}
  }
  try {await navigator.clipboard.writeText(url); status.textContent = 'Link copied.';}
  catch {fallback.value = url; fallback.hidden = false; fallback.focus(); fallback.select(); status.textContent = 'Select and copy this link to share the same view.';}
}
