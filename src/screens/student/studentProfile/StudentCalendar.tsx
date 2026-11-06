import { academicPaths } from 'src/constants/academic-menu';

import { StudentRelatedUnavailable } from './student-related-unavailable';

import type { StudentTabsComponentType } from '.';

export default function StudentCalendar({ tabs }: StudentTabsComponentType) {
  return (
    <StudentRelatedUnavailable
      title="Calendar"
      message="Student calendar events are unavailable here."
      onOverview={tabs ? () => tabs.setValue('overview') : undefined}
      destination={{
        href: academicPaths.academicCalendar.management,
        label: 'Open academic calendar',
        permission: 'Academics.AcademicCalendar.CalendarManagement.View',
      }}
    />
  );
}
