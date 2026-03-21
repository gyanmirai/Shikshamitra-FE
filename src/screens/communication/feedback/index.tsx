'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Tab, Box, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/useSearchParam';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import PastSurvey from './past-feedback/pastFeedback';
import ActiveSurvey from './active-survey/activeSurvey';
import AllSurvey from './scheduled-survey/scheduledSurvey';

const TABS = [
  {
    value: 'scheduledSurvey',
    label: 'Scheduled Survey',
    component: (props: TabComponentType) => <AllSurvey {...props} />,
  },
  {
    value: 'activeSurvey',
    label: 'Active Survey',
    component: (props: TabComponentType) => <ActiveSurvey {...props} />,
  },
  {
    value: 'pastSurvey',
    label: 'Past Survey',
    component: (props: TabComponentType) => <PastSurvey {...props} />,
  },
];

const Feedback = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'activeSurvey' });

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
          { name: 'Feedback and Survey' },
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

export default Feedback;
