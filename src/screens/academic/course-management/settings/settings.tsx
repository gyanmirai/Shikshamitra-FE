'use client';

import React, { useMemo } from 'react';
import { Tab, Box, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ResourceTypeCreation from './components/learningResourceType';
import SyllabusNotification from './components/syllabusNotification';

const TABS = [
  {
    value: 'learningResourceType',
    label: 'Learning Resource Type',
    component: () => <ResourceTypeCreation />,
  },
  {
    value: 'notificationSetting',
    label: 'Notifications',
    component: () => <SyllabusNotification />,
  },
];
const SyllabusSetting = () => {
  // Initialize search params with default tab 'subjectSetting'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'learningResourceType' });

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Setting for learning resource type and notification setting"
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Syllabus', href: '/academic/courseSubjects' },
          { name: 'Setting' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ mb: 1 }}
      />
      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
          variant="fullWidth"
          slotProps={{ tab: { px: 0 } }}
        >
          {TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2}>
        {currentActiveComponent?.component && <currentActiveComponent.component />}{' '}
      </Box>
    </Box>
  );
};
export default SyllabusSetting;
