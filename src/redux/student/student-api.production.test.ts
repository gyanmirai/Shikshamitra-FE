import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../..');

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

describe('student production API wiring', () => {
  it('keeps student record list backed by the paged division endpoint', () => {
    const source = readSource('src/redux/student/index.ts');

    expect(source).toContain(['/students/records/list/', '{params.divisionId}'].join('$'));
    expect(source).toContain("queryParams.set('skipCount'");
    expect(source).toContain("queryParams.set('maxResultCount'");
    expect(source).toContain("queryParams.set('searchTerm'");
  });

  it('uses upload and dashboard endpoints owned by student records', () => {
    const source = readSource('src/redux/student/index.ts');

    expect(source).toContain(['/students/records/', '{studentId}/photo'].join('$'));
    expect(source).toContain('/students/records/dashboard-summary');
    expect(source).toContain('/students/records/attendance-dashboard-summary');
    expect(source).toContain('invalidatesTags: [studentType.student]');
  });

  it('does not reintroduce 100-row capped student record fetches on changed screens', () => {
    const changedScreens = [
      'src/screens/student/upload-student-photo/index.tsx',
      'src/screens/student/upload-student-documents/index.tsx',
      'src/screens/student/management/bulk-data-update/index.tsx',
    ];

    const offenders = changedScreens.filter((relativePath) =>
      /maxResultCount:\s*100/.test(readSource(relativePath))
    );

    expect(offenders).toEqual([]);
  });
});
