import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {parse, walkSync, TEXT_NODE} from 'ultrahtml';

// Text in main, with scripts and styles removed. Closed drawers contribute
// their summaries only. Tables and Source: occurrences count all static HTML.
function words(node, outsideDrawers = false) {
  if (['script', 'style'].includes(node.name)) return '';
  if (node.type === TEXT_NODE) return node.value;
  let children = node.children ?? [];
  if (outsideDrawers && node.name === 'details' && !Object.hasOwn(node.attributes, 'open')) {
    children = children.filter(child => child.name === 'summary');
  }
  return children.map(child => words(child, outsideDrawers)).join(' ');
}

const roots = process.argv.slice(2);
if (roots.length !== 2) throw new Error('Pass the baseline and candidate build directories.');
const report = {};
for (const slug of ['burnley', 'birmingham']) {
  report[slug] = roots.map(root => {
    let main;
    walkSync(parse(readFileSync(join(root, 'councils', slug, 'index.html'), 'utf8')), node => {
      if (node.name === 'main') main = node;
    });
    if (!main) throw new Error(`Missing main in ${slug}`);
    let tables = 0;
    walkSync(main, node => { if (node.name === 'table') tables++; });
    return {
      wordsOutsideClosedDrawers: words(main, true).trim().split(/\s+/).filter(Boolean).length,
      tables,
      sourceLines: (words(main).match(/Source:/g) ?? []).length,
    };
  });
}
console.log(JSON.stringify(report, null, 2));
