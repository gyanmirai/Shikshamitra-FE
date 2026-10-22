'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState, useContext } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CancelButton from 'src/components/cancel-button';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
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
  feeInstallmentStatusLabel,
  chargeCollectionStatusLabel,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { toPeriod } from './FeeLedgerShared';
import FeeWaiverToggle from './FeeWaiverToggle';
import { FeeCollectionWaiverContext } from './feeCollectionContext';
import { selectionItemKey, isLedgerItemCollectible } from './feeLedgerSelection';
import { roundUpToRupee, safeRoundingDifference } from './preview/paymentAllocationUtils';

import type { FeeLedgerListProps } from './FeeLedgerList';
import type { IFeeCharge, SelectedItem, MonthWiseFeeItem } from '../Components/type';

export type CollectionLayout = 'ledger' | 'period' | 'wide';

// This contextual view uses sentence-case, secondary labels from the detail-view rulebook.
const detailFieldProps = {
  labelTypographyProps: {
    color: 'text.secondary',
    sx: { fontWeight: 'fontWeightRegular', letterSpacing: 'normal', textTransform: 'none' },
  },
} as const;

type LedgerRow = MonthWiseFeeItem & {
  id: string;
  period: string;
  periodLabel: string;
  charge?: IFeeCharge;
  outstanding: number;
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
  year = new Date().getFullYear(),
  hasActiveFilters,
  layout,
  allocationDueFeeOrder,
  allocationBasis,
}: FeeLedgerListProps & {
  layout: CollectionLayout;
  onPeriodFocus?: (period: string) => void;
  allocationDueFeeOrder?: string[];
  allocationBasis?: 'Installment' | 'FeeHead';
}) {
  const allowWaivers = useContext(FeeCollectionWaiverContext);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const rows: LedgerRow[] = data.monthWise.flatMap((group) =>
    group.items.map((item) => {
      const period = toPeriod(group.month, group.year ?? year);
      return {
        ...item,
        id: `fee:${item.dueFeeId ?? `${item.feeHeadId}:${period}`}`,
        period,
        periodLabel: `${FeeMonth[group.month]} ${group.year ?? year}`,
        outstanding: roundUpToRupee(item.due) + (item.lateFeeAmount ?? 0),
      };
    })
  );
  if (allocationDueFeeOrder) {
    const rank = new Map(allocationDueFeeOrder.map((id, index) => [id, index]));
    rows.sort(
      (a, b) =>
        (rank.get(a.dueFeeId ?? '') ?? Number.MAX_SAFE_INTEGER) -
        (rank.get(b.dueFeeId ?? '') ?? Number.MAX_SAFE_INTEGER)
    );
  } else if (activeTab === 'by-fee-head' && layout !== 'period')
    rows.sort(
      (a, b) => a.feeHeadName.localeCompare(b.feeHeadName) || a.period.localeCompare(b.period)
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
  const toggleRows = (candidates: LedgerRow[]) => {
    const eligible = candidates.filter(collectible);
    if (!eligible.length) return;
    const remove = eligible.every(isSelected);
    const feeRows = eligible.filter((row) => !row.charge);
    const keys = new Set(feeRows.map((row) => selectionItemKey(asSelection(row))));
    if (feeRows.length)
      onSelectionChange(
        remove
          ? selectedItems.filter((item) => !keys.has(selectionItemKey(item)))
          : [...selectedItems, ...feeRows.filter((row) => !isSelected(row)).map(asSelection)]
      );
    const chargeRows = eligible.filter((row) => row.charge);
    const ids = new Set(chargeRows.map((row) => row.charge!.chargeId));
    if (chargeRows.length)
      onChargesChange(
        remove ? charges.filter((id) => !ids.has(id)) : [...new Set([...charges, ...ids])]
      );
  };
  const groupCheckbox = (candidates: LedgerRow[], label: string) => {
    const eligible = candidates.filter(collectible);
    const count = eligible.filter(isSelected).length;
    return (
      <Checkbox
        size="small"
        checked={eligible.length > 0 && count === eligible.length}
        indeterminate={count > 0 && count < eligible.length}
        disabled={!eligible.length}
        inputProps={{ 'aria-label': label }}
        onChange={() => toggleRows(candidates)}
      />
    );
  };
  const feeRows = rows.filter((row) => !row.charge);
  const groups = Object.values(
    rows.reduce<Record<string, { id: string; title: string; items: LedgerRow[] }>>(
      (result, row) => {
        const byPeriod = layout === 'period' || activeTab === 'by-month';
        const byInstallment = allocationBasis === 'Installment';
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
          {row.charge && (
            <Typography variant="caption" color="text.secondary">
              Additional Charges
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'period',
      label: 'Due Period',
      minWidth: 190,
      isFilter: false,
      render: (_value, row) => (
        <Box>
          <Typography variant="body2">{row.periodLabel}</Typography>
          {row.installmentLabel && (
            <Typography variant="caption" color="text.secondary">
              {row.installmentLabel}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'outstanding',
      label: 'Amount',
      align: 'left',
      cellSx: { textAlign: 'right' },
      minWidth: 135,
      isFilter: false,
      render: (value) => (
        <Typography variant="body2" fontWeight={600} sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatNumber(value, 'INR')}
        </Typography>
      ),
    },
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
    {
      align: 'left',
      id: 'action',
      label: 'Action',
      sticky: true,
      stickyPosition: 'right',
      width: 64,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_value, row) => (
        <AdaptiveThreeDotsActions
          directActionLimit={2}
          sx={{ justifyContent: 'flex-start' }}
          actions={[
            {
              id: 'view',
              label: `View ${row.feeHeadName}, ${row.periodLabel}`,
              icon: GlobalIcons.eye,
              onClick: () => setDetailId(row.id),
            },
          ]}
        />
      ),
    },
  ];
  const detail = rows.find((row) => row.id === detailId);
  const closeDetail = () => setDetailId(null);
  const waiverApplied = () => {
    if (detail && isSelected(detail)) toggleRows([detail]);
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
          const selected = group.items.filter(isSelected);
          const selectedTotal = selected.reduce((sum, row) => sum + row.outstanding, 0);
          const outstanding = group.items
            .filter(collectible)
            .reduce((sum, row) => sum + row.outstanding, 0);
          const expanded = !(collapsedGroups[group.id] ?? (index !== 0 && !selected.length));
          const groupColumns = columns
            .filter(
              (column) =>
                column.id !== 'feeHeadName' ||
                group.id === 'additional-charges' ||
                activeTab === 'by-month'
            )
            .map((column) => ({
              ...column,
              isSort: allocationDueFeeOrder ? false : column.isSort,
              ...(column.id === 'selection' && {
                label: groupCheckbox(group.items, `Select all ${group.title}`),
              }),
              cellSx: { ...column.cellSx, py: 1.5 },
              headerSx: { py: 1 },
            }));
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
                    {selected.length ? (
                      <Label
                        color="success"
                        sx={{
                          height: 'auto',
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
                  tableId={`collect-fees-group-${group.id}`}
                  tableTitle={group.title}
                  columns={groupColumns}
                  data={group.items}
                  showToolbar={false}
                  isPagination={false}
                  isSearch={false}
                  isFilter={false}
                  isShowedDense={false}
                  rowProps={(row) => ({ selected: isSelected(row as LedgerRow) })}
                  handleRowClick={(row) => {
                    if (collectible(row as LedgerRow)) toggleRows([row as LedgerRow]);
                  }}
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
              <FormSectionCard
                descriptionTooltip="The due period, installment, and current payment status of this entry."
                title={detail.charge ? 'Charge Details' : 'Fee Details'}
                icon={GlobalIcons.calendar}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}

                sx={{ containerType: 'inline-size', boxShadow: 'none' }}
              >
                <DetailGrid>
                  <DetailField
                    {...detailFieldProps}
                    label="Due period"
                    value={detail.periodLabel}
                  />
                  <DetailField
                    {...detailFieldProps}
                    label="Installment"
                    value={detail.installmentLabel}
                  />
                  <DetailField
                    {...detailFieldProps}
                    label="Status"
                    value={
                      <Label color={FeeCollectionStatusTypeColors[detail.status] ?? 'default'}>
                        {detail.charge
                          ? chargeCollectionStatusLabel(detail.status)
                          : feeInstallmentStatusLabel(detail.status)}
                      </Label>
                    }
                  />
                </DetailGrid>
              </FormSectionCard>
              <FormSectionCard
                descriptionTooltip="Recorded fee or charge amounts, payments, outstanding balance, and applicable concessions, waivers, refunds, or proration. All amounts are in INR."
                title="Amount Breakdown"
                icon={GlobalIcons.receiptIcon}
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}

                sx={{
                  containerType: 'inline-size',
                  boxShadow: 'none',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1 }}
                >
                  <Typography variant="body2">Outstanding amount</Typography>
                  <Typography
                    variant="h6"
                    sx={{ overflowWrap: 'anywhere', minWidth: 0, textAlign: 'right' }}
                  >
                    {formatNumber(detail.outstanding, 'INR')}
                  </Typography>
                </Stack>
                <DetailGrid>
                  <DetailField
                    {...detailFieldProps}
                    label="Total"
                    value={formatNumber(detail.total, 'INR')}
                  />
                  <DetailField
                    {...detailFieldProps}
                    label="Paid"
                    value={formatNumber(detail.paid, 'INR')}
                  />
                  <DetailField
                    {...detailFieldProps}
                    label="Outstanding principal"
                    value={formatNumber(detail.due, 'INR')}
                  />
                  <DetailField
                    {...detailFieldProps}
                    label="Reconciliation amount"
                    value={formatNumber(detail.reconciliationAmount ?? 0, 'INR')}
                  />
                  <DetailField
                    {...detailFieldProps}
                    label="Concession"
                    value={formatNumber(detail.concessionAmount ?? 0, 'INR')}
                  />
                  <DetailField
                    {...detailFieldProps}
                    label="Late fee"
                    value={formatNumber(detail.lateFeeAmount ?? 0, 'INR')}
                    secondary={detail.lateFeeExplanation}
                  />
                  {detail.lateFeeWaivedAmount != null && (
                    <DetailField
                      {...detailFieldProps}
                      label="Late fee waived"
                      value={formatNumber(detail.lateFeeWaivedAmount, 'INR')}
                    />
                  )}
                  {detail.refundAmount != null && (
                    <DetailField
                      {...detailFieldProps}
                      label="Refund"
                      value={formatNumber(detail.refundAmount, 'INR')}
                      secondary={detail.refundDescription}
                    />
                  )}
                  {detail.scheduledTotal != null && (
                    <DetailField
                      {...detailFieldProps}
                      label="Scheduled total"
                      value={formatNumber(detail.scheduledTotal, 'INR')}
                    />
                  )}
                  {detail.prorationExplanation && (
                    <DetailField
                      {...detailFieldProps}
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
                  {detail.charge?.explanation && (
                    <DetailField
                      {...detailFieldProps}
                      label="Charge explanation"
                      value={detail.charge.explanation}
                      fullWidth
                    />
                  )}
                  {detail.charge?.waivedAmount != null && (
                    <DetailField
                      {...detailFieldProps}
                      label="Charge waived"
                      value={formatNumber(detail.charge.waivedAmount, 'INR')}
                    />
                  )}
                </DetailGrid>
              </FormSectionCard>
              {allowWaivers &&
                (detail.charge ? (
                  <FeeWaiverToggle
                    sourceType={detail.charge.sourceType}
                    sourceId={detail.charge.chargeId}
                    remainingAmount={detail.due}
                    onApplied={waiverApplied}
                  />
                ) : (
                  detail.dueFeeId &&
                  (detail.lateFeeAmount ?? 0) > 0 && (
                    <FeeWaiverToggle
                      sourceType="LateFee"
                      sourceId={detail.dueFeeId}
                      remainingAmount={detail.lateFeeAmount!}
                      onApplied={waiverApplied}
                    />
                  )
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
