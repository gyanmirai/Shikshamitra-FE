'use client';

import { Box, Tab, Paper } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import ChargesNotificationManagement from './Components/ChargesNotificationManagement';
import ConcessionNotificationManagement from './Components/ConcessionNotificationManagement';
import FeeCollectionNotificationManagement from './Components/FeeCollectionNotificationManagement';
import ReconciliationNotificationManagement from './Components/ReconciliationNotificationManagement';
import IncomeTrackingNotificationManagement from './Components/IncomeTrackingNotificationManagement';
import ExpenseTrackingNotificationManagement from './Components/ExpenseTrackingNotificationManagement';

// ----------------------------------------------------
// TABS CONFIG
// ----------------------------------------------------
const TABS = [
  {
    value: 'feeCollection',
    label: 'Fee Collection',
    icon: <Iconify icon="solar:wallet-outline" width={20} />,
    component: (props: any) => <FeeCollectionNotificationManagement {...props} />,
  },
  {
    value: 'charges',
    label: 'Charges',
    icon: <Iconify icon="mdi:cash-multiple" width={20} />,
    component: (props: any) => <ChargesNotificationManagement {...props} />,
  },
  {
    value: 'concession',
    label: 'Concession',
    icon: <Iconify icon="mdi:ticket-percent-outline" width={20} />,
    component: (props: any) => <ConcessionNotificationManagement {...props} />,
  },
  {
    value: 'reconciliation',
    label: 'Reconciliation',
    icon: <Iconify icon="mdi:bank-transfer" width={20} />,
    component: (props: any) => <ReconciliationNotificationManagement {...props} />,
  },
  {
    value: 'incomeTracking',
    label: 'Income Tracking',
    icon: <Iconify icon="mdi:chart-line" width={20} />,
    component: (props: any) => <IncomeTrackingNotificationManagement {...props} />,
  },
  {
    value: 'expenseTracking',
    label: 'Expense Tracking',
    icon: <Iconify icon="mdi:currency-inr" width={20} />,
    component: (props: any) => <ExpenseTrackingNotificationManagement {...props} />,
  },
];

// ----------------------------------------------------
// MAIN SCREEN
// ----------------------------------------------------
const FinanceNotificationScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'feeCollection' });
  const dialog = useBoolean(false);

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams?.tab]
  );

  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const [isViewMode, setIsViewMode] = useState(false);
  const [isBackClick, setIsBackClick] = useState(false);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {dialog.value ? (
        <CustomBreadcrumbs
          heading={isViewMode ? 'View Notification' : 'Edit Notification'}
          description="Configure notifications for fee collection, charges, concessions, and financial tracking."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Notification',
              href: '/finance/notification',
              onClick(e) {
                dialog.onFalse();
              },
            },
            isViewMode ? { name: 'View Notification' } : { name: 'Edit Notification' },
          ]}
          isBack
          onBack={() => dialog.onFalse()}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Notification"
          description="Configure notifications for fee collection, charges, concessions, and financial tracking."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Notification', href: '/finance/notification' },
          ]}
          sx={{ px: 1 }}
        />
      )}

      {/* Tabs */}
      <Paper
        sx={{
          '& *': { fontSize: '13px !important', '& svg': { fontSize: '18px !important' } },
        }}
      >
        {!dialog.value && (
          <CustomTabs
            value={searchParams.tab}
            onChange={(e, value) => {
              const newIndex = TABS.findIndex((tab) => tab.value === value);
              setIsBackClick(currentIndex > newIndex);
              setSearchParams({ tab: value });
            }}
            sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 }, borderRadius: 2 }}
            role="tablist"
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} icon={tab.icon} />
            ))}
          </CustomTabs>
        )}
      </Paper>

      {/* Slider Content */}
      <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: { p: 0, minHeight: 0 },
        }}
      >
        <Paper sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component dialog={dialog} setIsViewMode={setIsViewMode} />
          )}
        </Paper>
      </FormSlider>
    </Box>
  );
};

export default FinanceNotificationScreen;
