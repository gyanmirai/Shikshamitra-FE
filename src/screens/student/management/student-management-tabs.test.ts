import fs from 'fs';
import path from 'path';
import { it, expect, describe } from 'vitest';

const repoRoot = process.cwd();

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

describe('Student management tabs', () => {
  it('does not expose the removed direct student-import bypass', () => {
    const managementSource = readSource('src/screens/student/management/index.tsx');

    expect(managementSource).not.toContain('BulkStudentAdd');
    expect(managementSource).not.toContain("value: 'bulkStudentAdd'");
    expect(managementSource).not.toContain("label: 'Bulk Student Add'");
  });
});
