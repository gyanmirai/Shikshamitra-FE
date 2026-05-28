'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Tab, Card, Tabs } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import React, { useMemo, useState, useCallback } from 'react';
import { useNewSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ReconciliationtatusType } from 'src/enums/reconciliation-status-type';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';
import { useGetReconciliationTabCountsQuery } from 'src/redux/finance/reconciliation';

import UpiTable from './Component/UpiTable';
import DebitCardTable from './Component/DebitCardTable';
import CreditCardTable from './Component/CreditCardTable';
import DemandDraftTable from './Component/DemandDraftTable';
import BankTransferTable from './Component/BankTransferTable';
import ChequeDetailsForm from './Component/ChequeDetailsTable';

// Map enum to label and component
const reconciliationTabConfig = [
  {
    label: 'UPI',
    value: ReconciliationtatusType.UPI,
    color: 'error' as LabelColor,
    component: (props: any) => <UpiTable {...props} />,
  },
  {
    label: 'Credit Card',
    value: ReconciliationtatusType.CreditCard,
    color: 'warning' as LabelColor,
    component: (props: any) => <CreditCardTable {...props} />,
  },
  {
    label: 'Debit Card',
    value: ReconciliationtatusType.DebitCard,
    color: 'warning' as LabelColor,
    component: (props: any) => <DebitCardTable {...props} />,
  },
  {
    label: 'Cheque',
    value: ReconciliationtatusType.Cheque,
    color: 'info' as LabelColor,
    component: (props: any) => <ChequeDetailsForm {...props} />,
  },
  {
    label: 'Demand Draft',
    value: ReconciliationtatusType.DemandDraft,
    color: 'primary' as LabelColor,
    component: (props: any) => <DemandDraftTable {...props} />,
  },
  {
    label: 'Bank Transfer',
    value: ReconciliationtatusType.BankTransfer,
    color: 'success' as LabelColor,
    component: (props: any) => <BankTransferTable {...props} />,
  },
];

const FinanceReconciliation = () => {
  // Tab state
  const [searchParams, setSearchParams] = useNewSearchParam<{ tab?: string }>();
  const activeTab = searchParams?.tab || ReconciliationtatusType.UPI;
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [date, setDate] = useState<Dayjs | null>(dayjs(currentYear?.startDate));

  // Dialogs
  const addOverviewDialog = useBoolean(false);
  const addDiscrepancyDialog = useBoolean(false);
  const addBankStatementsDialog = useBoolean(false);

  // Real tab counts from backend
  const selectedMonth = date ? date.month() + 1 : undefined;
  const selectedYear = date ? date.year() : undefined;

  const { data: tabCounts } = useGetReconciliationTabCountsQuery(
    {
      academicYearId: currentYear?.id ?? '',
      month: selectedMonth,
      year: selectedYear,
    },
    { skip: !currentYear?.id }
  );

  // Map tab counts to per-tab pending counts for badge display
  const counts = useMemo(
    () => ({
      [ReconciliationtatusType.Cheque]: tabCounts?.chequePending ?? 0,
      [ReconciliationtatusType.DemandDraft]: tabCounts?.demandDraftPending ?? 0,
      [ReconciliationtatusType.BankTransfer]: tabCounts?.bankTransferPending ?? 0,
      [ReconciliationtatusType.CreditCard]: tabCounts?.creditCardPending ?? 0,
      [ReconciliationtatusType.UPI]: tabCounts?.upiPending ?? 0,
      [ReconciliationtatusType.OnlineGateway]: tabCounts?.onlineGatewayPending ?? 0,
      [ReconciliationtatusType.Wallet]: tabCounts?.walletPending ?? 0,
    }),
    [tabCounts]
  );

  // Tabs config with counts
  const TABS = useMemo(
    () =>
      reconciliationTabConfig.map((tab) => ({
        ...tab,
        count: counts[tab.value] || 0,
      })),
    [counts]
  );

  // Find current tab/component
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === activeTab),
    [TABS, activeTab]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === activeTab),
    [TABS, activeTab]
  );
  const [isBack, setIsBack] = useState(false);

  // Redux state for unsaved changes
  const dispatch = useDispatch();
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [, setSelectedEntry] = useState<any>(null);

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
  const handleTabChange = useCallback(
    (event: React.SyntheticEvent, newValue: string | number) => {
      const newIndex = TABS.findIndex((tab) => tab.value === newValue);
      setIsBack(currentIndex > newIndex);
      setSearchParams({ tab: String(newValue) });
    },
    [TABS, currentIndex, setSearchParams]
  );

  // Extract month, year, academicYearId from date picker + global state
  const queryParams = useMemo(
    () => ({
      academicYearId: currentYear?.id ?? '',
      month: date ? date.month() + 1 : dayjs().month() + 1,
      year: date ? date.year() : dayjs().year(),
      paymentMethod: activeTab,
    }),
    [date, activeTab, currentYear?.id]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Reconciliation"
        description="This section helps you compare recorded transactions with bank statements to ensure financial records match, quickly identify matched, unmatched, and discrepant transactions."
        links={[
          { name: 'Finance', href: '/finance/dashboard/' },
          { name: 'Accounts', href: '/finance/reconciliation' },
          { name: 'Reconciliation' },
        ]}
      />
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, pb: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <DatePicker
            label="Month-Year"
            format="MMM-YYYY"
            value={date}
            views={['year', 'month']}
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
            onChange={(newDate) => setDate(newDate)}
            sx={{ maxWidth: '240px', width: '100%' }}
          />
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2, justifyContent: 'end' },
              flexGrow: 1,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                sx={{ fontSize: '12px' }}
                key={tab.value}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label} <Label color={tab.color}>{tab.count}</Label>
                  </Box>
                }
                value={tab.value}
              />
            ))}
          </Tabs>
        </Box>
      </Card>
      <FormSlider
        steps={TABS}
        isBackClick={isBack}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
            minHeight: 0,
          },
        }}
      >
        <Box sx={{ height: '100%' }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              addOverviewDialog={addOverviewDialog}
              addDiscrepancyDialog={addDiscrepancyDialog}
              addBankStatementsDialog={addBankStatementsDialog}
              handleClose={handleClose}
              queryParams={queryParams}
            />
          )}
        </Box>
      </FormSlider>
    </Box>
  );
};

export default FinanceReconciliation;
