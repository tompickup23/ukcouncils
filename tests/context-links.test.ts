import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {contextLinks} from '../src/lib/context-links';
import {loadRegistry, sisterLinks} from '../src/lib/registry';

describe('contextual links', () => {
  it('publishes only successful identity checks on permitted hosts', () => {
    const audit = JSON.parse(readFileSync('data/links/checks.json', 'utf8')) as {results: {gss: string; site: string; url: string; status: number; verified: boolean}[]};
    for (const council of Object.values(loadRegistry().councils)) {
      for (const [site, link] of Object.entries(contextLinks(council.gss))) {
        const evidence = audit.results.find(r => r.gss === council.gss && r.site === site && r.url === link.url);
        expect(evidence?.status).toBe(200);
        expect(evidence?.verified).toBe(true);
        expect(new URL(link.url).hostname).toMatch(/^(ukplaces|ukelections|ukdemographics|ukschoolholidaydates)\.co\.uk$/);
      }
      expect(sisterLinks(council).some(link => ['aidoge','asylumstats'].includes(link.site))).toBe(false);
    }
    expect(contextLinks('E07000214').ukelections).toBeUndefined();
    expect(contextLinks('E07000117').ukplaces?.url).toBe('https://ukplaces.co.uk/places/burnley/');
  });
});
