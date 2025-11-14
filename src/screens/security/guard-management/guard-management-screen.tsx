import React from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import GuardRosterScreen from './guard-assigned-screen';

const GuardManagementScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Guard Assignment"
      links={[
        { name: 'Security', href: '' },
        { name: 'Guard Assignment', href: '' },
      ]}
      sx={{ mb: 2 }}
    />
    <GuardRosterScreen />
    {/* <GuardCalenderView/> */}
  </>
);

export default GuardManagementScreen;
