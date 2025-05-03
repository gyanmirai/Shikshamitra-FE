'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FacilitySetting from './components/facility';
import BedManagement from './components/bedManagement/bedManagement';
import HostelTypeSetting from './components/hostelTypeDefinition/hostelTypeDefinition';
import RoomCategorySetting from './components/roomCategoryManagement/roomCategoryManagement';

const TABS = [
  {
    value: 'hostelTypeDefinition',
    label: 'Hostel Type Definition',
    component: (props: TabComponentType) => <HostelTypeSetting {...props} />,
  },
  {
    value: 'facility',
    label: 'Facility',
    component: (props: TabComponentType) => <FacilitySetting {...props} />,
  },
  {
    value: 'roomCategoryManagement',
    label: 'Room Category Management',
    component: (props: TabComponentType) => <RoomCategorySetting {...props} />,
  },
  {
    value: 'bedManagement',
    label: 'Bed Management',
    component: (props: TabComponentType) => <BedManagement {...props} />,
  },
];
const HostelConfigurationSetting: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'hostelTypeDefinition' });

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
export default HostelConfigurationSetting;
