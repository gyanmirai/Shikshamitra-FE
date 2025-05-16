'use client';

import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';

import { Tab, Box, Card } from '@mui/material';

import { useSearchParam } from 'src/hooks/use-search-param';

import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import HostelFeeHead from './components/hostelFeeHead/hostelFeeHead';
import HostelFeeStructure from './components/hostelFeeStrucutre/feeStructure';
import HostelPaymentMethodComponent from './components/hostelFeeStrucutre/components/hostelPaymentMethodComp';

const TABS = [
  {
    value: 'feeHead',
    label: 'Fee Head Management',
    component: (props: TabComponentType) => <HostelFeeHead {...props} />,
  },
  {
    value: 'paymentMethod',
    label: 'Payment Method',
    component: (props: TabComponentType) => <HostelPaymentMethodComponent {...props} />,
  },
  {
    value: 'FeeStructure',
    label: 'Fee Structure',
    component: (props: TabComponentType) => <HostelFeeStructure {...props} />,
  },
];
const HostelFeeSetting = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'feeHead' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Setting"
        description="Student Fee Management For Hostel "
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          { name: 'Fee Management', href: '' },
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
export default HostelFeeSetting;
