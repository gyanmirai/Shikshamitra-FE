'use client';

import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HandOverNotesTable from './component/hand-over-notes-table';

const HandOverNotesScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Guard Duties"
      links={[
        { name: 'Security', href: '' },
        { name: 'Guard Duties', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <HandOverNotesTable />
  </>
);

export default HandOverNotesScreen;
