'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import Setting from './setting';
import SharedWithMe from './shared-with-me';
import Dashboard from './dashboard/dashboard';
import AllResources from './allResources/all-resources';

const TABS = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    component: (props: TabComponentType) => <Dashboard {...props} />,
  },
  {
    value: 'allResources',
    label: 'All Resources',
    component: (props: TabComponentType) => <AllResources {...props} />,
  },
  {
    value: 'sharedWithMe',
    label: 'Shared with Me',
    component: (props: TabComponentType) => <SharedWithMe {...props} />,
  },
  {
    value: 'settings',
    label: 'Settings',
    component: (props: TabComponentType) => <Setting {...props} />,
  },
];

const ResourceContentLibraryScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'dashboard' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Resources and Content Library"
        links={[
          { name: 'Academic And Assessment' },
          { name: 'Resources and Content Library' },
          { name: currentActiveComponent?.label },
        ]}
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

export default ResourceContentLibraryScreen;
