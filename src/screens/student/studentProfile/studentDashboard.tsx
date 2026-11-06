import { Stack } from '@mui/material';
import AcademicTimetable from 'src/components/studentProfile/academicTimetable';

import { StudentRelatedUnavailable } from './student-related-unavailable';

import type { StudentTabsComponentType } from '.';

export default function StudentDashboard({ student, tabs }: StudentTabsComponentType) {
  return (
    <Stack spacing={2}>
      <StudentRelatedUnavailable
        title="School Activity"
        message="Student school activity summary is unavailable here."
        onOverview={tabs ? () => tabs.setValue('overview') : undefined}
      />
      {student.standardId && student.divisionId && (
        <AcademicTimetable standardId={student.standardId} divisionId={student.divisionId} />
      )}
    </Stack>
  );
}
