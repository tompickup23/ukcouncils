import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';

const has = (node, key) => Object.hasOwn(node.attributes ?? {}, key);
const text = node => node.type === TEXT_NODE ? node.value : (node.children ?? []).map(text).join(' ');

/** Inspect static HTML, including closed drawers, after the build in CI. */
export function dossierChecks(html) {
  const failures = [];
  const counts = {pages: 1, bandAnswers: 0, bandTables: 0, drawerTables: 0, drawers: 0, actions: 0, actionLinks: 0};
  const elements = [];
  walkSync(parse(html), node => { if (node.type === ELEMENT_NODE) elements.push(node); });
  const inside = (node, predicate) => {
    for (let parent = node.parent; parent; parent = parent.parent) if (predicate(parent)) return true;
    return false;
  };
  const main = elements.filter(node => inside(node, parent => parent.name === 'main'));
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
