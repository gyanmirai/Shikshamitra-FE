'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Tab, Box, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SchoolWiseAnnounsement from './schoolWiseAnnounsement';
import ClassSpecificAnnouncement from './classSpecificAnnouncement';

const TABS = [
  {
    value: 'schoolWiseAnnounsement',
    label: 'School Specific Announsement',
    component: (props?: TabComponentType) => <SchoolWiseAnnounsement {...props} />,
  },
  {
    value: 'classSpecificAnnouncement',
    label: 'Class Specific Announcement',
    component: (props: TabComponentType) => <ClassSpecificAnnouncement {...props} />,
  },
];

const Announcement = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'schoolWiseAnnounsement' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading={currentActiveComponent?.label}
        links={[
          { name: 'Communication' },
          { name: 'Announcement' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 2 }}
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
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            searchParams={searchParams}
            setSearchParams={setSearchParams}
          />
        )}{' '}
      </Box>
    </Box>
  );
};

export default Announcement;
