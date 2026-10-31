'use client';

import type { RefObject } from 'react';
import type { TabProps } from '@mui/material';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { ReconciliationVerificationStatus } from 'src/types/finance/reconciliation';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Tab, Card, Tabs } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { useNewSearchParam } from 'src/hooks/use-search-param';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useRef, useMemo, useState, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
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

function ReconciliationSummaryTab({
  methodLabel,
  stats,
  color,
  boundaryRef,
  ...tabProps
}: TabProps & {
  methodLabel: string;
  stats: { pending: number; approved: number; rejected: number };
  color: LabelColor;
  boundaryRef: RefObject<HTMLDivElement | null>;
}) {
  const processed = stats.approved + stats.rejected;
  const total = stats.pending + processed;

  return (
    <CustomTooltip
      describeChild
      arrow
      placement="right-start"
      slotProps={{
        popper: () => ({
          modifiers: [
            {
              name: 'flip',
              options: {
                boundary: boundaryRef.current ?? undefined,
                padding: 8,
                fallbackPlacements: ['left-start'],
              },
            },
            {
              name: 'preventOverflow',
              options: { boundary: boundaryRef.current ?? undefined, padding: 8, altAxis: true, tether: false },
            },
          ],
        }),
      }}
      title={
        <Box sx={{ minWidth: 160, p: 0.5, typography: 'caption' }}>
          <Box sx={{ fontWeight: 'fontWeightSemiBold', mb: 0.5 }}>{methodLabel} status</Box>
          {([
            ['Pending', stats.pending],
            ['Approved', stats.approved],
            ['Rejected', stats.rejected],
            ['Total', total],
          ] as const).map(([label, count]) => (
            <Box
              key={label}
              sx={{
                display: 'flex', justifyContent: 'space-between', gap: 2,
                ...(label === 'Total' && { borderTop: 1, borderColor: 'divider', mt: 0.5, pt: 0.5 }),
              }}
            >
              <span>{label}</span><strong>{count}</strong>
            </Box>
          ))}
        </Box>
      }
    >
      <Tab
        {...tabProps}
        sx={{ fontSize: '12px' }}
        label={
          <Box display="flex" justifyContent="center" gap={1} alignItems="center">
            {methodLabel}
            <Label color={color}>{processed}/{total}</Label>
          </Box>
        }
      />
    </CustomTooltip>
  );
}

const FinanceReconciliation = () => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  // Tab state
  const [searchParams, setSearchParams] = useNewSearchParam<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState(ReconciliationStatusType.Cheque);
  const [verificationStatus, setVerificationStatus] = useState('All');
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
    const requestedTab = Number(searchParams?.tab);
    setActiveTab(
      reconciliationTabConfig.some((tab) => tab.value === requestedTab)
        ? requestedTab
        : ReconciliationStatusType.Cheque
    );
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
  const [, setSelectedEntry] = useState<any>(null);

  /**
   * Handles closing of the dialog (for add/edit/check actions)
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    addDiscrepancyDialog.value,
    () => {
      addDiscrepancyDialog.onFalse();
      setSelectedEntry(null);
    }
  );

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
      status: verificationStatus === 'All' ? undefined : Number(verificationStatus) as ReconciliationVerificationStatus,
    }),
    [date, activeTab, currentYear?.id, verificationStatus]
  );

  return (
    <Box ref={workspaceRef} sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {discardConfirmation}
      <CustomBreadcrumbs
        description="Cash receipts are issued immediately. Approve non-cash provisional receipts after checking payment evidence to issue linked receipts. Bank statement matching is a separate Accounts process."
        heading="Reconciliation"

        links={[
          { name: 'Finance', href: '/finance/dashboard/' },
          { name: 'Accounts', href: '/finance/reconciliation' },
          { name: 'Reconciliation' },
        ]}
      />
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 1, pt: 1, mb: 1 }}>
        <Box display="flex" justifyContent="space-between" sx={{ flexDirection: { xs: 'column', lg: 'row' }, minWidth: 0 }}>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
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
            <CustomSelect
              label="Verification status"
              value={verificationStatus}
              options={[
                { label: 'All statuses', value: 'All' },
                { label: 'Pending', value: '1' },
                { label: 'Approved', value: '2' },
                { label: 'Rejected', value: '3' },
              ]}
              onChange={(value) => setVerificationStatus(String(value))}
              formControlProps={{ sx: { width: 180 } }}
            />
          </Box>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
              minWidth: 0,
            }}
          >
            {TABS.map((tab) => (
              <ReconciliationSummaryTab
                key={tab.value}
                methodLabel={tab.label}
                stats={tab.stats}
                color={tab.color}
                boundaryRef={workspaceRef}
                value={tab.value}
              />
            ))}
          </Tabs>
        </Box>
      </Card>
      <Box sx={{ minHeight: 0, flex: 1, overflow: 'hidden' }}>
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
