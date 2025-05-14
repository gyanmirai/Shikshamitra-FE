'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import TagSetting from './tagsManagement';
import IncidentTypeSetting from './incidentType';
import DisciplineActionSetting from './disciplinaryAction';

const TABS = [
  {
    value: 'incidentTypeSetting',
    label: 'Incident Type Setting',
    component: (props: TabComponentType) => <IncidentTypeSetting {...props} />,
  },
  {
    value: 'disciplinaryAction',
    label: 'Disciplinary Action',
    component: (props: TabComponentType) => <DisciplineActionSetting {...props} />,
  },
  {
    value: 'emenergencyLevel',
    label: 'Emenergency Level',
    component: (props: TabComponentType) => <TagSetting {...props} />,
  },
];
const HostelDisciplineSetting: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'disciplinaryAction' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Hostel Configuration Setting"
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Disciplinary Actions Tracking & Management', href: '' },
          { name: 'Setting', href: '' },
          { name: currentActiveComponent?.label, href: '' },
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
export default HostelDisciplineSetting;
