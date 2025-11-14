'use client';

import React, { useMemo } from 'react';
import { Box, Tab, Card } from '@mui/material';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FeeCollectionNotificationManagement from './notification-tab/fee-collection-notification-management';
import FinanceGeneralSettingtNotificationManagement from './notification-tab/finance-general-setting-management';
import FinanceReconciliationNotificationManagement from './notification-tab/finance-reconciliation-notification-management';
import FeeStructureManagementNotificationManagement from './notification-tab/fee-structure-management-notification-management';

const FinanceStaticNotificationScreen = () => {
  const TABS = [
    {
      value: 'feeStructure',
      label: 'Fee Structure',
      icon: <Iconify icon="ix:inquiry" width={20} />,
      component: () => <FeeStructureManagementNotificationManagement />,
    },
    {
      value: 'fees',
      label: 'Fees',
      icon: <Iconify icon="ix:inquiry" width={20} />,
      component: () => <FeeCollectionNotificationManagement />,
    },
    {
      value: 'reconciliation',
      label: 'Reconciliation',
      icon: <Iconify icon="ix:inquiry" width={20} />,
      component: () => <FinanceReconciliationNotificationManagement />,
    },
    {
      value: 'generalSetting',
      label: 'General Settings',
      icon: <Iconify icon="ix:inquiry" width={20} />,
      component: () => <FinanceGeneralSettingtNotificationManagement />,
    },
  ];

  const [searchParams, setSearchParams] = useSearchParam({ tab: 'feeStructure' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams.tab]
  );

  // const closeHandler = () => {

  // }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between">
        <CustomBreadcrumbs
          heading="Notification Settings"
          links={[
            { name: 'Finance', href: 'finance/dashboard' },
            { name: 'Notification Settings' },
          ]}
          sx={{ mb: 2 }}
          description="In the Notification Settings, you can customize the message for each notification and enable or disable it as needed."
        />
        {/* <Button startIcon={<Iconify icon="eva:arrow-back-fill" />} size="small" variant='contained' onClick={closeHandler}>Back</Button> */}
      </Box>

      <Card
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        <CustomTabs
          value={searchParams.tab}
          onChange={(e, value) => setSearchParams({ tab: value })}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              icon={tab.icon}
              key={tab.value}
              value={tab.value}
              label={tab.label}
            />
          ))}
        </CustomTabs>
      </Card>
      <Box px={1} pt={2} height="100%">
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Box>
    </Box>
  );
};

export default FinanceStaticNotificationScreen;
