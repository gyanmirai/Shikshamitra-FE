'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import React, { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Tab, Tabs, Paper } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ReconciliationtatusType } from 'src/enums/reconciliation-status-type';
import { FormSlider } from 'src/screens/student/enrollment/register/register-form';

import UpiTable from './Component/UpiTable';
import WalletTable from './Component/WalletTable';
import CreditCardTable from './Component/CreditCardTable';
import DemandDraftTable from './Component/DemandDraftTable';
import BankTransferTable from './Component/BankTransferTable';
import ChequeDetailsForm from './Component/ChequeDetailsTable';
import OnlineGatewayTable from './Component/OnlineGatewayTable';

// Example data with type property for demonstration
const exampleData = [
  // Cheque: 4 records
  { type: ReconciliationtatusType.Cheque },
  { type: ReconciliationtatusType.Cheque },
  { type: ReconciliationtatusType.Cheque },
  { type: ReconciliationtatusType.Cheque },
  // Demand Draft: 4 records
  { type: ReconciliationtatusType.DemandDraft },
  { type: ReconciliationtatusType.DemandDraft },
  { type: ReconciliationtatusType.DemandDraft },
  { type: ReconciliationtatusType.DemandDraft },
  // Bank Transfer: 2 records
  { type: ReconciliationtatusType.BankTransfer },
  { type: ReconciliationtatusType.BankTransfer },
  // Credit Card: 2 records
  { type: ReconciliationtatusType.CreditCard },
  { type: ReconciliationtatusType.CreditCard },
  // UPI: 2 records
  { type: ReconciliationtatusType.UPI },
  { type: ReconciliationtatusType.UPI },
  // Online Gateway: 2 records
  { type: ReconciliationtatusType.OnlineGateway },
  { type: ReconciliationtatusType.OnlineGateway },
  // Wallet: 2 records
  { type: ReconciliationtatusType.Wallet },
  { type: ReconciliationtatusType.Wallet },
];

// Map enum to label and component
const reconciliationTabConfig = [
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
  {
    label: 'Credit Card',
    value: ReconciliationtatusType.CreditCard,
    color: 'warning' as LabelColor,
    component: (props: any) => <CreditCardTable {...props} />,
  },
  {
    label: 'UPI',
    value: ReconciliationtatusType.UPI,
    color: 'error' as LabelColor,
    component: (props: any) => <UpiTable {...props} />,
  },
  {
    label: 'Online Gateway',
    value: ReconciliationtatusType.OnlineGateway,
    color: 'secondary' as LabelColor,
    component: (props: any) => <OnlineGatewayTable {...props} />,
  },
  {
    label: 'Wallet',
    value: ReconciliationtatusType.Wallet,
    color: 'default' as LabelColor,
    component: (props: any) => <WalletTable {...props} />,
  },
];

const FinanceReconciliation = () => {
  // Tab state
  // const tabs = useTabs(ReconciliationtatusType.All);
  const [params, setSearchParams] = useSearchParam({ tab: ReconciliationtatusType.Cheque });
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [date, setDate] = useState<Dayjs | null>(dayjs(currentYear?.startDate));

  // Dialogs
  const addOverviewDialog = useBoolean(false);
  const addDiscrepancyDialog = useBoolean(false);
  const addBankStatementsDialog = useBoolean(false);

  // Counts for each reconciliation type
  const counts = useMemo(
    () => ({
      [ReconciliationtatusType.All]: exampleData.length,
      [ReconciliationtatusType.Cheque]: exampleData.filter(
        (i) => i.type === ReconciliationtatusType.Cheque
      ).length,
      [ReconciliationtatusType.DemandDraft]: exampleData.filter(
        (i) => i.type === ReconciliationtatusType.DemandDraft
      ).length,
      [ReconciliationtatusType.BankTransfer]: exampleData.filter(
        (i) => i.type === ReconciliationtatusType.BankTransfer
      ).length,
      [ReconciliationtatusType.CreditCard]: exampleData.filter(
        (i) => i.type === ReconciliationtatusType.CreditCard
      ).length,
      [ReconciliationtatusType.UPI]: exampleData.filter(
        (i) => i.type === ReconciliationtatusType.UPI
      ).length,
      [ReconciliationtatusType.OnlineGateway]: exampleData.filter(
        (i) => i.type === ReconciliationtatusType.OnlineGateway
      ).length,
      [ReconciliationtatusType.Wallet]: exampleData.filter(
        (i) => i.type === ReconciliationtatusType.Wallet
      ).length,
    }),
    []
  );

  // Tabs config with counts
  const TABS = reconciliationTabConfig.map((tab) => ({
    ...tab,
    count: counts[tab.value] || 0,
  }));

  // Find current tab/component
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === params.tab),
    [TABS, params]
  );
  const currentIndex = useMemo(
    () => TABS.findIndex((tab) => tab.value === params.tab),
    [TABS, params]
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
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    const newIndex = TABS.findIndex((tab) => tab.value === newValue);
    setIsBack(currentIndex > newIndex);
    setSearchParams({ tab: newValue });
  };

  // Extract month and year from date picker
  const queryParams = useMemo(
    () => ({
      month: date ? date.format('MM') : dayjs().format('MM'),
      year: date ? date.format('YYYY') : dayjs().format('YYYY'),
      paymentMethod: params.tab,
    }),
    [date, params.tab]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Reconciliation"
        description="This section helps you compare recorded transactions with bank statements to ensure financial records match, quickly identify matched, unmatched, and discrepant transactions."
        links={[
          { name: 'Finance', href: '/finance/dashboard/' },
          { name: 'Reconciliation', href: '/finance/reconciliation' },
        ]}
        sx={{ mb: 2 }}
      />
      <Paper
        sx={{
          boxShadow: 0,
          borderRadius: 2,
          background: '#fff',
          // p: 2,
        }}
        elevation={2}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            p: 1,
            gap: 2,
            borderRadius: '8px',
            bgcolor: 'background.paper',
            boxShadow: 'var(--shadows-3)',
          }}
        >
          <DatePicker
            label="Month-Year"
            format="MMM-YYYY"
            value={date}
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
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
            value={params.tab}
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
      </Paper>
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
