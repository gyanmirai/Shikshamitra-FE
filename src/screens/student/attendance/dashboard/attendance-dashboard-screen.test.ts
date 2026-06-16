import fs from 'node:fs';
import path from 'node:path';
import { it, expect, describe } from 'vitest';

const source = fs.readFileSync(path.join(__dirname, 'index.tsx'), 'utf8');
const routeSource = fs.readFileSync(
  path.resolve(__dirname, '../../../../app/(auth-route)/student/attendance/dashboard/page.tsx'),
  'utf8'
);

describe('student attendance dashboard screen wiring', () => {
  it('uses selected month params for the summary query', () => {
    expect(source).toContain('buildAttendanceSummaryQuery(selectedMonth)');
    expect(source).toContain(
      'useGetStudentAttendanceDashboardSummaryQuery(attendanceSummaryQuery)'
    );
  });

  it('uses attendance history API data for the division detail table', () => {
    expect(source).toContain('useGetStudentAttendanceHistoryQuery');
    expect(source).toContain('buildAttendanceHistoryQuery');
    expect(source).toContain('data={attendanceHistoryRows}');
    expect(source).not.toContain('data={[]}');
  });

  it('is the implementation mounted by the attendance dashboard route', () => {
    expect(routeSource).toContain('src/screens/student/attendance/dashboard');
    expect(routeSource).not.toContain('src/screens/student/attendance/attendanceDashboard');
  });
});
