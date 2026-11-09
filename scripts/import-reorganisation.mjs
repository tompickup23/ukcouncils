import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Manual import only. The build reads the reviewed JSON output.
const result = spawnSync('python3', [resolve(process.cwd(), 'scripts/lib/import-reorganisation.py')], { stdio: 'inherit' });
process.exit(result.status ?? 1);
