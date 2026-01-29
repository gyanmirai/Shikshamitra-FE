'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Tab, Box, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FacilitySetting from './components/facility';
import PackageManagement from './components/packageManagement';
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
    label: 'Facility Group',
    component: (props: TabComponentType) => <FacilitySetting {...props} />,
  },
  {
    value: 'package',
    label: 'Package Management',
    component: (props: TabComponentType) => <PackageManagement {...props} />,
  },
  {
    value: 'roomCategoryManagement',
    label: 'Room Type Management',
    component: (props: TabComponentType) => <RoomCategorySetting {...props} />,
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
