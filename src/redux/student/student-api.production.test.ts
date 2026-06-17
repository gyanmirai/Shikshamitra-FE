import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const repoRoot = path.resolve(__dirname, '../../..');

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

function collectSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(fullPath);
    if (!/\.(ts|tsx)$/.test(entry.name) || /\.test\.(ts|tsx)$/.test(entry.name)) return [];
    return [fullPath];
  });
}

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
    expect(source).toContain('/students/attendance/history');
    expect(source).toContain('params,');
    expect(source).toContain('invalidatesTags: [studentType.student]');
  });

  it('keeps student leave list wired to server pagination and sorting params', () => {
    const apiSource = readSource('src/redux/student/student-leave/student-leave-api.ts');
    const screenSource = readSource('src/screens/student/attendance/leave-absent/index.tsx');

    expect(apiSource).toContain('url: `/students/attendance/leaves`');
    expect(apiSource).toContain('params,');
    expect(screenSource).toContain('params: query');
    expect(screenSource).toContain('serverSidePagination');
    expect(screenSource).toContain('serverSideSort');
    expect(screenSource).toContain('totalCount={leaveData?.totalCount || 0}');
    expect(screenSource).toContain('skipCount: (page - 1) * rowsPerPage');
  });

  it('does not keep stale student document endpoints or multipart headers', () => {
    const studentIdPlaceholder = `$${'{studentId}'}`;
    const documentIdPlaceholder = `$${'{documentId}'}`;
    const staleDocumentEndpoint = `/student-enrollment/${studentIdPlaceholder}/documents/${documentIdPlaceholder}`;
    const registrationDocumentEndpoint = `/student/enrollment/registrations/${studentIdPlaceholder}/documents`;
    const sources = collectSourceFiles(path.join(repoRoot, 'src/redux/student')).map(
      (filePath) => ({
        relativePath: path.relative(repoRoot, filePath),
        source: fs.readFileSync(filePath, 'utf8'),
      })
    );
    const offenders = sources.flatMap(({ relativePath, source }) =>
      [
        staleDocumentEndpoint,
        '/app/student-document',
        "'Content-Type': 'multipart/form-data'",
        '"Content-Type": "multipart/form-data"',
        'multipart/form-data',
      ]
        .filter((pattern) => source.includes(pattern))
        .map((pattern) => `${relativePath} contains ${pattern}`)
    );
    const registrationSource = readSource('src/redux/student/registration/registration-api.ts');

    expect(offenders).toEqual([]);
    expect(registrationSource).toContain(registrationDocumentEndpoint);
  });

  it('keeps registration family details payload aligned to backend field names', () => {
    const source = readSource('src/screens/student/enrollment/register/register-form.tsx');

    expect(source).toContain('yearOfPassing: values.fatherPassOutYear');
    expect(source).toContain('yearOfPassing: values.motherPassOutYear');
    expect(source).toContain('yearOfPassing: values.guardianPassOutYear');
    expect(source).toContain('organization: values.fatherOrganization');
    expect(source).toContain('organization: values.motherOrganization');
    expect(source).toContain('organization: values.guardianOrganization');
    expect(source).toContain('aadharNo: String(values.fatherAadharNo)');
    expect(source).toContain('aadharNo: String(values.motherAadharNo)');
    expect(source).toContain('aadharNo: String(values.guardianAadharNo)');
    expect(source).toContain('officeAddress: {');
    expect(source).toContain('localAddress: {');
    expect(source).not.toContain('organisation: values');
    expect(source).not.toContain('aadhaarNo: values');
    expect(source).not.toContain('officeAddress1: values');
    expect(source).not.toContain('officeAddress2: values');
    expect(source).not.toContain('officeAddress3: values');
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
