'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import { useNewSearchParam } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Tab, Card, Tabs, Button, Typography } from '@mui/material';
import { ReconciliationStatusType } from 'src/enums/reconciliation-status-type';
import {
  useGetReconciliationByHeadQuery,
  useGetReconciliationTabCountsQuery,
} from 'src/redux/finance/reconciliation';

import UpiTable from './Component/UpiTable';
import HeadSelector from '../components/HeadSelector';
import DebitCardTable from './Component/DebitCardTable';
import CreditCardTable from './Component/CreditCardTable';
import DemandDraftTable from './Component/DemandDraftTable';
import BankTransferTable from './Component/BankTransferTable';
import ChequeDetailsForm from './Component/ChequeDetailsTable';

// Map enum to label and component
const reconciliationTabConfig = [
  {
    label: 'Cheque',
    value: ReconciliationStatusType.Cheque,
    color: 'info' as LabelColor,
    component: (props: any) => <ChequeDetailsForm {...props} />,
  },
  {
    label: 'Demand Draft',
    value: ReconciliationStatusType.DemandDraft,
    color: 'primary' as LabelColor,
    component: (props: any) => <DemandDraftTable {...props} />,
  },
  {
    label: 'Bank Transfer',
    value: ReconciliationStatusType.BankTransfer,
    color: 'success' as LabelColor,
    component: (props: any) => <BankTransferTable {...props} />,
  },
  {
    label: 'Credit Card',
    value: ReconciliationStatusType.CreditCard,
    color: 'warning' as LabelColor,
    component: (props: any) => <CreditCardTable {...props} />,
  },
  {
    label: 'Debit Card',
    value: ReconciliationStatusType.DebitCard,
    color: 'warning' as LabelColor,
    component: (props: any) => <DebitCardTable {...props} />,
  },
  {
    label: 'UPI',
    value: ReconciliationStatusType.UPI,
    color: 'error' as LabelColor,
    component: (props: any) => <UpiTable {...props} />,
  },
  {
    label: 'In-Transit',
    value: 99, // Custom value for In-Transit
    color: 'default' as LabelColor,
    component: (props: any) => <div>In-Transit Table Placeholder</div>,
  },
];

const FinanceReconciliation = () => {
  // Tab state
  const [searchParams, setSearchParams] = useNewSearchParam<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState(ReconciliationStatusType.Cheque);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [date, setDate] = useState<Dayjs | null>(dayjs(currentYear?.startDate));
  const [selectedBankHead, setSelectedBankHead] = useState<string>('');

  // Sync activeTab with URL params on initial load and when searchParams change
  React.useEffect(() => {
    if (searchParams?.tab) {
      setActiveTab(Number(searchParams.tab));
    }
  }, [searchParams?.tab]);

  // Dialogs
  const addOverviewDialog = useBoolean(false);
  const addDiscrepancyDialog = useBoolean(false);
  const addBankStatementsDialog = useBoolean(false);

  // Real tab counts from backend
  const selectedMonth = date ? date.month() + 1 : undefined;
  const selectedYear = date ? date.year() : undefined;
  const { data: tabCounts, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetReconciliationTabCountsQuery,
    params: {
      academicYearId: currentYear?.id ?? '',
      month: selectedMonth,
      year: selectedYear,
    },
    options: { skip: !currentYear?.id },
  });

  // Map tab counts to per-tab stats (pending, approved, rejected, total)
  const tabStats = useMemo(
    () =>
      ({
        [ReconciliationStatusType.Cash]: {
          pending: 0,
          approved: 0,
          rejected: 0,
        },
        [ReconciliationStatusType.Cheque]: {
          pending: tabCounts?.chequePending ?? 0,
          approved: tabCounts?.chequeApproved ?? 0,
          rejected: tabCounts?.chequeRejected ?? 0,
        },
        [ReconciliationStatusType.DemandDraft]: {
          pending: tabCounts?.demandDraftPending ?? 0,
          approved: tabCounts?.demandDraftApproved ?? 0,
          rejected: tabCounts?.demandDraftRejected ?? 0,
        },
        [ReconciliationStatusType.BankTransfer]: {
          pending: tabCounts?.bankTransferPending ?? 0,
          approved: tabCounts?.bankTransferApproved ?? 0,
          rejected: tabCounts?.bankTransferRejected ?? 0,
        },
        [ReconciliationStatusType.CreditCard]: {
          pending: tabCounts?.creditCardPending ?? 0,
          approved: tabCounts?.creditCardApproved ?? 0,
          rejected: tabCounts?.creditCardRejected ?? 0,
        },
        [ReconciliationStatusType.DebitCard]: {
          pending: tabCounts?.debitCardPending ?? 0,
          approved: tabCounts?.debitCardApproved ?? 0,
          rejected: tabCounts?.debitCardRejected ?? 0,
        },
        [ReconciliationStatusType.UPI]: {
          pending: tabCounts?.upiPending ?? 0,
          approved: tabCounts?.upiApproved ?? 0,
          rejected: tabCounts?.upiRejected ?? 0,
        },
      }) as Record<number, { pending: number; approved: number; rejected: number }>,
    [tabCounts]
  );

  // Fetch head-based reconciliation data
  const { data: headReconciliationData } = useGetReconciliationByHeadQuery(
    {
      headId: selectedBankHead,
      academicYearId: currentYear?.id ?? '',
      month: selectedMonth,
      year: selectedYear,
    },
    { skip: !selectedBankHead }
  );

  const bookBalance = headReconciliationData?.bookBalance ?? 0;
  const reconciledBalance = headReconciliationData?.reconciledBalance ?? 0;
  const difference = bookBalance - reconciledBalance;

  // Tabs config with stats
  const TABS = useMemo(
    () =>
      reconciliationTabConfig.map((tab) => {
        const stats = tabStats[tab.value] ?? { pending: 0, approved: 0, rejected: 0 };
        const processed = stats.approved + stats.rejected;
        const total = processed + stats.pending;
        return {
          ...tab,
          stats,
          processed,
          total,
        };
      }),
    [tabStats]
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
      const newTabValue = Number(newValue);
      const newIndex = TABS.findIndex((tab) => tab.value === newTabValue);
      setIsBack(currentIndex > newIndex);
      setActiveTab(newTabValue);
      setSearchParams({ tab: String(newTabValue) });
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
      headId: selectedBankHead,
    }),
    [date, activeTab, currentYear?.id, selectedBankHead]
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
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" gap={2} alignItems="center">
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
            <Box width={240}>
              <HeadSelector
                headType="Bank-Cash"
                label="Bank Account Head"
                value={selectedBankHead}
                onChange={(val: any) => setSelectedBankHead(val)}
              />
            </Box>
            {selectedBankHead && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  shikshaMitraToast.info({ message: 'Create posting from statement logic here' });
                }}
              >
                + Add Bank Charge/Interest
              </Button>
            )}
          </Box>
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
                key={tab.value}
                sx={{ fontSize: '12px' }}
                label={
                  <CustomTooltip
                    title={
                      <Box sx={{ fontSize: '12px', lineHeight: 1.8 }}>
                        <Box>
                          ✅ Approved: <strong>{tab.stats.approved}</strong>
                        </Box>
                        <Box>
                          ❌ Rejected: <strong>{tab.stats.rejected}</strong>
                        </Box>
                        <Box>
                          ⏳ Pending: <strong>{tab.stats.pending}</strong>
                        </Box>
                        <Box
                          sx={{ borderTop: '1px solid rgba(255,255,255,0.3)', mt: 0.5, pt: 0.5 }}
                        >
                          📊 Total: <strong>{tab.total}</strong>
                        </Box>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                      {tab.label}
                      <Label color={tab.color}>
                        {tab.processed}/{tab.total}
                      </Label>
                    </Box>
                  </CustomTooltip>
                }
                value={tab.value}
              />
            ))}
          </Tabs>
        </Box>

        {/* Summary Cards */}
        {selectedBankHead && (
          <Box display="flex" gap={2} mt={2}>
            <Card
              sx={{
                p: 2,
                flex: 1,
                bgcolor: 'primary.lighter',
                borderColor: 'primary.main',
                border: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Book Balance
              </Typography>
              <Typography variant="h6">₹{bookBalance.toLocaleString()}</Typography>
            </Card>
            <Card
              sx={{
                p: 2,
                flex: 1,
                bgcolor: 'success.lighter',
                borderColor: 'success.main',
                border: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Reconciled Balance
              </Typography>
              <Typography variant="h6">₹{reconciledBalance.toLocaleString()}</Typography>
            </Card>
            <Card
              sx={{
                p: 2,
                flex: 1,
                bgcolor: difference === 0 ? 'info.lighter' : 'error.lighter',
                borderColor: difference === 0 ? 'info.main' : 'error.main',
                border: 1,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Difference
              </Typography>
              <Typography variant="h6">₹{Math.abs(difference).toLocaleString()}</Typography>
            </Card>
          </Box>
        )}
      </Card>
      <Box sx={{ height: '100%', flex: 1, overflow: 'hidden' }}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
            key={activeTab}
            addOverviewDialog={addOverviewDialog}
            addDiscrepancyDialog={addDiscrepancyDialog}
            addBankStatementsDialog={addBankStatementsDialog}
            handleClose={handleClose}
            queryParams={queryParams}
          />
        )}
      </Box>
    </Box>
  );
};

export default FinanceReconciliation;
