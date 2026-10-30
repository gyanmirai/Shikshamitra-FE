'use client';

import { isNaN } from 'lodash';
import React, { useId, useMemo, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Stack, Tooltip, Checkbox, Typography } from '@mui/material';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomAccordion from 'src/components/custom-accordian';
import type { IColumn } from 'src/components/customizabaleTable/types';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import RefundAmountField from './RefundMonthRow';
import FeeHeadGroupHeader from './FeeHeadGroupHeader';

import type { RefundFormik, IFeeHeadPayment } from '../types';
import type { IFeeHeadRefundItem } from '../initialValuesAndValidation';

export interface FeeHeadGroupProps {
  feeHead: IFeeHeadPayment;
  selectedMonths: string[];
  formik: RefundFormik;
  showValidation: boolean;
  mode?: 'refund' | 'adjustment';
  selectedReceiptId?: string;
  onToggleMonth: (month: string, dueFeeId: string) => void;
  onToggleAll: () => void;
  applyInAllState?: { amount: number | string };
  onApplyInAllAmountChange?: (amount: number | string) => void;
  onApplyInAll?: () => void;
}

const FeeHeadGroup: React.FC<FeeHeadGroupProps> = ({
  feeHead,
  selectedMonths,
  formik,
  showValidation,
  mode = 'refund',
  selectedReceiptId,
  onToggleMonth,
  onToggleAll,
  applyInAllState = { amount: '' },
  onApplyInAllAmountChange,
  onApplyInAll,
}): React.ReactElement => {
  const contentId = useId();
  const headerId = useId();
  const isAdj = mode === 'adjustment';
  const [open, setOpen] = useState(true);
  const isFullRefund = formik.values.refundType === 'full';

  /**
   * Memoization Justification:
   * - Locates this fee head's refund entry within the feeHeadRefunds array
   * - feeHeadRefunds changes reference on every setFieldValue call;
   *   without memoization this find() runs on every render of every group
   * - Stabilizes fhEntry reference so dependent memos only recompute when relevant data changes
   */
  const fhEntry: IFeeHeadRefundItem | undefined = useMemo(
    () => formik.values.feeHeadRefunds.find((fh) => fh.feeHeadId === feeHead.feeHeadId),
    [formik.values.feeHeadRefunds, feeHead.feeHeadId]
  );

  /**
   * Memoization Justification:
   * - Sums refund amounts across all selected months for this fee head
   * - Prevents recomputation when unrelated formik fields change
   */
  const totalRefundInput = useMemo(
    () => (fhEntry?.months ?? []).reduce((s, m) => s + (Number(m.amount) || 0), 0),
    [fhEntry]
  );

  /**
   * Memoization Justification:
   * - Computes total refundable amount for selected months
   * - selectedMonths and feeHead.items are stable; recompute only when selection changes
   */
  const totalRefundable = useMemo(
    () =>
      feeHead.items
        .filter((i) => selectedMonths.includes(i.month))
        .reduce((s, i) => s + Math.max(0, i.refundable), 0),
    [feeHead.items, selectedMonths]
  );

  const handleAmountChange = (month: string, refundable: number, value: number | string): void => {
    let clamped: number | string = value;
    if (value !== '' && !isNaN(Number(value))) {
      if (Number(value) < 0) clamped = 0;
      else if (Number(value) > refundable) clamped = refundable;
    } else if (value === '') {
      clamped = '';
    }
    const refunds = formik.values.feeHeadRefunds;
    const updated = refunds.map((fh) =>
      fh.feeHeadId === feeHead.feeHeadId
        ? {
            ...fh,
            months: fh.months.map((m) => (m.month === month ? { ...m, amount: clamped } : m)),
          }
        : fh
    );
    formik.setFieldValue('feeHeadRefunds', updated);
    formik.setFieldTouched('feeHeadRefunds', true, false);
  };

  const hasSelectable = feeHead.items.some((i) => i.refundable > 0);
  const visibleItems = isAdj
    ? feeHead.items.filter((item) => item.refundable > 0 || item.refunded > 0)
    : feeHead.items.filter((item) => item.paid > 0);

  const rows = visibleItems.map((item) => {
    const refundable = Math.max(0, item.refundable);
    const isSelected = selectedMonths.includes(item.month);
    const refundValue = fhEntry?.months.find((month) => month.month === item.month)?.amount ?? '';
    const receiptLocked = Boolean(
      !isAdj && selectedReceiptId && item.sourceReceiptId !== selectedReceiptId
    );
    return {
      ...item,
      id: item.sourceAllocationId || item.month,
      isSelected,
      isDisabled: refundable === 0 || receiptLocked,
      disabledReason: receiptLocked
        ? 'Clear the selected installments to choose this receipt.'
        : '',
      refundValue,
      inputError:
        showValidation &&
        isSelected &&
        (refundValue === '' ||
          !Number.isFinite(Number(refundValue)) ||
          Number(refundValue) <= 0 ||
          Number(refundValue) > refundable),
    };
  });
  const columns: IColumn[] = [
    {
      id: 'month',
      label: 'Month / receipt',
      minWidth: 260,
      rowHeader: true,
      isSort: false,
      isFilter: false,
      render: (value, row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title={row.disabledReason}>
            <span>
              <Checkbox
                size="small"
                checked={row.isSelected}
                disabled={row.isDisabled}
                inputProps={{ 'aria-label': `Select ${value}` }}
                onChange={() => onToggleMonth(row.month, row.dueFeeId)}
              />
            </span>
          </Tooltip>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {value}
          </Typography>
        </Stack>
      ),
    },
    ...[
      { id: 'total', label: 'Total' },
      { id: 'paid', label: 'Paid' },
      { id: 'refunded', label: isAdj ? 'Adjusted' : 'Refunded' },
      { id: 'refundable', label: isAdj ? 'Adjustable' : 'Refundable' },
    ].map(({ id, label }): IColumn => ({
      id,
      label,
      minWidth: 110,
      align: 'left',
      isSort: false,
      isFilter: false,
      cellSx: { textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
      render: (value) => formatNumber(value, 'INR'),
    })),
    {
      id: 'refundValue',
      label: isAdj ? 'Adjustment amount' : 'Refund amount',
      width: 200,
      minWidth: 200,
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_, row) =>
        row.isSelected ? (
          <RefundAmountField
            item={row as (typeof rows)[number]}
            refundValue={row.refundValue}
            showInputError={row.inputError}
            mode={mode}
            isFullRefund={isFullRefund}
            onAmountChange={(value) =>
              handleAmountChange(row.month, Math.max(0, row.refundable), value)
            }
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            {row.isDisabled ? '—' : 'Not selected'}
          </Typography>
        ),
    },
    {
      id: 'status',
      label: 'Status',
      sticky: true,
      stickyPosition: 'right',
      width: 110,
      isSort: false,
      isFilter: false,
      render: (value: FeeCollectionStatusType) => (
        <Label color={FeeCollectionStatusTypeColors[value]} variant="soft">
          {FeeCollectionStatusType[value]}
        </Label>
      ),
    },
  ];

  const hasInputError = rows.some((row) => row.inputError);
  useEffect(() => {
    if (hasInputError) setOpen(true);
  }, [hasInputError, formik.submitCount]);

  return (
    <Box
      component="section"
      aria-labelledby={headerId}
      sx={{
        minWidth: 0,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        opacity: hasSelectable ? 1 : 0.6,
        '& > .MuiAccordion-root': { m: 0, bgcolor: 'background.paper' },
        '& .MuiAccordionDetails-root': { p: 0 },
      }}
    >
      <CustomAccordion
        title={feeHead.feeHeadName}
        expanded={open}
        onChange={() => setOpen((value) => !value)}
        summary={
          <FeeHeadGroupHeader
            feeHead={feeHead}
            selectedMonths={selectedMonths}
            isOpen={open}
            contentId={contentId}
            headerId={headerId}
            totalRefundInput={totalRefundInput}
            mode={mode}
            selectedReceiptId={selectedReceiptId}
            isFullRefund={isFullRefund}
            onCheckboxToggle={onToggleAll}
            onExpandToggle={() => setOpen((value) => !value)}
            applyInAllState={applyInAllState}
            onApplyInAllAmountChange={onApplyInAllAmountChange}
            onApplyInAll={onApplyInAll}
          />
        }
        content={
          <Box id={contentId} role="region" aria-labelledby={headerId} hidden={!open}>
            <CustomizableTable
              tableId={`refund-installments-${mode}-${feeHead.feeHeadId}`}
              tableTitle={feeHead.feeHeadName}
              variant="embedded"
              wrapperProps={{
                sx: { '& > .MuiCard-root': { border: 0, borderRadius: 0, boxShadow: 'none' } },
              }}
              columns={columns}
              data={rows}
              page={0}
              rowsPerPage={Math.max(1, rows.length)}
              showToolbar={false}
              isSearch={false}
              isFilter={false}
              isPagination={false}
              isShowedDense={false}
              rowProps={(row) => ({
                selected: row.isSelected,
                sx: {
                  opacity: row.isDisabled ? 0.45 : 1,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    '&:hover': { bgcolor: 'action.hover' },
                  },
                },
              })}
              getRowAction={(row) => ({
                label: `${row.isSelected ? 'Deselect' : 'Select'} ${row.month}`,
                disabled: row.isDisabled,
                onClick: () => onToggleMonth(row.month, row.dueFeeId),
              })}
            />
            {selectedMonths.length > 0 && (
              <Stack
                direction="row"
                spacing={2}
                useFlexGap
                flexWrap="wrap"
                justifyContent="flex-end"
                sx={{ p: 2 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedMonths.length} month{selectedMonths.length !== 1 ? 's' : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isAdj ? 'Max adjustable' : 'Max refundable'}:{' '}
                  {formatNumber(totalRefundable, 'INR')}
                </Typography>
                {totalRefundInput > 0 && (
                  <Typography variant="body2">
                    {isAdj ? 'Adjustment' : 'Refund'}: {formatNumber(totalRefundInput, 'INR')}
                  </Typography>
                )}
              </Stack>
            )}
          </Box>
        }
      />
    </Box>
  );
};

export default FeeHeadGroup;
