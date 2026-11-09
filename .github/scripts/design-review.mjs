import { appendFileSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { capturePaths, eventBody } from './review-inputs.mjs';

const output = process.argv[2];
mkdirSync(output, { recursive: true });
let summary;
let status = 2;
try {
  const paths = capturePaths(eventBody());
  const args = ['run', '--script', '.github/design-check/design_check.py', process.cwd(),
    '--preview', 'http://127.0.0.1:4321', '--shots', output, '--site-name', 'UK Councils',
    ...paths.flatMap((path) => ['--path', path])];
  const result = spawnSync('uv', args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  writeFileSync(join(output, 'checker.log'), `${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  const folder = readdirSync(output, { withFileTypes: true }).filter((entry) => entry.isDirectory())
    .map((entry) => entry.name).sort().at(-1);
  if (!folder || result.error || result.status === null || result.status > 1) {
    throw new Error('The design checker could not complete. Read checker.log in the artifact.');
  }
  const report = readFileSync(join(output, folder, 'report.md'), 'utf8');
  const captures = readdirSync(join(output, folder)).filter((file) => /^page\d+_(390|1440)_(light|dark)\.png$/.test(file));
  if (captures.length !== paths.length * 4) throw new Error('Some design captures are missing. Read the report and checker.log in the artifact.');
  summary = report.split('\n').filter((line) => /^(## |### |\* (PASS|FAIL) |Result:)/.test(line)).join('\n');
  status = 0;
} catch (error) {
  summary = `## Design check\n\n${error.message}\nNo complete design pass was recorded.`;
}
summary += '\n\nThis job reports findings for review. It does not block the PR.\n';
writeFileSync(join(output, 'summary.md'), summary);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
console.log(summary);
process.exitCode = status;
