import { closeSync, openSync, readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { eventBody, fencedLines } from './review-inputs.mjs';

const [baseline, candidate, report] = process.argv.slice(2);
let status = 2;
try {
  const globs = fencedLines(eventBody(), 'Pages allowed to differ');
  const args = ['scripts/diff-numbers.mjs', baseline, candidate, ...globs.flatMap((glob) => ['--allow', glob])];
  const fd = openSync(report, 'w');
  try {
    const result = spawnSync(process.execPath, args, { stdio: ['ignore', fd, fd] });
    if (result.error) throw new Error('The number comparison process could not start.');
    status = result.status ?? 2;
  } finally {
    closeSync(fd);
  }
} catch (error) {
  writeFileSync(report, `Number comparison could not run: ${error.message}\n`);
}
const output = readFileSync(report, 'utf8');
const summary = output.split('\n').find((line) => line.startsWith('Summary:'))
  ?? 'Number comparison did not complete. Read the full output.';
// A bounded preview keeps the comment below GitHub's size limit. The artifact
// always contains the full output, including rows longer than this preview.
const preview = output.trim().split('\n').slice(0, 20).join('\n').slice(0, 40000)
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const markdown = `## Number diff\n\n${summary}\n\nFirst twenty output lines (up to 40,000 characters):\n\n<pre>${preview}</pre>\n`;
writeFileSync(`${report}.md`, markdown);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
console.log(summary);
process.exitCode = status;
