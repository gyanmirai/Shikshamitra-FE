'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Tab, Box, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AllEvents from './allEvents';
import UpcomingEvents from './upcomingEvents';
import EventsArchieves from './eventsArchieves';

const TABS = [
  {
    value: 'allEvents',
    label: 'All Events',
    component: (props: TabComponentType) => <AllEvents {...props} />,
  },
  {
    value: 'upcomingEvents',
    label: 'Upcoming Events',
    component: (props: TabComponentType) => <UpcomingEvents {...props} />,
  },
  {
    value: 'eventArchieves',
    label: 'Event Archieves',
    component: (props: TabComponentType) => <EventsArchieves {...props} />,
  },
];

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'allEvents' });

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
          { name: 'Events' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 1 }}
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
      <Box px={1} pt={1}>
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

export default Events;
