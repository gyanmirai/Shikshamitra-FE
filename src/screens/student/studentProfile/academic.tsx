import React from 'react';

import AcademicTabs from 'src/components/studentProfile/AcademicTabs';

import type { StudentTabsComponentType } from '.';

const Academic = (props: StudentTabsComponentType) => {
  console.log('Academic-- component--');

  return <AcademicTabs />;
};

export default Academic;
