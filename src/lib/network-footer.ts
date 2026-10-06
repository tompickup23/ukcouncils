/** Optional build-time network manifest. No request runs in the browser. */
async function readNetworkFooter() {
  try {
    const response = await fetch('https://ukstate.co.uk/footer.json', {signal: AbortSignal.timeout(5000)});
    if (!response.ok) return null;
    const data = await response.json() as {method?: string; corrections?: string};
    const allowed = (url: unknown): url is string => typeof url === 'string' && new URL(url).origin === 'https://ukstate.co.uk';
    if (!allowed(data.method) || !allowed(data.corrections)) return null;
    return {method: data.method, corrections: data.corrections};
  } catch { return null; }
}
export const networkFooter = readNetworkFooter();
