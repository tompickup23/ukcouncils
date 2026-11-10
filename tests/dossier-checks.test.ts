import {describe, it, expect} from 'vitest';
import {dossierChecks} from '../scripts/lib/dossier-checks.mjs';

const page = (content: string, actions = '<a href="/compare/">Compare</a><a href="https://example.org/">Bill</a>') =>
  `<main><section id="council-tax"><table></table></section>${content}<nav data-council-actions>${actions}</nav></main>`;
const drawer = '<details data-history-drawer><summary>Read the history table for Burnley</summary><div><table></table></div></details>';

describe('built dossier structure gate', () => {
  it('counts tables in nested closed drawers and the open answer', () => {
    const result = dossierChecks(page(drawer));
    expect(result.failures).toEqual([]);
    expect(result.counts).toEqual({pages: 1, bandAnswers: 1, bandTables: 1, drawerTables: 1, drawers: 1, actions: 1, actionLinks: 2});
  });
  it('refuses an exposed table even when an adjacent drawer exists', () => {
    expect(dossierChecks(page(`${drawer}<table></table>`)).failures).toContain('Table outside the band answer has no drawer');
  });
  it.each([
    [drawer.replace('<details ', '<details open '), 'Dossier drawer is open in static HTML'],
    [drawer.replace('data-history-drawer', 'class="drawer"'), 'Drawer has no data attribute'],
    [drawer.replace('Read the history table for Burnley', ' &nbsp; '), 'Drawer needs one non empty summary'],
    [drawer.replace('<summary>Read the history table for Burnley</summary>', '<div><summary>Nested</summary></div>'), 'Drawer needs one non empty summary'],
  ])('rejects an invalid drawer', (markup, failure) => {
    expect(dossierChecks(page(markup)).failures).toContain(failure);
  });
  it('refuses extra actions, missing actions and a collapsed answer', () => {
    expect(dossierChecks(page(drawer, '<a href="/">Link</a>'.repeat(4))).failures).toContain('Council actions must contain two or three links');
    expect(dossierChecks('<main></main>').failures).toContain('Council page needs one actions block');
    expect(dossierChecks(page(drawer).replace('<table></table>', '<details><summary>Bands</summary><table></table></details>')).failures).toContain('Band answer table is collapsed');
  });
});
