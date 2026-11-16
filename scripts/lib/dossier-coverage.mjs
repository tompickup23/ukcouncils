import {parse, walkSync, ELEMENT_NODE, TEXT_NODE} from 'ultrahtml';
import {ITEMS, STATES, DECISIONS, DEFAULT_AUTHORITY} from './dossier-state.mjs';

const words = node => node.type === TEXT_NODE ? node.value : (node.children ?? []).map(words).join(' ');
const normalise = value => value.replace(/\s+/g, ' ').trim();
const insideMain = node => {
  for (let parent = node.parent; parent; parent = parent.parent) if (parent.name === 'main') return true;
  return false;
};
const hidden = node => {
  for (let parent = node; parent; parent = parent.parent) {
    const attrs = parent.attributes ?? {};
    if ('hidden' in attrs || attrs['aria-hidden'] === 'true' || /(?:display\s*:\s*none|visibility\s*:\s*hidden)/i.test(attrs.style ?? '')) return true;
  }
  return false;
};

/** Source expectations are built independently of the HTML, so omission cannot pass. */
export function dossierCoverage(html, profile) {
  const failures = [];
  const elements = [];
  walkSync(parse(html), node => { if (node.type === ELEMENT_NODE && insideMain(node)) elements.push(node); });
  const matches = marker => {
    const [key, value] = marker.split('=');
    return elements.filter(node => Object.hasOwn(node.attributes, key) && (value === undefined || node.attributes[key] === value));
  };
  const absent = elements.filter(node => Object.hasOwn(node.attributes, 'data-dossier-absence'));
  const keys = new Set();
  for (const part of profile.parts) {
    if (keys.has(part.key)) failures.push(`Duplicate dossier part ${part.key}`);
    keys.add(part.key);
    if (!ITEMS.includes(part.item) || !STATES.includes(part.state)) failures.push(`Invalid dossier state ${part.key}`);
    const reasons = absent.filter(node => node.attributes['data-dossier-absence'] === part.key);
    const found = part.markers.map(matches);
    if (part.state === 'built') {
      if (!part.sources.length || part.sources.some(source => !source.path || !/^[a-f0-9]{64}$/.test(source.sha256 ?? ''))) failures.push(`Unpinned dossier source ${part.key}`);
      if (found.some((nodes, index) => !nodes.length || (part.markers[index].startsWith('id=') && nodes.length !== 1) || nodes.every(node => hidden(node) || !normalise(words(node))))) failures.push(`Missing built dossier part ${part.key}`);
      if (reasons.length || part.reason || part.decision) failures.push(`Built and absent dossier part ${part.key}`);
    } else {
      if (found.some(nodes => nodes.length)) failures.push(`Absent dossier part has built content ${part.key}`);
      if (!['no-source', 'not-published', 'held'].includes(part.absenceKind) || !part.reason?.trim()) failures.push(`Missing dossier reason ${part.key}`);
      const expected = normalise(`${part.label}: ${part.reason}`);
      if (reasons.length !== 1 || normalise(words(reasons[0])) !== expected || hidden(reasons[0])) failures.push(`Missing visible dossier reason ${part.key}`);
      if (part.state === 'out-of-scope' && (!Object.hasOwn(DECISIONS, part.decision?.key ?? '') || part.decision.key !== part.key || part.decision.authority !== DEFAULT_AUTHORITY || part.decision.effective !== '2026-12-16')) failures.push(`Missing Tom decision ${part.key}`);
      if (part.state === 'absent' && part.decision) failures.push(`Conflicting dossier decision ${part.key}`);
    }
  }
  for (const node of absent) if (!keys.has(node.attributes['data-dossier-absence'])) failures.push('Unknown dossier absence');
  if (Object.keys(profile.items).sort().join() !== [...ITEMS].sort().join()) failures.push('Incomplete dossier item inventory');
  for (const item of ITEMS) {
    const parts = profile.parts.filter(part => part.item === item);
    const expected = parts.some(part => part.state === 'absent') ? 'absent' : parts.some(part => part.state === 'out-of-scope') ? 'out-of-scope' : 'built';
    if (!parts.length || profile.items[item]?.state !== expected || profile.items[item]?.parts.join() !== parts.map(part => part.key).join()) failures.push(`Invalid dossier item ${item}`);
  }
  return failures;
}
