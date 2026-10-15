'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Tab, Card, Tabs } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import { useNewSearchParam } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { ReconciliationStatusType } from 'src/enums/reconciliation-status-type';
import { useGetReconciliationTabCountsQuery } from 'src/redux/finance/reconciliation';

import UpiTable from './Component/UpiTable';
import DebitCardTable from './Component/DebitCardTable';
import CreditCardTable from './Component/CreditCardTable';
import DemandDraftTable from './Component/DemandDraftTable';
import BankTransferTable from './Component/BankTransferTable';
import ChequeDetailsForm from './Component/ChequeDetailsTable';
import { academicMonthOptions, defaultAcademicMonth } from '../accounts/Registers/academicMonths';

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
];

const FinanceReconciliation = () => {
  // Tab state
  const [searchParams, setSearchParams] = useNewSearchParam<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState(ReconciliationStatusType.Cheque);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicStartDate = currentYear?.startDate;
  const academicEndDate = currentYear?.endDate;
  const monthOptions = useMemo(
    () =>
      academicStartDate && academicEndDate
        ? academicMonthOptions({ startDate: academicStartDate, endDate: academicEndDate })
        : [],
    [academicStartDate, academicEndDate]
  );
  const [monthSelection, setMonthSelection] = useState({
    yearId: currentYear?.id,
    value: defaultAcademicMonth(monthOptions),
  });
  const monthKey =
    monthSelection.yearId === currentYear?.id &&
    monthOptions.some((option) => option.value === monthSelection.value)
      ? monthSelection.value
      : defaultAcademicMonth(monthOptions);
  const date = monthOptions.length ? dayjs(`${monthKey}-01`) : null;
  React.useEffect(() => {
    setMonthSelection({ yearId: currentYear?.id, value: defaultAcademicMonth(monthOptions) });
  }, [currentYear?.id, monthOptions]);

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
    }),
    [date, activeTab, currentYear?.id]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Verify pending receipts"
        description="Confirm or reject provisional payment receipts using the instrument evidence. Bank statement matching is a separate Accounts process."
        links={[
          { name: 'Finance', href: '/finance/dashboard/' },
          { name: 'Accounts', href: '/finance/reconciliation' },
          { name: 'Reconciliation' },
        ]}
      />
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Box display="flex" gap={2} alignItems="center">
            <CustomSelect
              label="Month"
              value={monthOptions.length ? monthKey : ''}
              options={monthOptions}
              disabled={!monthOptions.length}
              onChange={(value) =>
                setMonthSelection({ yearId: currentYear?.id, value: String(value) })
              }
              formControlProps={{ sx: { width: 240 } }}
            />
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
