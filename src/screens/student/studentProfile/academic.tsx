import React from 'react';
import AcademicTabs from 'src/components/studentProfile/AcademicTabs';

import type { StudentTabsComponentType } from '.';

const Academic = ({ student, tabs }: Partial<StudentTabsComponentType>) => (
  <AcademicTabs student={student} onOverview={tabs ? () => tabs.setValue('overview') : undefined} />
);

export default Academic;
