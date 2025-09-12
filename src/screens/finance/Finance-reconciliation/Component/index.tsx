'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import { useTabs } from 'src/hooks/use-tabs';
import { Label } from 'src/components/label';
import React, { useMemo, useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Tab, Card, Tabs } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import Discrepancy from './Discrepancy';
import BankStatements from './BankStatements';

// status enum
enum FinanceStatus {
  Pending = 'Pending',
  Completed = 'Completed',
}

//  data, replace with your actual data source
const exampleData = [
  { status: FinanceStatus.Pending },
  { status: FinanceStatus.Pending },
  { status: FinanceStatus.Pending },
  { status: FinanceStatus.Pending },
  { status: FinanceStatus.Completed },
  { status: FinanceStatus.Completed },
  { status: FinanceStatus.Completed },
  { status: FinanceStatus.Completed },
];

const FinanceReconciliation = () => {
  // Tab state
  const tabs = useTabs(FinanceStatus.Pending);
  const [, setSearchParams] = useSearchParam({ tab: FinanceStatus.Pending });

  // Dialogs
  const addOverviewDialog = useBoolean(false);
  const addDiscrepancyDialog = useBoolean(false);
  const addBankStatementsDialog = useBoolean(false);

  // Counts for tabs
  const counts = useMemo(
    () => ({
      pending: exampleData.filter((i) => i.status === FinanceStatus.Pending).length,
      completed: exampleData.filter((i) => i.status === FinanceStatus.Completed).length,
    }),
    []
  );

  // Tab config
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const TABS = [
    {
      label: 'Pending',
      value: FinanceStatus.Pending,
      count: counts.pending,
      color: 'warning' as LabelColor,
      component: (props: any) => <Discrepancy {...props} />,
    },
    {
      label: 'Completed',
      value: FinanceStatus.Completed,
      count: counts.completed,
      color: 'success' as LabelColor,
      component: (props: any) => <BankStatements {...props} />,
    },
  ];

  // Find current tab/component
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === tabs.value),
    [TABS, tabs.value]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === tabs.value),
    [TABS, tabs.value]
  );
  const [isBack, setIsBack] = useState(false);

  // Redux state for unsaved changes (if you use this pattern)
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);

  /**
   * Handles closing of the dialog (for add/edit/check actions)
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedEntry(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Handle different closing scenarios
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addDiscrepancyDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addDiscrepancyDialog.onFalse();
      setTimeout(() => {
        setSelectedEntry(null);
      }, 200);
    }
  };

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    const newIndex = TABS.findIndex((tab) => tab.value === newValue);
    setIsBack(currentIndex > newIndex);
    tabs.onChange(event, newValue);
    setSearchParams({ tab: newValue });
  };

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reconciliation"
        description="This section helps you compare recorded transactions with bank statements to ensure financial records match, quickly identify matched, unmatched, and discrepant transactions."
        links={[
          { name: 'Finance', href: '/finance' },
          { name: 'Reconciliation', href: '/finance/reconciliation' },
        ]}
      />
      <Card
        sx={{
          boxShadow: 0,
          borderRadius: 2,
          background: '#fff',
          p: 1,
        }}
      >
        <Tabs
          value={tabs.value}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              sx={{ fontSize: '12px' }}
              key={tab.value}
              label={
                <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                  {tab.label}{' '}
                  <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                </Box>
              }
              // icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>
      </Card>
      <FormSlider steps={TABS} isBackClick={isBack} step={currentIndex}>
        <Scrollbar sx={{ p: 1, marginLeft: -3, marginTop: -3 }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              addOverviewDialog={addOverviewDialog}
              addDiscrepancyDialog={addDiscrepancyDialog}
              addBankStatementsDialog={addBankStatementsDialog}
              handleClose={handleClose}
            />
          )}
        </Scrollbar>
      </FormSlider>
    </Box>
  );
};

export default FinanceReconciliation;
