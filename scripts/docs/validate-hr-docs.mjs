import { spawnSync } from 'node:child_process';
import process from 'node:process';

const result = spawnSync(
  process.execPath,
  ['scripts/docs/validate-docs.mjs', '--module', 'hr'],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
