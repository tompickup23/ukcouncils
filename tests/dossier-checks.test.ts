import {describe, it, expect} from 'vitest';
import {dossierChecks} from '../scripts/lib/dossier-checks.mjs';

const summaryTile = (id: string, value: string) => `<li data-summary-tile="${id}"><strong data-figure>${value}</strong><p data-citation-record="{}">Source: publisher</p><a href="#${id}">Read more</a></li>`;
const universal = `<section data-profile-summary>${summaryTile('council-tax', '£2,000')}${summaryTile('collection', '95%')}</section>`
  + ['about', 'collection', 'tax-summary', 'similar', 'sources'].map(id => `<section id="${id}"></section>`).join('')
  + '<section id="services"><a data-council-service="bins" href="https://example.org/bins">Bins</a></section>';
const page = (content: string, actions = '<a href="/compare/">Compare</a><a href="https://example.org/">Bill</a>') =>
  `<main>${universal}<section id="council-tax"><table></table></section>${content}<nav data-council-actions>${actions}</nav></main>`;
const drawer = '<details data-history-drawer><summary>Read the history table for Burnley</summary><div><table></table></div></details>';

describe('built dossier structure gate', () => {
  it('counts tables in nested closed drawers and the open answer', () => {
    const result = dossierChecks(page(drawer));
    expect(result.failures).toEqual([]);
    expect(result.counts).toEqual({pages: 1, bandAnswers: 1, bandTables: 1, drawerTables: 1, drawers: 1, actions: 1, actionLinks: 2, summaries: 1, services: 1, functions: 0, serviceLinks: 1, budgetSummaries: 0});
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
  it.each(['about', 'collection', 'tax-summary', 'similar', 'sources', 'services'])('refuses a missing universal %s section', id => {
    expect(dossierChecks(page(drawer).replace(`id="${id}"`, 'id="removed"')).failures).toContain(`Council page needs one ${id} section`);
  });
  it('refuses a summary that bypasses citations or loses its first tile', () => {
    expect(dossierChecks(page(drawer).replaceAll('data-citation-record', 'data-unused')).failures).toContain('Summary figure bypasses citation processing');
    expect(dossierChecks(page(drawer).replace('data-summary-tile="council-tax"', 'data-summary-tile="about"')).failures).toContain('Summary must lead with Band D');
  });
  it('checks conditional absences, values and exact links against source expectations', () => {
    const expected = {budget: null, functions: false, links: {bins: 'https://example.org/bins'}};
    expect(dossierChecks(page(drawer), expected).failures).toEqual([]);
    expect(dossierChecks(page(drawer), {...expected, budget: '£1,000'}).failures).toContain('Budget summary presence differs from source');
    expect(dossierChecks(page(drawer), {...expected, functions: true}).failures).toContain('Functions presence differs from source');
    expect(dossierChecks(page(drawer), {...expected, links: {}}).failures).toContain('Service links differ from source');
    const withBudget = page(drawer).replace('</section>', `${summaryTile('budget', '£2,000')}</section><section id="budget"></section>`);
    expect(dossierChecks(withBudget, {...expected, budget: '£1,000'}).failures).toContain('Budget summary value differs from source');
    expect(dossierChecks(withBudget, expected).failures).toContain('Budget summary presence differs from source');
  });

});
