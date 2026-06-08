'use client';

import { isNaN } from 'lodash';
import React, { useMemo, useState } from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Divider, Collapse, Typography } from '@mui/material';

import RefundMonthRow from './RefundMonthRow';
import RefundColHeader from './RefundColHeader';
import FeeHeadGroupHeader from './FeeHeadGroupHeader';

import type { RefundFormik, IFeeHeadPayment } from '../types';
import type { IFeeHeadRefundItem } from '../initialValuesAndValidation';

export interface FeeHeadGroupProps {
  feeHead: IFeeHeadPayment;
  selectedMonths: string[];
  formik: RefundFormik;
  showValidation: boolean;
  mode?: 'refund' | 'adjustment';
  onToggleMonth: (month: string, dueFeeId: string) => void;
  onToggleAll: () => void;
  applyInAllState?: { isApplying: boolean; amount: number | string };
  onApplyInAllAmountChange?: (amount: number | string) => void;
  onApplyInAllToggle?: () => void;
}

const FeeHeadGroup: React.FC<FeeHeadGroupProps> = ({
  feeHead,
  selectedMonths,
  formik,
  showValidation,
  mode = 'refund',
  onToggleMonth,
  onToggleAll,
  applyInAllState = { isApplying: false, amount: 0 },
  onApplyInAllAmountChange,
  onApplyInAllToggle,
}): React.ReactElement => {
  const theme = useTheme();
  const isAdj = mode === 'adjustment';
  const [open, setOpen] = useState(true);

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
      clamped = Math.min(Math.max(0, Number(value)), refundable);
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
  const visibleItems = feeHead.items.filter((item) => item.paid > 0);

  return (
    <Box
      sx={{
        mb: 1.5,
        borderRadius: '14px',
        overflow: 'hidden',
        border: `1px solid ${
          selectedMonths.length > 0
            ? alpha(theme.palette.primary.main, 0.25)
            : theme.palette.divider
        }`,
        opacity: !hasSelectable ? 0.6 : 1,
        transition: 'border-color 0.2s ease, opacity 0.2s ease',
        '&:hover': hasSelectable
          ? {
              borderColor: alpha(theme.palette.primary.main, 0.3),
              boxShadow: `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
            }
          : {},
      }}
    >
      <FeeHeadGroupHeader
        feeHead={feeHead}
        selectedMonths={selectedMonths}
        isOpen={open}
        totalRefundInput={totalRefundInput}
        onCheckboxToggle={onToggleAll}
        onExpandToggle={() => setOpen((o) => !o)}
        applyInAllState={applyInAllState}
        onApplyInAllAmountChange={onApplyInAllAmountChange}
        onApplyInAllToggle={onApplyInAllToggle}
        mode={mode}
      />

      <Collapse in={open} timeout={250}>
        <Divider />
        <RefundColHeader mode={mode} />

        {visibleItems.map((item, idx) => {
          const refundable = Math.max(0, item.refundable);
          const isSelected = selectedMonths.includes(item.month);
          const refundValue = fhEntry?.months.find((m) => m.month === item.month)?.amount ?? '';
          const inputError =
            showValidation &&
            isSelected &&
            (refundValue === '' || Number(refundValue) <= 0 || Number(refundValue) > refundable);

          return (
            <React.Fragment key={item.month}>
              <RefundMonthRow
                item={item}
                isSelected={isSelected}
                isDisabled={refundable === 0}
                refundValue={refundValue}
                showInputError={inputError}
                onToggle={() => onToggleMonth(item.month, (item as any).dueFeeId ?? '')}
                onAmountChange={(value) => handleAmountChange(item.month, refundable, value)}
              />
              {idx < visibleItems.length - 1 && <Divider sx={{ mx: 1.5, opacity: 0.35 }} />}
            </React.Fragment>
          );
        })}

        {/* ── Per-head selection summary footer ── */}
        {selectedMonths.length > 0 && (
          <>
            <Divider />
            <Box
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
              gap={3}
              px={2}
              py={1}
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
            >
              <Typography variant="caption" color="text.secondary">
                Selected:{' '}
                <strong>
                  {selectedMonths.length} month{selectedMonths.length !== 1 ? 's' : ''}
                </strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isAdj ? 'Max adjustable' : 'Max refundable'}:{' '}
                <strong style={{ color: theme.palette.success.main }}>
                  {formatCurrency(totalRefundable)}
                </strong>
              </Typography>
              {totalRefundInput > 0 && (
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontWeight={700}
                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {isAdj ? 'Adjustment' : 'Refund'}: {formatCurrency(totalRefundInput)}
                </Typography>
              )}
            </Box>
          </>
        )}
      </Collapse>
    </Box>
  );
};

export default FeeHeadGroup;
