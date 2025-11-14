'use client';

import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HandOverNotesTable from './component/hand-over-notes-table';

const GuardDutyOverview = () => (
  <>
    <CustomBreadcrumbs
      heading="Guard Duty Overview"
      description="View the daily duty schedule of all guards. As a supervisor, you can select a date to see which guards are assigned, their shift timings, and duty status for that day."
      links={[
        { name: 'Security', href: '' },
        { name: 'Guard Duty Overview', href: '' },
      ]}
      sx={{ mb: 2 }}
    />
    <HandOverNotesTable />
  </>
);

export default GuardDutyOverview;
