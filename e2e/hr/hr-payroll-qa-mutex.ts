/* eslint-disable no-await-in-loop, no-continue, perfectionist/sort-named-imports */
import os from 'node:os';
import path from 'node:path';
import { mkdir, open, rm, stat } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const lockDirectory = path.join(os.tmpdir(), 'shikshamitra-e2e-locks');
const lockPath = path.join(lockDirectory, 'hr-payroll-ddvs.lock');
const staleLockMs = 20 * 60 * 1000;
const lockPollMs = 250;
const lockTimeoutMs = 15 * 60 * 1000;

async function acquireHrPayrollQaLock() {
  await mkdir(lockDirectory, { recursive: true });
  const startedAt = Date.now();

  for (;;) {
    try {
      const handle = await open(lockPath, 'wx');
      await handle.writeFile(
        JSON.stringify({
          pid: process.pid,
          createdAt: new Date().toISOString(),
        })
      );
      await handle.close();
      return;
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== 'EEXIST') {
        throw error;
      }

      const ageMs = await stat(lockPath)
        .then((info) => Date.now() - info.mtimeMs)
        .catch(() => 0);
      if (ageMs > staleLockMs) {
        await rm(lockPath, { force: true }).catch(() => undefined);
        continue;
      }

      if (Date.now() - startedAt > lockTimeoutMs) {
        throw new Error(`Timed out waiting for HR payroll QA lock: ${lockPath}`);
      }

      await delay(lockPollMs);
    }
  }
}

export async function withHrPayrollQaMutex<T>(operation: () => Promise<T>): Promise<T> {
  await acquireHrPayrollQaLock();
  try {
    return await operation();
  } finally {
    await rm(lockPath, { force: true }).catch(() => undefined);
  }
}
