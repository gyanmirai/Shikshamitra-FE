import React from 'react';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GuardRosterScreen from './guard-assigned-screen';

const GuardManagementScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Guard Assigned"
      links={[
        { name: 'Security', href: '' },
        { name: 'Guard Assigned', href: '' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <GuardRosterScreen />
    {/* <GuardCalenderView/> */}
  </>
);

export default GuardManagementScreen;
