import React from 'react';
import AcademicTabs from 'src/components/studentProfile/AcademicTabs';

import type { StudentTabsComponentType } from '.';

const Academic = ({ student }: StudentTabsComponentType) => <AcademicTabs student={student} />;

export default Academic;
