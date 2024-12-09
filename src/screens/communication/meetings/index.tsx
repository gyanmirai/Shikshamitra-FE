'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AllMeetings from './AllMeetings';

const TABS = [
  {
    value: 'allMeetings',
    label: 'All Meetings',
    component: (props: TabComponentType) => <AllMeetings {...props} />,
  },
  //   {
  //     value: 'upcomingEvents',
  //     label: 'Upcoming Events',
  //     component: (props: TabComponentType) => <UpcomingEvents {...props} />,
  //   },
  //   {
  //     value: 'eventArchieves',
  //     label: 'Event Archieves',
  //     component: (props: TabComponentType) => <EventsArchieves {...props} />,
  //   },
];

const Meetings = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'allMeetings' });

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
          { name: 'Meetings' },
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

export default Meetings;