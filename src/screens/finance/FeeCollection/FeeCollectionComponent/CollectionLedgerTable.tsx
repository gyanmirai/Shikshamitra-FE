'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useState, useContext } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CancelButton from 'src/components/cancel-button';
import { formatNumber } from 'src/utils/formate_number';
import { Label, labelClasses } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseDateOnly, formatDateOnly } from 'src/utils/date-only';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { DetailGrid, DetailField, DetailSection } from 'src/screens/finance/components/detail-view';
import {
  Box,
  Stack,
  Checkbox,
  Accordion,
  Typography,
  DialogActions,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  FeeMonth,
  FeeCollectionStatusType,
  feeInstallmentStatusLabel,
  chargeCollectionStatusLabel,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import FeeWaiverToggle from './FeeWaiverToggle';
import { FeeCollectionWaiverContext } from './feeCollectionContext';
import { selectionItemKey, isLedgerItemCollectible } from './feeLedgerSelection';
import { roundUpToRupee, safeRoundingDifference } from './preview/paymentAllocationUtils';
import { toPeriod, REFUNDED_TO_DATE_HELP, REFUND_AWAITING_PAYOUT_HELP } from './FeeLedgerShared';

import type { FeeLedgerListProps } from './FeeLedgerList';
import type { IFeeCharge, SelectedItem, MonthWiseFeeItem } from '../Components/type';

export type CollectionLayout = 'ledger' | 'period' | 'wide';

type LedgerRow = MonthWiseFeeItem & {
  id: string;
  period: string;
  periodLabel: string;
  billingPeriod?: string;
  charge?: IFeeCharge;
  outstanding: number;
};

const lateFeeAppliedPeriod = (charge: IFeeCharge) =>
  charge.lateFeeAppliedIntervals?.length
    ? charge.lateFeeAppliedIntervals
        .map(({ fromDate, throughDate }) => {
          const from = formatDateOnly(fromDate, 'D MMMM YYYY');
          const through = formatDateOnly(throughDate, 'D MMMM YYYY');
          return from === through ? from : `${from} to ${through}`;
        })
        .join('; ')
    : 'Historical date range is unavailable because it was not recorded for this assessment.';

const lateFeeAppliedDays = (charge: IFeeCharge) =>
  charge.lateFeeAppliedDays != null
    ? `${charge.lateFeeAppliedDays} ${charge.lateFeeAppliedDays === 1 ? 'overdue day' : 'overdue days'} considered; grace and exception days are excluded.`
    : 'Grace and policy exception days are excluded from the displayed range.';

const getDaysOverdue = (row?: LedgerRow) => {
  if (!row || row.charge || row.status !== FeeCollectionStatusType.Overdue) return null;
  if (row.daysOverdue != null && Number.isInteger(row.daysOverdue) && row.daysOverdue > 0)
    return row.daysOverdue;

  // Older collect-form responses provide the due date without an overdue count.
  const dueDate = parseDateOnly(row.dueDate);
  if (!dueDate) return null;
  const days = dayjs().startOf('day').diff(dueDate.startOf('day'), 'day');
  return days > 0 ? days : null;
};

/** One embedded student ledger. Filtering is owned by the collect form; sorting never changes allocation order. */
export default function CollectionLedgerTable({
  data,
  activeTab,
  selectedItems,
  charges,
  chargesData = [],
  onSelectionChange,
  onChargesChange,
  onLedgerSelectionChange,
  deselectPartiallyFundedGroups = false,
  year = new Date().getFullYear(),
  hasActiveFilters,
  layout,
  groupByInstallment,
  oneTimeFeeHeadIds,
  getAllocatedAmount,
  selectedFeeCandidates = selectedItems,
  selectedChargeCandidates = charges,
}: FeeLedgerListProps & {
  layout: CollectionLayout;
  onPeriodFocus?: (period: string) => void;
  groupByInstallment?: boolean;
  oneTimeFeeHeadIds?: ReadonlySet<string>;
  getAllocatedAmount?: (item: SelectedItem | IFeeCharge) => number;
  selectedFeeCandidates?: SelectedItem[];
  selectedChargeCandidates?: string[];
  onLedgerSelectionChange?: (items: SelectedItem[], chargeIds: string[], removing: boolean) => void;
  deselectPartiallyFundedGroups?: boolean;
}) {
  const allowWaivers = useContext(FeeCollectionWaiverContext);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const rows: LedgerRow[] = data.monthWise.flatMap((group) =>
    group.items.map((item) => {
      const period = toPeriod(group.month, group.year ?? year);
      const periodLabel = `${FeeMonth[group.month]} ${group.year ?? year}`;
      const start = parseDateOnly(item.coverageStartDate);
      const end = parseDateOnly(item.coverageEndDate);
      const billingPeriod =
        start && end
          ? start.isSame(end, 'month')
            ? start.format('MMMM YYYY')
            : `${start.format('MMM YYYY')} – ${end.format('MMM YYYY')}`
          : periodLabel;
      return {
        ...item,
        id: `fee:${item.dueFeeId ?? `${item.feeHeadId}:${period}`}`,
        period,
        periodLabel,
        billingPeriod,
        outstanding: roundUpToRupee(item.due) + (item.lateFeeAmount ?? 0),
      };
    })
  );
  if (activeTab === 'by-fee-head' && layout !== 'period')
    rows.sort(
      (a, b) =>
        Number(Boolean(oneTimeFeeHeadIds?.has(b.feeHeadId))) -
          Number(Boolean(oneTimeFeeHeadIds?.has(a.feeHeadId))) ||
        a.feeHeadName.localeCompare(b.feeHeadName) ||
        a.period.localeCompare(b.period)
    );
  else rows.sort((a, b) => a.period.localeCompare(b.period));
  rows.push(
    ...chargesData.map((charge) => ({
      id: `charge:${charge.chargeId}`,
      charge,
      feeHeadId: '',
      feeHeadName: charge.chargeName,
      period: '',
      periodLabel: charge.dueDate ?? '—',
      dueDate: charge.dueDate,
      installmentLabel: charge.isSystemGenerated ? 'System generated' : 'Additional charge',
      total: charge.total ?? charge.amount,
      paid: charge.paid ?? 0,
      due: charge.amount,
      status: charge.status as MonthWiseFeeItem['status'],
      reconciliationAmount: charge.reconciliationAmount,
      outstanding: charge.amount,
    }))
  );
  const collectible = (row: LedgerRow) =>
    isLedgerItemCollectible({ due: row.due, lateFeeAmount: row.lateFeeAmount, status: row.status });
  const isSelected = (row: LedgerRow) =>
    row.charge
      ? charges.includes(row.charge.chargeId)
      : selectedItems.some((item) =>
          row.dueFeeId
            ? item.dueFeeId === row.dueFeeId
            : !item.dueFeeId && item.feeHeadId === row.feeHeadId && item.period === row.period
        );
  const asSelection = (row: LedgerRow): SelectedItem => ({
    dueFeeId: row.dueFeeId,
    feeHeadId: row.feeHeadId,
    period: row.period,
    dueAmount: roundUpToRupee(row.due),
    originalDueAmount: row.due,
    roundingAdjustment: safeRoundingDifference(row.due, roundUpToRupee(row.due)),
    lateFeeAmount: row.lateFeeAmount,
    installmentLabel: row.installmentLabel,
  });
  const toggleRows = (candidates: LedgerRow[], isGroup = false) => {
    const eligible = candidates.filter(collectible);
    if (!eligible.length) return;
    const remove =
      eligible.every(isSelected) ||
      (isGroup && deselectPartiallyFundedGroups && eligible.some(isSelected));
    const feeRows = eligible.filter((row) => !row.charge);
    const feeSelections = feeRows.map(asSelection);
    const keys = new Set(feeSelections.map(selectionItemKey));
    const candidateKeys = new Set(selectedItems.map(selectionItemKey));
    const nextFees = remove
      ? selectedItems.filter((item) => !keys.has(selectionItemKey(item)))
      : [
          ...selectedItems,
          ...feeSelections.filter((item) => !candidateKeys.has(selectionItemKey(item))),
        ];
    const chargeRows = eligible.filter((row) => row.charge);
    const ids = new Set(chargeRows.map((row) => row.charge!.chargeId));
    const nextCharges = remove
      ? charges.filter((id) => !ids.has(id))
      : [...new Set([...charges, ...ids])];
    if (onLedgerSelectionChange) {
      onLedgerSelectionChange(nextFees, nextCharges, remove);
    } else {
      if (feeRows.length) onSelectionChange(nextFees);
      if (chargeRows.length) onChargesChange(nextCharges);
    }
  };
  const groupCheckbox = (candidates: LedgerRow[], label: string) => {
    const eligible = candidates.filter(collectible);
    const count = eligible.filter(isSelected).length;
    // Settled rows render checked, so a nonempty settled group must match them.
    return (
      <Checkbox
        size="small"
        checked={candidates.length > 0 && count === eligible.length}
        indeterminate={count > 0 && count < eligible.length}
        disabled={!eligible.length}
        inputProps={{ 'aria-label': label }}
        onChange={() => toggleRows(candidates, true)}
      />
    );
  };
  const feeRows = rows.filter((row) => !row.charge);
  const groups = Object.values(
    rows.reduce<Record<string, { id: string; title: string; items: LedgerRow[] }>>(
      (result, row) => {
        const byPeriod = layout === 'period' || activeTab === 'by-month';
        const byInstallment = groupByInstallment && byPeriod;
        const installmentKey =
          row.installmentId ??
          Array.from(`${row.dueDate ?? row.period}|${row.installmentLabel ?? row.period}`)
            .map((character) => character.codePointAt(0)!.toString(16))
            .join('-');
        const id = row.charge
          ? 'additional-charges'
          : byInstallment
            ? `installment-${installmentKey}`
            : byPeriod
              ? row.period
              : row.feeHeadId;
        const title = row.charge
          ? 'Additional Charges'
          : byInstallment
            ? row.installmentLabel || row.periodLabel
            : byPeriod
              ? row.periodLabel
              : row.feeHeadName;
        result[id] ??= { id, title, items: [] };
        result[id].items.push(row);
        return result;
      },
      {}
    )
  );
  const columns: IColumn[] = [
    {
      id: 'selection',
      label: groupCheckbox(rows, 'Select all visible collectible fees and charges'),
      width: 48,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_value, row) => (
        <Checkbox
          size="small"
          checked={isSelected(row as LedgerRow) || !collectible(row as LedgerRow)}
          disabled={!collectible(row as LedgerRow)}
          inputProps={{ 'aria-label': `Select ${row.feeHeadName}, ${row.periodLabel}` }}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleRows([row as LedgerRow])}
        />
      ),
    },
    {
      id: 'feeHeadName',
      label: 'Fee Head',
      minWidth: 180,
      isFilter: false,
      render: (_value, row) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {row.feeHeadName}
          </Typography>
          {row.charge && row.charge.sourceType !== 'LateFee' && !row.charge.isSystemGenerated && (
            <Typography variant="caption" color="text.secondary">
              Additional Charges
            </Typography>
          )}
          {!row.charge && row.paymentTermName && (
            <Typography variant="caption" color="text.secondary">
              {row.paymentTermName}
            </Typography>
          )}
          {oneTimeFeeHeadIds?.has(row.feeHeadId) && <Label sx={{ ml: 1 }}>One time</Label>}
        </Box>
      ),
    },
    {
      id: 'period',
      label: 'Fee Period',
      minWidth: 150,
      isFilter: false,
      sortValue: (_value, row) => row.coverageStartDate ?? row.period,
      render: (_value, row) => <Typography variant="body2">{row.billingPeriod}</Typography>,
    },
    {
      id: 'dueDate',
      label: 'Due Date',
      minWidth: 125,
      isFilter: false,
      render: (_value, row) => (
        <Typography variant="body2">{formatDateOnly(row.dueDate, 'D MMM YYYY')}</Typography>
      ),
    },
    ...(['total', 'paid', 'due'] as const).map((id, index): IColumn => ({
      id,
      label: ['Total', 'Paid', 'Pending'][index],
      align: 'right',
      minWidth: 100,
      isFilter: false,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatNumber(value, 'INR')}
        </Typography>
      ),
    })),
    {
      id: 'status',
      label: 'Status',
      sticky: true,
      stickyPosition: 'right',
      width: 110,
      isFilter: false,
      render: (_value, row) => (
        <Label
          color={
            FeeCollectionStatusTypeColors[row.status as MonthWiseFeeItem['status']] ?? 'default'
          }
        >
          {row.charge
            ? chargeCollectionStatusLabel(row.status)
            : feeInstallmentStatusLabel(row.status)}
        </Label>
      ),
    },
  ];
  const detail = rows.find((row) => row.id === detailId);
  const daysOverdue = getDaysOverdue(detail);
  const closeDetail = () => setDetailId(null);
  const waiverApplied = (remainingAmount = 0, row = detail) => {
    if (
      row?.charge &&
      remainingAmount === 0 &&
      selectedChargeCandidates.includes(row.charge.chargeId)
    ) {
      onChargesChange(selectedChargeCandidates.filter((id) => id !== row.charge!.chargeId));
    } else if (row && !row.charge) {
      const key = selectionItemKey(asSelection(row));
      if (selectedFeeCandidates.some((item) => selectionItemKey(item) === key))
        onSelectionChange(
          selectedFeeCandidates.map((item) =>
            selectionItemKey(item) === key ? { ...item, lateFeeAmount: remainingAmount } : item
          )
        );
    }
    closeDetail();
  };

  return (
    <Stack
      role="region"
      aria-label="Fee ledger"
      spacing={1}
      sx={{ flex: 1, minHeight: 0, minWidth: 0 }}
    >
      <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pb: 1 }}>
        {groups.map((group, index) => {
          const groupedByFeeHead =
            activeTab === 'by-fee-head' && layout !== 'period' && group.id !== 'additional-charges';
          const paymentTermNames = groupedByFeeHead
            ? [...new Set(group.items.map((row) => row.paymentTermName).filter(Boolean))]
            : [];
          const selected = group.items.filter(isSelected);
          const selectedTotal = selected.reduce(
            (sum, row) =>
              sum + (getAllocatedAmount?.(row.charge ?? asSelection(row)) ?? row.outstanding),
            0
          );
          const outstanding = group.items
            .filter(collectible)
            .reduce((sum, row) => sum + row.outstanding, 0);
          const expanded = !(collapsedGroups[group.id] ?? (index !== 0 && !selected.length));
          const groupColumns: IColumn[] = columns
            .filter(
              (column) =>
                (column.id !== 'feeHeadName' || !groupedByFeeHead) &&
                (column.id !== 'period' || group.id !== 'additional-charges')
            )
            .map((column) => ({
              ...column,
              ...(group.id === 'additional-charges' &&
                column.id === 'paid' && { label: 'Collected' }),
              ...(column.id === 'selection' && {
                label: groupCheckbox(group.items, `Select all ${group.title}`),
              }),
              cellSx: { ...column.cellSx, py: 1.5 },
              headerSx: { py: 1 },
            }));
          if (group.id === 'additional-charges') {
            const chargeAmountColumns: IColumn[] = [
              {
                cellSx: { textAlign: 'right' as const },
                id: 'waived',
                label: 'Waived',
                render: (_value, row) => formatNumber(row.charge?.waivedAmount ?? 0, 'INR'),
              },
            ];
            groupColumns.splice(
              groupColumns.findIndex((column) => column.id === 'due'),
              0,
              ...chargeAmountColumns.map((column) => ({
                ...column,
                minWidth: 110,
                isFilter: false,
                isSort: false,
                cellSx: { ...column.cellSx, py: 1.5 },
              }))
            );
            if (allowWaivers)
              groupColumns.push({
                id: 'waiver',
                label: 'Waiver',
                width: 120,
                sticky: true,
                stickyPosition: 'right',
                isFilter: false,
                isSort: false,
                excludeFromExport: true,
                render: (_value, item) => {
                  const row = item as LedgerRow;
                  return row.charge &&
                    row.charge.canWaive !== false &&
                    collectible(row) &&
                    row.due > 0 ? (
                    <FeeWaiverToggle
                      sourceType={row.charge.sourceType}
                      sourceId={row.charge.sourceId || row.charge.chargeId}
                      sourceName={row.feeHeadName}
                      remainingAmount={row.due}
                      canWaive={row.charge.canWaive}
                      onApplied={(result) => waiverApplied(result?.remainingAmount, row)}
                    />
                  ) : null;
                },
              });
          }
          return (
            <Accordion
              key={group.id}
              expanded={expanded}
              onChange={() =>
                setCollapsedGroups((current) => ({ ...current, [group.id]: expanded }))
              }
              disableGutters
              slots={{ heading: 'div' }}
              sx={{
                flexShrink: 0,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '&:first-of-type, &:last-of-type': { borderRadius: 2 },
              }}
            >
              <Stack direction="row" alignItems="center" sx={{ px: 1.5 }}>
                {groupCheckbox(group.items, `Select ${group.title}`)}
                <AccordionSummary
                  id={`fee-group-${group.id}`}
                  aria-controls={`fee-group-content-${group.id}`}
                  expandIcon={<Iconify icon="eva:chevron-down-fill" width={22} />}
                  sx={{
                    minWidth: 0,
                    flex: 1,
                    px: 1,
                    py: 0.5,
                    '& .MuiAccordionSummary-content': { minWidth: 0 },
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'center' }}
                    spacing={1}
                    sx={{ width: 1, minWidth: 0, pr: 1 }}
                  >
                    <Typography
                      component="h3"
                      variant="subtitle1"
                      sx={{ overflowWrap: 'anywhere' }}
                    >
                      {group.title}
                    </Typography>
                    {paymentTermNames.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {paymentTermNames.join(' · ')}
                      </Typography>
                    )}
                    {groupedByFeeHead && oneTimeFeeHeadIds?.has(group.id) && (
                      <Label sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>One time</Label>
                    )}
                    {selected.length ? (
                      <Label
                        color="success"
                        sx={{
                          height: 'auto',
                          typography: 'body2',
                          fontWeight: 700,
                          whiteSpace: 'normal',
                          flexShrink: 0,
                          py: 0.5,
                          alignSelf: { xs: 'flex-start', sm: 'center' },
                        }}
                      >
                        {formatNumber(selectedTotal, 'INR')} ({selected.length} selected)
                      </Label>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: { sm: 'auto !important' } }}
                      >
                        {group.items.length} {group.items.length === 1 ? 'fee' : 'fees'} ·{' '}
                        {formatNumber(outstanding, 'INR')}
                      </Typography>
                    )}
                  </Stack>
                </AccordionSummary>
              </Stack>
              <AccordionDetails
                id={`fee-group-content-${group.id}`}
                sx={{ px: { xs: 1, sm: 2 }, pt: 0, pb: 2 }}
              >
                <CustomizableTable
                  getRowAction={(row) => ({
                    label: `Open ${row.feeHeadName}, ${row.periodLabel}`,
                    onClick: () => {
                      setDetailId(row.id);
                    },
                  })}
                  tableId={`collect-fees-group-${group.id}`}
                  tableTitle={group.title}
                  columns={groupColumns}
                  data={group.items}
                  showToolbar={false}
                  isPagination={false}
                  isSearch={false}
                  isFilter={false}
                  isShowedDense={false}
                  rowProps={(row) => ({
                    selected: isSelected(row as LedgerRow),
                    sx:
                      !row.charge && row.status === FeeCollectionStatusType.Paid
                        ? {
                            [`& > td:not(:first-child), & .${labelClasses.root}`]: {
                              textDecoration: 'line-through',
                            },
                          }
                        : undefined,
                  })}
                  wrapperProps={{
                    sx: {
                      minWidth: 0,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      overflow: 'hidden',
                    },
                  }}
                  tableContainerProps={{ sx: { height: 'auto' } }}
                />
              </AccordionDetails>
            </Accordion>
          );
        })}
        {!rows.length && (
          <Stack
            alignItems="center"
            spacing={1}
            sx={{ p: 3, border: 1, borderColor: 'divider', borderRadius: 2 }}
          >
            <Typography variant="body2">
              {hasActiveFilters ? 'No entries found for selected filters' : 'No fee records found'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hasActiveFilters
                ? 'Change the month, fee head or status to see other entries'
                : 'Records will appear here once available'}
            </Typography>
          </Stack>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ px: 0.5 }}>
          Showing {rows.length} {rows.length === 1 ? 'fee' : 'fees'} in {groups.length}{' '}
          {groups.length === 1 ? 'group' : 'groups'}
        </Typography>
      </Stack>
      <CustomDialog
        titleInfo="Review the selected fee or charge, its due period, status, and recorded amounts."
        open={Boolean(detail)}
        handleClose={closeDetail}
        hasForm={false}
        guardUnsavedChanges={false}
        maxWidth="sm"
        paperProps={{ sx: { backgroundImage: 'none' } }}
        title={detail?.feeHeadName ?? 'Fee Details'}
      >
        {detail && (
          <DialogScrollContent>
            <Stack spacing={2}>
              <DetailSection
                helpText={
                  detail.charge?.sourceType === 'LateFee'
                    ? 'The due date used by the late-fee rule and the exact calendar intervals counted by the calculation. Gaps from grace periods or policy exceptions are not counted.'
                    : 'The due period, installment, and current payment status of this entry.'
                }
                title={detail.charge ? 'Charge Details' : 'Fee Details'}
                icon={GlobalIcons.calendar}
                action={
                  <Label color={FeeCollectionStatusTypeColors[detail.status] ?? 'default'}>
                    {detail.charge
                      ? chargeCollectionStatusLabel(detail.status)
                      : feeInstallmentStatusLabel(detail.status)}
                  </Label>
                }
              >
                <DetailGrid>
                  {detail.charge?.sourceType === 'LateFee' ? (
                    <>
                      <DetailField
                        label="Due date"
                        value={
                          detail.charge.dueDate
                            ? formatDateOnly(detail.charge.dueDate, 'D MMMM YYYY')
                            : undefined
                        }
                      />
                      <DetailField label="Installment" value={detail.installmentLabel} />
                      <DetailField
                        label="Late fee applied from/to"
                        value={lateFeeAppliedPeriod(detail.charge)}
                        secondary={lateFeeAppliedDays(detail.charge)}
                        fullWidth
                      />
                    </>
                  ) : (
                    <>
                      <DetailField label="Due period" value={detail.periodLabel} />
                      <DetailField label="Installment" value={detail.installmentLabel} />
                      {detail.dueDate && (
                        <DetailField
                          label="Due date"
                          value={formatDateOnly(detail.dueDate, 'D MMMM YYYY')}
                        />
                      )}
                    </>
                  )}
                  {daysOverdue != null && (
                    <DetailField label="Days overdue" value={String(daysOverdue)} />
                  )}
                </DetailGrid>
              </DetailSection>
              <DetailSection
                helpText="Recorded fee or charge amounts, payments, outstanding balance, and applicable concessions, waivers, refunds, or proration. All amounts are in INR."
                title="Amount Breakdown"
                icon={GlobalIcons.receiptIcon}
                sx={{ fontVariantNumeric: 'tabular-nums' }}
              >
                <DetailGrid>
                  <DetailField
                    label="Outstanding amount"
                    value={formatNumber(detail.outstanding, 'INR')}
                  />
                  <DetailField label="Total" value={formatNumber(detail.total, 'INR')} />
                  <DetailField label="Paid" value={formatNumber(detail.paid, 'INR')} />
                  <DetailField
                    label="Adjustment credit"
                    value={formatNumber(detail.adjustmentCreditAmount ?? 0, 'INR')}
                  />
                  <DetailField
                    label="Outstanding principal"
                    value={formatNumber(detail.due, 'INR')}
                  />
                  <DetailField
                    label="Reconciliation amount"
                    value={formatNumber(detail.reconciliationAmount ?? 0, 'INR')}
                  />
                  <DetailField
                    label="Concession"
                    value={formatNumber(detail.concessionAmount ?? 0, 'INR')}
                  />
                  <DetailField
                    label="Late fee"
                    value={formatNumber(detail.lateFeeAmount ?? 0, 'INR')}
                    secondary={detail.lateFeeExplanation}
                  />
                  {detail.lateFeeWaivedAmount != null && (
                    <DetailField
                      label="Late fee waived"
                      value={formatNumber(detail.lateFeeWaivedAmount, 'INR')}
                    />
                  )}
                  {detail.refundAmount != null && (
                    <DetailField
                      label="Refunded to date"
                      value={formatNumber(detail.refundAmount, 'INR')}
                      secondary={[REFUNDED_TO_DATE_HELP, detail.refundDescription]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  )}
                  {(detail.pendingRefundAmount ?? 0) > 0 && (
                    <DetailField
                      label="Refund awaiting payout"
                      value={formatNumber(detail.pendingRefundAmount!, 'INR')}
                      secondary={[REFUND_AWAITING_PAYOUT_HELP, detail.pendingRefundDescription]
                        .filter(Boolean)
                        .join(' ')}
                    />
                  )}
                  {detail.scheduledTotal != null && (
                    <DetailField
                      label="Scheduled total"
                      value={formatNumber(detail.scheduledTotal, 'INR')}
                    />
                  )}
                  {detail.prorationExplanation && (
                    <DetailField
                      label="Proration"
                      value={detail.prorationExplanation}
                      secondary={
                        detail.prorationPolicyName
                          ? `${detail.prorationPolicyName}${detail.prorationPolicyVersionNumber != null ? `, v${detail.prorationPolicyVersionNumber}` : ''}`
                          : undefined
                      }
                      fullWidth
                    />
                  )}
                  {Number(detail.withdrawalProrationCredit) > 0 && (
                    <DetailField
                      label="Withdrawal credit"
                      value={formatNumber(detail.withdrawalProrationCredit ?? 0, 'INR')}
                      secondary={detail.withdrawalProrationExplanation ?? undefined}
                    />
                  )}
                  {detail.charge?.explanation && (
                    <DetailField
                      label="Charge explanation"
                      value={detail.charge.explanation}
                      fullWidth
                    />
                  )}
                  {detail.charge?.waivedAmount != null && (
                    <DetailField
                      label="Charge waived"
                      value={formatNumber(detail.charge.waivedAmount, 'INR')}
                    />
                  )}
                </DetailGrid>
              </DetailSection>
              {allowWaivers &&
                (detail.charge
                  ? detail.charge.canWaive !== false &&
                    detail.due > 0 &&
                    collectible(detail) && (
                      <FeeWaiverToggle
                        sourceType={detail.charge.sourceType}
                        sourceId={detail.charge.sourceId || detail.charge.chargeId}
                        sourceName={detail.feeHeadName}
                        canWaive={detail.charge.canWaive}
                        remainingAmount={detail.due}
                        onApplied={(result) => waiverApplied(result?.remainingAmount)}
                      />
                    )
                  : detail.dueFeeId &&
                    detail.canWaive !== false &&
                    (detail.lateFeeAmount ?? 0) > 0 && (
                      <FeeWaiverToggle
                        sourceType="LateFee"
                        sourceId={detail.dueFeeId}
                        sourceName={`${detail.feeHeadName}, ${detail.periodLabel}`}
                        remainingAmount={detail.lateFeeAmount!}
                        onApplied={(result) => waiverApplied(result?.remainingAmount)}
                      />
                    ))}
            </Stack>
          </DialogScrollContent>
        )}
        <DialogActions>
          <CancelButton
            buttonText="Close"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
            onClick={closeDetail}
          />
        </DialogActions>
      </CustomDialog>
    </Stack>
  );
}
