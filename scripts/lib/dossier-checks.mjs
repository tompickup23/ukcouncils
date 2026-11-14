import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';

const has = (node, key) => Object.hasOwn(node.attributes ?? {}, key);
const text = node => node.type === TEXT_NODE ? node.value : (node.children ?? []).map(text).join(' ');

/** Inspect static HTML, including closed drawers, after the build in CI. */
export function dossierChecks(html, expected) {
  const failures = [];
  const counts = {pages: 1, bandAnswers: 0, bandTables: 0, drawerTables: 0, drawers: 0, actions: 0, actionLinks: 0, summaries: 0, services: 0, functions: 0, serviceLinks: 0, budgetSummaries: 0};
  const elements = [];
  walkSync(parse(html), node => { if (node.type === ELEMENT_NODE) elements.push(node); });
  const inside = (node, predicate) => {
    for (let parent = node.parent; parent; parent = parent.parent) if (predicate(parent)) return true;
    return false;
  };
  const main = elements.filter(node => inside(node, parent => parent.name === 'main'));
  const descendants = node => main.filter(child => inside(child, parent => parent === node));
  const withAttribute = key => main.filter(node => has(node, key));
  const sections = id => main.filter(node => node.name === 'section' && node.attributes.id === id);
  for (const id of ['about', 'collection', 'tax-summary', 'similar', 'sources', 'services']) {
    if (sections(id).length !== 1) failures.push(`Council page needs one ${id} section`);
  }
  const summary = withAttribute('data-profile-summary');
  counts.summaries = summary.length;
  if (summary.length !== 1) failures.push('Council page needs one summary row');
  const tiles = withAttribute('data-summary-tile');
  if (tiles[0]?.attributes['data-summary-tile'] !== 'council-tax') failures.push('Summary must lead with Band D');
  for (const id of ['council-tax', 'collection']) {
    if (tiles.filter(node => node.attributes['data-summary-tile'] === id).length !== 1) failures.push(`Missing universal summary tile ${id}`);
  }
  for (const tile of tiles) {
    const children = descendants(tile);
    if (children.some(node => has(node, 'data-figure')) && !children.some(node => has(node, 'data-citation-record'))) failures.push('Summary figure bypasses citation processing');
    const id = tile.attributes['data-summary-tile'];
    if (sections(id).length !== 1 || !children.some(node => node.attributes.href === `#${id}`)) failures.push(`Summary target missing ${id}`);
    if (summary.length === 1 && !inside(tile, parent => parent === summary[0])) failures.push('Summary tile outside summary row');
  }
  counts.services = sections('services').length;
  counts.functions = withAttribute('data-council-functions').length;
  const serviceLinks = withAttribute('data-council-service');
  counts.serviceLinks = serviceLinks.length;
  for (const section of sections('services')) {
    if (!descendants(section).some(node => has(node, 'data-council-functions') || has(node, 'data-council-service'))) failures.push('Empty services section');
  }
  const budgetTiles = tiles.filter(node => node.attributes['data-summary-tile'] === 'budget');
  counts.budgetSummaries = budgetTiles.length;
  if (expected) {
    if (budgetTiles.length !== Number(expected.budget !== null)) failures.push('Budget summary presence differs from source');
    if (expected.budget !== null && budgetTiles.length === 1) {
      const figures = descendants(budgetTiles[0]).filter(node => has(node, 'data-figure'));
      if (figures.length !== 1 || text(figures[0]).trim() !== expected.budget) failures.push('Budget summary value differs from source');
    }
    if (counts.functions !== Number(expected.functions)) failures.push('Functions presence differs from source');
    const foundLinks = serviceLinks.map(node => [node.attributes['data-council-service'], node.attributes.href.replace(/&amp;/g, '&')]).sort();
    if (JSON.stringify(foundLinks) !== JSON.stringify(Object.entries(expected.links).sort())) failures.push('Service links differ from source');
  }
  for (const node of main) {
    if (node.attributes?.id === 'council-tax') {
      counts.bandAnswers++;
      if (inside(node, parent => parent.name === 'details')) failures.push('Band answer is inside a drawer');
    }
    if (node.name === 'table') {
      if (inside(node, parent => parent.attributes?.id === 'council-tax')) {
        counts.bandTables++;
        if (inside(node, parent => parent.name === 'details' && !has(parent, 'open'))) failures.push('Band answer table is collapsed');
      } else {
        counts.drawerTables++;
        if (!inside(node, parent => parent.name === 'details')) failures.push('Table outside the band answer has no drawer');
      }
    }
    if (node.name === 'details') {
      counts.drawers++;
      if (has(node, 'open')) failures.push('Dossier drawer is open in static HTML');
      if (!Object.keys(node.attributes).some(key => /^data-.+-drawer$/.test(key))) failures.push('Drawer has no data attribute');
      const summaries = node.children.filter(child => child.name === 'summary');
      if (summaries.length !== 1 || !text(summaries[0]).replace(/&nbsp;|&#160;/g, ' ').trim()) failures.push('Drawer needs one non empty summary');
    }
    if (has(node, 'data-council-actions')) {
      counts.actions++;
      const links = main.filter(child => child.name === 'a' && has(child, 'href') && inside(child, parent => parent === node));
      counts.actionLinks += links.length;
      if (links.length < 2 || links.length > 3) failures.push('Council actions must contain two or three links');
      if (main.some(child => child.name === 'button' && inside(child, parent => parent === node))) failures.push('Council actions contain an extra button');
    }
  }
  if (counts.actions !== 1) failures.push('Council page needs one actions block');
  if (counts.bandAnswers !== 1) failures.push('Council page needs one open band answer');
  return {failures, counts};
}
