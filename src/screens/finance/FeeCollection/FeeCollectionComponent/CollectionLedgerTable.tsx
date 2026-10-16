'use client';

import type { IColumn } from 'src/components/customizabaleTable/types';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import CustomAccordion from 'src/components/custom-accordian';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Button,
  Checkbox,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  FeeMonth,
  feeInstallmentStatusLabel,
  chargeCollectionStatusLabel,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import { toPeriod } from './FeeLedgerShared';
import FeeWaiverToggle from './FeeWaiverToggle';
import { selectionItemKey, isLedgerItemCollectible } from './feeLedgerSelection';
import { roundUpToRupee, safeRoundingDifference } from './preview/paymentAllocationUtils';

import type { FeeLedgerListProps } from './FeeLedgerList';
import type { IFeeCharge, SelectedItem, MonthWiseFeeItem } from '../Components/type';

export type CollectionLayout = 'ledger' | 'period' | 'wide';
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
  onPeriodFocus,
}: FeeLedgerListProps & { layout: CollectionLayout; onPeriodFocus?: (period: string) => void }) {
  const [detailId, setDetailId] = useState<string | null>(null);
  const [groupsExpanded, setGroupsExpanded] = useState(false);
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
  if (activeTab === 'by-fee-head' && layout !== 'period')
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
  const groups =
    layout === 'period' || activeTab === 'by-month'
      ? [...new Set(feeRows.map((row) => row.period))].map((period) => ({
          id: period,
          title: feeRows.find((row) => row.period === period)!.periodLabel,
          items: feeRows.filter((row) => row.period === period),
        }))
      : data.feeHeadWise.map((group) => ({
          id: group.feeHeadId,
          title: group.feeHeadName,
          items: feeRows.filter((row) => row.feeHeadId === group.feeHeadId),
        }));
  const groupControls = (
    <Stack
      direction="row"
      flexWrap={layout === 'period' ? 'nowrap' : 'wrap'}
      useFlexGap
      spacing={1}
      sx={{ overflowX: layout === 'period' ? 'auto' : 'visible', flexShrink: 0 }}
    >
      {groups.map((group) => (
        <Box
          key={group.id}
          sx={{
            minWidth: 0,
            ...(layout === 'period' && {
              p: 1,
              flex: '0 0 180px',
              bgcolor: 'background.neutral',
              borderRadius: 1,
            }),
          }}
        >
          <FormControlLabel
            sx={{ m: 0 }}
            control={groupCheckbox(group.items, `Select ${group.title}`)}
            label={<Typography variant="body2">{group.title}</Typography>}
          />
          {layout === 'period' && (
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography variant="subtitle2" sx={{ pl: 1 }}>
                {formatNumber(
                  group.items.filter(collectible).reduce((sum, row) => sum + row.outstanding, 0),
                  'INR'
                )}
              </Typography>
              <Button size="small" onClick={() => onPeriodFocus?.(group.id)}>
                Show fees
              </Button>
            </Stack>
          )}
        </Box>
      ))}
      {chargesData.length > 0 && (
        <FormControlLabel
          sx={{ m: 0 }}
          control={groupCheckbox(
            rows.filter((row) => row.charge),
            'Select additional charges'
          )}
          label="Additional Charges"
        />
      )}
    </Stack>
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
      label: 'Outstanding Amount',
      align: 'right',
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
      id: 'action',
      label: 'Action',
      sticky: true,
      stickyPosition: 'right',
      width: 64,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_value, row) => (
        <ThreeDotsActions
          showViewIcon
          showEditIcon={false}
          showDeleteIcon={false}
          showThreeDots={false}
          viewIcon={GlobalIcons.eye}
          viewLabel={`View ${row.feeHeadName}, ${row.periodLabel}`}
          handleViewClick={() => setDetailId(row.id)}
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
    <Stack spacing={1} sx={{ flex: 1, minHeight: 0, minWidth: 0 }}>
      {layout === 'period' ? (
        groupControls
      ) : (
        <CustomAccordion
          title={activeTab === 'by-month' ? 'Select by period' : 'Select by fee head'}
          expanded={groupsExpanded}
          onChange={() => setGroupsExpanded((value) => !value)}
          content={groupControls}
        />
      )}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CustomizableTable
          tableId="collect-fees-student-ledger"
          tableTitle="Fee ledger"
          columns={columns.map((column) => ({ ...column, cellSx: { py: 1 }, headerSx: { py: 1 } }))}
          data={rows}
          showToolbar={false}
          isPagination={false}
          isSearch={false}
          isFilter={false}
          isShowedDense={false}
          rowProps={(row) => ({ selected: isSelected(row as LedgerRow) })}
          handleRowClick={(row) => {
            if (collectible(row as LedgerRow)) toggleRows([row as LedgerRow]);
          }}
          wrapperProps={{ sx: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' } }}
          tableContainerProps={{ sx: { height: 1 } }}
          noDataText={
            <Stack alignItems="center" spacing={1} py={3}>
              <Typography variant="body2">
                {hasActiveFilters
                  ? 'No entries found for selected filters'
                  : 'No fee records found'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {hasActiveFilters
                  ? 'Change the month, fee head or status to see other entries'
                  : 'Records will appear here once available'}
              </Typography>
            </Stack>
          }
        />
      </Box>
      <CustomDialog
        open={Boolean(detail)}
        handleClose={closeDetail}
        hasForm={false}
        guardUnsavedChanges={false}
        maxWidth="md"
        title={detail ? `${detail.feeHeadName} – ${detail.periodLabel}` : 'Fee details'}
      >
        {detail && (
          <DialogScrollContent>
            <Stack spacing={2}>
              <DetailGrid>
                <DetailField label="Fee head" value={detail.feeHeadName} />
                <DetailField label="Due period" value={detail.periodLabel} />
                <DetailField label="Installment" value={detail.installmentLabel} />
                <DetailField label="Total" value={formatNumber(detail.total, 'INR')} />
                <DetailField label="Paid" value={formatNumber(detail.paid, 'INR')} />
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
                    label="Refund"
                    value={formatNumber(detail.refundAmount, 'INR')}
                    secondary={detail.refundDescription}
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
              {detail.charge ? (
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
              )}
            </Stack>
          </DialogScrollContent>
        )}
        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
        </DialogActions>
      </CustomDialog>
    </Stack>
  );
}
