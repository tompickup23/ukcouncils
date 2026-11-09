import { createHash } from 'node:crypto';
export function verifyPinnedHash(bytes, expected, label) {
  if (createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error(`${label}: pinned hash differs; stop for review`);
}
export async function fetchPinnedJson(url, sha256, label) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  verifyPinnedHash(bytes, sha256, label);
  return JSON.parse(bytes.toString('utf8'));
}
