import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

import { parseStudentDashboardPayload } from '.';

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
    expect(source).toContain('/students/dashboard/previews/');
    expect(source).toContain(['/students/dashboard/previews/', '{dashboardKey}/refresh'].join('$'));
    expect(source).toContain('/students/attendance/history');
    expect(source).toContain('params,');
    expect(source).toContain('invalidatesTags: [studentType.student]');
  });

  it('parses saved student reporting dashboard previews safely', () => {
    expect(
      parseStudentDashboardPayload({
        dashboardKey: 'Reporting',
        scopeKey: 'student-wide',
        status: 'Empty',
        payloadJson: '{}',
        payloadVersion: 1,
        isStale: true,
      })
    ).toBeUndefined();

    expect(
      parseStudentDashboardPayload<{ kpis: Array<{ id: string; value: number }> }>({
        dashboardKey: 'Reporting',
        scopeKey: 'student-wide',
        status: 'Ready',
        payloadJson: '{"kpis":[{"id":"total-students","value":42}]}',
        payloadVersion: 1,
        isStale: false,
      })
    ).toEqual({ kpis: [{ id: 'total-students', value: 42 }] });
  });

  it('keeps the live dashboard wired to manual refresh without reporting preview polling', () => {
    const screenSource = readSource('src/screens/student/dashboard/index.tsx');
    const hookSource = readSource('src/screens/student/dashboard/hooks/use-student-dashboard.ts');
    const dashboardSources = collectSourceFiles(
      path.join(repoRoot, 'src/screens/student/dashboard')
    )
      .map((filePath) => fs.readFileSync(filePath, 'utf8'))
      .join('\n');
    const apiSource = readSource('src/redux/student/dashboard/student-module-dashboard-api.ts');

    // Behavioral refresh/access coverage lives in student-dashboard.test.tsx.
    expect(apiSource).toContain('/students/dashboard/context');
    expect(apiSource).toContain(`/students/dashboard/sections/$${'{section}'}`);
    expect(screenSource).toContain('onClick={refresh}');
    expect(hookSource).toContain('studentModuleDashboardApi.util.invalidateTags');
    expect(hookSource).toContain("id: 'MODULE-DASHBOARD'");
    expect(dashboardSources).not.toContain('pollingInterval');
    expect(dashboardSources).not.toContain('/students/dashboard/previews/');
    expect(dashboardSources).not.toContain('useRefreshStudentDashboardPreviewMutation');
    expect(dashboardSources).not.toContain('window.setTimeout');
  });

  it('keeps student leave list wired to server pagination and sorting params', () => {
    const apiSource = readSource('src/redux/student/student-leave/student-leave-api.ts');
    const screenSource = readSource(
      'src/screens/student/attendance/leave-absent/leave-requests.tsx'
    );

    expect(apiSource).toContain('url: `/students/attendance/leaves`');
    expect(apiSource).toContain('params,');
    // The request suite verifies URL-backed paging, filters and scope through MSW.
    expect(screenSource).toContain('params: { ...query, ...scope }');
    expect(screenSource).toContain('serverSidePagination');
    expect(screenSource).toContain('serverSideSort');
    expect(screenSource).toContain('totalCount={leaveData?.totalCount || 0}');
    expect(screenSource).toContain('skipCount: page * rowsPerPage');
    expect(screenSource).toContain('maxResultCount: rowsPerPage');
  });

  it('keeps canonical student document JSON adapters without multipart headers', () => {
    const studentIdPlaceholder = `$${'{studentId}'}`;
    const requiredStatusEndpoint = `/app/student-document/required-documents-status/${studentIdPlaceholder}`;
    const uploadEndpoint = `/app/student-document/upload-document/${studentIdPlaceholder}`;
    const sources = collectSourceFiles(path.join(repoRoot, 'src/redux/student')).map(
      (filePath) => ({
        relativePath: path.relative(repoRoot, filePath),
        source: fs.readFileSync(filePath, 'utf8'),
      })
    );
    const offenders = sources.flatMap(({ relativePath, source }) =>
      [
        "'Content-Type': 'multipart/form-data'",
        '"Content-Type": "multipart/form-data"',
        'multipart/form-data',
      ]
        .filter((pattern) => source.includes(pattern))
        .map((pattern) => `${relativePath} contains ${pattern}`)
    );
    const registrationSource = readSource('src/redux/student/registration/registration-api.ts');
    const profileSource = readSource(
      'src/redux/student/records/student-profile-information-api.ts'
    );

    expect(offenders).toEqual([]);
    // Dedicated adapter suites verify JSON bytes, response envelopes and failed writes.
    [registrationSource, profileSource].forEach((source) => {
      expect(source).toContain(requiredStatusEndpoint);
      expect(source).toContain(uploadEndpoint);
    });
    expect(registrationSource).toContain(
      'body: await studentDocumentUploadPayload(file, documentTypeId)'
    );
  });

  it('does not reintroduce 100-row capped student record fetches on changed screens', () => {
    const changedScreens = [
      'src/screens/student/upload-student-photo/index.tsx',
      'src/screens/student/upload-student-documents/index.tsx',
    ];

    const offenders = changedScreens.filter((relativePath) =>
      /maxResultCount:\s*100/.test(readSource(relativePath))
    );

    expect(offenders).toEqual([]);
  });
});
