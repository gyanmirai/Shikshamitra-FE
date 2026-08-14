import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

import { parseStudentDashboardPayload } from '.';
import { normalizeStudentRecordListResponse } from './student-group/student-group';
import {
  hasRollNumberValidationErrors,
  buildRollNumberValidationErrors,
} from '../../screens/student/management/roll-generation/roll-number-validation';

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

  it('normalizes house assignment student records while preserving response metadata', () => {
    const normalized = normalizeStudentRecordListResponse({
      success: true,
      data: {
        totalCount: 2,
        currentPage: 1,
        pageSize: 10,
        totalPages: 1,
        arrangementType: 1,
        arrangementBy: 2,
        items: [{ id: 'first' }, { id: 'second' }],
      },
    });

    expect(normalized.data).toEqual([{ id: 'first' }, { id: 'second' }]);
    expect(normalized.meta).toEqual({
      totalCount: 2,
      currentPage: 1,
      pageSize: 10,
      totalPages: 1,
      arrangementType: 1,
      arrangementBy: 2,
    });
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

  it('polls the reporting dashboard preview only while refresh is active', () => {
    const source = readSource('src/screens/student/dashboard/index.tsx');

    expect(source).toContain('DASHBOARD_REFRESH_POLLING_INTERVAL = 5000');
    expect(source).toContain('pollingInterval: dashboardPollingInterval');
    expect(source).toContain('skipPollingIfUnfocused: true');
    expect(source).toContain('isDashboardRefreshing(preview?.status)');
    expect(source).not.toContain('window.setTimeout');
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
    const registrationDocumentEndpoint = `/student/enrollment/registrations/${studentIdPlaceholder}/documents`;
    const sources = collectSourceFiles(path.join(repoRoot, 'src/redux/student')).map(
      (filePath) => ({
        relativePath: path.relative(repoRoot, filePath),
        source: fs.readFileSync(filePath, 'utf8'),
      })
    );
    const offenders = sources.flatMap(({ relativePath, source }) =>
      [
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

  it('validates manual roll numbers against duplicates, positive values, and student count', () => {
    const errors = buildRollNumberValidationErrors(
      [
        { studentId: 'first', rollNo: 1 },
        { studentId: 'second', rollNo: 1 },
        { studentId: 'third', rollNo: 4 },
        { studentId: 'fourth', rollNo: 0 },
      ],
      3
    );

    expect(errors.first).toBe('Duplicate Roll No!');
    expect(errors.second).toBe('Duplicate Roll No!');
    expect(errors.third).toBe('Roll No. cannot exceed total students (3).');
    expect(errors.fourth).toBe('Roll No. must be greater than zero.');
    expect(hasRollNumberValidationErrors(errors)).toBe(true);
    expect(buildRollNumberValidationErrors([{ studentId: 'first', rollNo: 1 }], 1)).toEqual({});
  });

  it('uses parsed API problem details for Student management submit errors', () => {
    const rollSource = readSource('src/screens/student/management/roll-generation/index.tsx');
    const grSource = readSource('src/screens/student/management/gr-generation/index.tsx');
    const houseSource = readSource('src/screens/student/recordsSetting/index.tsx');

    expect(rollSource).toContain('parseApiProblemDetail(err)');
    expect(rollSource).toContain('Please fix roll number validation errors before saving.');
    expect(rollSource).toContain('disabled={!isChanges || hasRollErrors}');
    expect(grSource).toContain('parseApiProblemDetail(error)');
    expect(houseSource).toContain('parseApiProblemDetail(error)');
    expect(grSource).not.toContain("message: 'Something went wrong'");
    expect(houseSource).not.toContain("message: 'Something went wrong'");
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
