import { it, vi, expect, describe } from 'vitest';
import { studentType, studentLeaveType, studentTakeAttendanceType } from 'src/redux/tagTypes';

import './api';
import '../student-leave/student-leave-api';

const definitions = vi.hoisted(() => ({
  management: {} as Record<string, any>,
  leaves: {} as Record<string, any>,
}));
vi.mock('src/redux/service', () => ({
  api: {
    injectEndpoints: ({ endpoints }: { endpoints: (builder: unknown) => Record<string, any> }) => {
      const result = endpoints({
        query: (definition: unknown) => definition,
        mutation: (definition: unknown) => definition,
      });
      if ('publishAttendancePolicy' in result) definitions.management = result;
      else if ('approveStudentLeave' in result) definitions.leaves = result;
      return {};
    },
  },
}));

describe('attendance-derived cache refresh', () => {
  it.each([
    'publishAttendancePolicy',
    'confirmAttendanceStart',
    'saveAttendanceSchedule',
    'deleteAttendanceSchedule',
    'decideAttendanceCorrection',
  ])('%s refreshes canonical attendance and the existing dashboard/history readers', (name) => {
    expect(definitions.management[name].invalidatesTags).toEqual(
      expect.arrayContaining([studentTakeAttendanceType.studentTakeAttendance, studentType.student])
    );
  });
  it.each(['addStudentLeave', 'approveStudentLeave', 'rejectStudentLeave'])(
    '%s refreshes leave evidence, the daily roster, and legacy summaries',
    (name) => {
      expect(definitions.leaves[name].invalidatesTags).toEqual(
        expect.arrayContaining([
          studentLeaveType.studentLeave,
          studentTakeAttendanceType.studentTakeAttendance,
          studentType.student,
        ])
      );
    }
  );
  it('keeps draft saves scoped to their settings version and previews read-only', () => {
    expect(
      definitions.management.saveAttendanceDraft.invalidatesTags(undefined, undefined, {
        academicYearId: 'year-a',
      })
    ).toEqual([{ type: studentTakeAttendanceType.studentTakeAttendance, id: 'SETTINGS-year-a' }]);
    expect(definitions.management.previewAttendancePolicy.invalidatesTags).toBeUndefined();
  });
});
