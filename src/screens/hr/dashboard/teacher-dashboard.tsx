'use client';

import React, { useMemo } from 'react';
import { useTabs } from 'src/hooks/useTabs';
import { Box, Tab, Tabs } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { TABS } from '../employee/employee-view';

const TeacherDashboard = ({ employee }: any) => {
  const tabs = useTabs('personalInformation');
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [tabs.value]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'HR' }, { name: 'Dashboard' }]}
        sx={{ px: 1, pb: 1 }}
      />
      <Tabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{ px: 2, mb: 2, '& .MuiTabs-flexContainer': { gap: 1.5 } }}
        role="tablist"
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            label={tab.label}
            role="tab"
          />
        ))}
      </Tabs>
      {currentActiveComponent?.component && (
        <currentActiveComponent.component tabs={tabs} employee={employee} />
      )}
    </Box>
  );
};

export default TeacherDashboard;
