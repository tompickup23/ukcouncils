import { readFileSync } from 'node:fs';

// Read PR prose as data. Never interpolate its lines into a shell command.
export function fencedLines(body, heading) {
  const lines = body.replace(/\r\n/g, '\n').split('\n');
  let fence = null;
  let awaiting = false;
  let found = false;
  let collecting = false;
  const result = [];
  for (const line of lines) {
    const marker = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line);
    if (fence) {
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) {
        fence = null;
        collecting = false;
      } else if (collecting && line.trim()) {
        result.push(line.trim());
      }
      continue;
    }
    if (marker) {
      fence = marker[1];
      collecting = awaiting;
      awaiting = false;
      continue;
    }
    const title = line.replace(/^\s{0,3}#{1,6}\s+/, '').replace(/\s+#+\s*$/, '').trim();
    if (title === heading) {
      if (found) throw new Error(`Use one ${heading} heading.`);
      found = true;
      awaiting = true;
    } else if (awaiting && line.trim()) {
      throw new Error(`Put a fenced block directly under ${heading}.`);
    }
  }
  if (awaiting || collecting) throw new Error(`Complete the fenced block under ${heading}.`);
  return result;
}

export function eventBody() {
  return JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).pull_request?.body ?? '';
}

export function capturePaths(body) {
  const paths = fencedLines(body, 'Pages to capture');
  if (!paths.length) return ['/', '/councils/burnley/'];
  const origin = 'http://127.0.0.1:4321';
  for (const path of paths) {
    if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')
      || /[\s\u0000-\u001f]/.test(path) || new URL(path, origin).origin !== origin) {
      throw new Error('Capture paths must be local paths starting with one slash.');
    }
  }
  return [...new Set(paths)];
}
