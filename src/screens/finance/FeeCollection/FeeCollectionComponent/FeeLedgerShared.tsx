'use client';

import type { LabelColor } from 'src/components/label';
import type { FeeMonth } from 'src/enums/fee-collection-type';

import { useContext } from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Tooltip, Checkbox, IconButton, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  feeInstallmentStatusLabel,
  chargeCollectionStatusLabel,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import FeeWaiverToggle from './FeeWaiverToggle';
import { roundUpToRupee } from './preview/paymentAllocationUtils';
import { FeeCollectionWaiverContext } from './feeCollectionContext';

// ─── Constants & Helpers ───────────────────────────────────────────────────────

export const MONTH_TO_NUM: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export const STATUS_COLOR: Record<string, LabelColor> = {
  Pending: 'warning',
  Partial: 'info',
  Paid: 'success',
};

export const toPeriod = (month: FeeMonth | string, year: number): string => {
  const monthNumber = typeof month === 'number' ? month + 1 : (MONTH_TO_NUM[month] ?? 0);
  return `${year}-${String(monthNumber).padStart(2, '0')}`;
};

const AMOUNT_COLUMN_WIDTH = 112;
const STATUS_COLUMN_WIDTH = 96;

const getLedgerGridColumns = (showStatus: boolean): string =>
  `28px minmax(160px, 1fr) repeat(6, ${AMOUNT_COLUMN_WIDTH}px)${showStatus ? ` ${STATUS_COLUMN_WIDTH}px` : ''}`;

// ─── ColHeader ─────────────────────────────────────────────────────────────────

export const ColHeader = ({
  firstLabel,
  showStatus = false,
}: {
  firstLabel: string;
  showStatus?: boolean;
}) => (
  <Box
    display="grid"
    alignItems="center"
    columnGap={1}
    px={1.5}
    py={0.9}
    sx={{
      gridTemplateColumns: getLedgerGridColumns(showStatus),
      bgcolor: (theme) =>
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.neutral ?? theme.palette.action.hover, 0.62)
          : alpha(theme.palette.text.primary, 0.035),
      borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}`,
    }}
  >
    {/* Checkbox placeholder */}
    <Box />
    <Typography
      variant="caption"
      color="text.disabled"
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="0.05em"
      sx={{ fontSize: '0.7rem', minWidth: 0 }}
    >
      {firstLabel}
    </Typography>
    {(['TOTAL', 'PAID', 'PENDING', 'LATE FEE', 'CONCESSION', 'RECONCILIATION AMOUNT'] as const).map(
      (col) => (
        <Typography
          key={col}
          variant="caption"
          color="text.disabled"
          fontWeight={700}
          textTransform="uppercase"
          letterSpacing="0.05em"
          sx={{ textAlign: 'right', fontSize: '0.7rem' }}
        >
          {col}
        </Typography>
      )
    )}
    {showStatus && (
      <Typography
        variant="caption"
        color="text.disabled"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.05em"
        sx={{ textAlign: 'center', fontSize: '0.7rem' }}
      >
        STATUS
      </Typography>
    )}
  </Box>
);

// ─── FeeRow ────────────────────────────────────────────────────────────────────

export const REFUNDED_TO_DATE_HELP =
  'Completed payouts for this installment across all refund requests.';
export const REFUND_AWAITING_PAYOUT_HELP = 'Payout has not been completed.';

export interface FeeRowProps {
  name: string;
  subtitle?: string;
  total: number;
  scheduledTotal?: number;
  prorationPolicyName?: string | null;
  prorationPolicyVersionNumber?: number | null;
  prorationExplanation?: string | null;
  paid: number;
  due: number;
  status?: FeeCollectionStatusType;
  isSelected: boolean;
  isDisabled?: boolean;
  showStatus?: boolean;
  onToggle: () => void;
  reconciliationAmount?: number;
  concessionAmount?: number;
  refundAmount?: number;
  refundDescription?: string;
  pendingRefundAmount?: number;
  pendingRefundDescription?: string;
  lateFeeAmount?: number;
  lateFeeExplanation?: string;
  lateFeeWaivedAmount?: number;
  /** Enables the waiver action button on this row — omitted for charges and views where the due fee id isn't resolvable. */
  dueFeeId?: string;
  chargeId?: string;
  waiverSourceType?: 'Charge' | 'LateFee';
  onWaiverApplied?: () => void;
}

export const FeeRow = ({
  name,
  total,
  scheduledTotal,
  prorationPolicyName,
  prorationPolicyVersionNumber,
  prorationExplanation,
  paid,
  due,
  reconciliationAmount,
  concessionAmount,
  refundAmount,
  refundDescription,
  pendingRefundAmount,
  pendingRefundDescription,
  lateFeeAmount,
  lateFeeExplanation,
  lateFeeWaivedAmount,
  dueFeeId,
  chargeId,
  waiverSourceType,
  onWaiverApplied,
  status,
  isSelected,
  isDisabled = false,
  showStatus = false,
  onToggle,
}: FeeRowProps) => {
  const theme = useTheme();
  const allowWaivers = useContext(FeeCollectionWaiverContext);
  const safeReconciliationAmount = reconciliationAmount ?? 0;
  const safeConcessionAmount = concessionAmount ?? 0;
  const safeLateFeeAmount = lateFeeAmount ?? 0;
  const safeLateFeeWaivedAmount = lateFeeWaivedAmount ?? 0;
  const hasRefund = (refundAmount ?? 0) > 0;
  const hasPendingRefund = (pendingRefundAmount ?? 0) > 0;

  return (
    <Box
      display="grid"
      alignItems="center"
      columnGap={1}
      px={1.5}
      py={0.95}
      sx={{
        gridTemplateColumns: getLedgerGridColumns(showStatus),
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.45 : 1,
        transition: 'background-color 0.18s ease, opacity 0.18s ease, border-color 0.18s ease',
        bgcolor: isSelected
          ? alpha(theme.palette.primary.main, 0.055)
          : theme.palette.mode === 'dark'
            ? alpha(theme.palette.background.neutral ?? theme.palette.action.hover, 0.22)
            : 'transparent',
        '&:hover': !isDisabled
          ? {
              bgcolor: isSelected
                ? alpha(theme.palette.primary.main, 0.085)
                : theme.palette.mode === 'dark'
                  ? alpha(theme.palette.action.hover, 0.72)
                  : alpha(theme.palette.action.hover, 0.6),
            }
          : {},
      }}
      onClick={!isDisabled ? onToggle : undefined}
    >
      <Checkbox
        size="small"
        checked={isSelected}
        disabled={isDisabled}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        sx={{
          p: 0.375,
          '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
        }}
      />
      <Box display="flex" alignItems="center" gap={0.5} minWidth={0}>
        <Box minWidth={0}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
            {name}
          </Typography>
        </Box>
        {allowWaivers && chargeId && (
          <FeeWaiverToggle
            sourceType={waiverSourceType ?? 'Charge'}
            sourceId={chargeId}
            sourceName={name}
            remainingAmount={due}
            onApplied={onWaiverApplied}
          />
        )}
        {allowWaivers && !chargeId && safeLateFeeAmount > 0 && dueFeeId && (
          <FeeWaiverToggle
            sourceType="LateFee"
            sourceId={dueFeeId}
            sourceName={name}
            remainingAmount={safeLateFeeAmount}
            onApplied={onWaiverApplied}
          />
        )}
        {(hasRefund || hasPendingRefund) && (
          <Tooltip
            arrow
            placement="top"
            title={
              <Box>
                <Typography variant="caption" fontWeight={700} display="block">
                  Refund details
                </Typography>
                {hasRefund && (
                  <>
                    <Typography variant="caption" display="block">
                      Refunded to date: {formatNumber(refundAmount!, 'INR')}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {REFUNDED_TO_DATE_HELP}
                    </Typography>
                    {refundDescription && (
                      <Typography variant="caption" display="block">
                        {refundDescription}
                      </Typography>
                    )}
                  </>
                )}
                {hasPendingRefund && (
                  <>
                    <Typography variant="caption" display="block">
                      Refund awaiting payout: {formatNumber(pendingRefundAmount!, 'INR')}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {REFUND_AWAITING_PAYOUT_HELP}
                    </Typography>
                    {pendingRefundDescription && (
                      <Typography variant="caption" display="block">
                        {pendingRefundDescription}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            }
          >
            <Box
              component="span"
              tabIndex={0}
              aria-label="Refund details"
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'info.main',
                color: 'info.contrastText',
                fontSize: '0.6rem',
                fontWeight: 700,
                cursor: 'help',
                flexShrink: 0,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              ?
            </Box>
          </Tooltip>
        )}
        {prorationExplanation && (
          <Tooltip
            arrow
            placement="top"
            title={
              <Box>
                <Typography variant="caption" fontWeight={700} display="block">
                  Proration
                </Typography>
                {prorationPolicyName && prorationPolicyVersionNumber != null && (
                  <Typography variant="caption" display="block">
                    Policy: {prorationPolicyName}, v{prorationPolicyVersionNumber}
                  </Typography>
                )}
                {scheduledTotal !== undefined && scheduledTotal !== total && (
                  <Typography variant="caption" display="block">
                    Scheduled: {formatNumber(scheduledTotal, 'INR')} · Charged:{' '}
                    {formatNumber(total, 'INR')}
                  </Typography>
                )}
                <Typography variant="caption" display="block">
                  {prorationExplanation}
                </Typography>
              </Box>
            }
          >
            <Box
              component="span"
              onClick={(event) => event.stopPropagation()}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: '0.58rem',
                fontWeight: 700,
                cursor: 'help',
                flexShrink: 0,
              }}
            >
              P
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* TOTAL */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: 'text.secondary',
        }}
      >
        {formatNumber(total, 'INR')}
      </Typography>

      {/* PAID */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: 'text.secondary',
        }}
      >
        {formatNumber(paid, 'INR')}
      </Typography>

      {/* PENDING / DUE */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
        }}
      >
        {formatNumber(roundUpToRupee(due), 'INR')}
      </Typography>

      {/* LATE FEE */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.5,
          minWidth: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
            color: safeLateFeeAmount > 0 ? 'error.main' : 'text.secondary',
            fontWeight: safeLateFeeAmount > 0 ? 600 : 400,
          }}
        >
          {formatNumber(safeLateFeeAmount, 'INR')}
        </Typography>
        {(lateFeeExplanation || safeLateFeeWaivedAmount > 0) && (
          <Tooltip
            arrow
            placement="top"
            title={
              <Box>
                {lateFeeExplanation && (
                  <Typography variant="caption" display="block">
                    {lateFeeExplanation}
                  </Typography>
                )}
                {safeLateFeeWaivedAmount > 0 && (
                  <Typography variant="caption" display="block">
                    {formatNumber(safeLateFeeWaivedAmount, 'INR')} already waived
                  </Typography>
                )}
              </Box>
            }
          >
            <Box
              component="span"
              onClick={(e) => e.stopPropagation()}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 16,
                height: 16,
                borderRadius: '50%',
                bgcolor: 'error.main',
                color: 'error.contrastText',
                fontSize: '0.6rem',
                fontWeight: 700,
                cursor: 'help',
                flexShrink: 0,
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              ?
            </Box>
          </Tooltip>
        )}
      </Box>

      {/* CONCESSION */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          color: safeConcessionAmount > 0 ? 'success.main' : 'text.secondary',
          fontWeight: safeConcessionAmount > 0 ? 600 : 400,
        }}
      >
        {formatNumber(safeConcessionAmount, 'INR')}
      </Typography>

      {/* RECONCILIATION AMOUNT */}
      <Typography
        variant="body2"
        sx={{
          textAlign: 'right',
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
        }}
      >
        {formatNumber(safeReconciliationAmount, 'INR')}
      </Typography>

      {/* STATUS */}
      {showStatus && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {status != null && (
            <Label color={FeeCollectionStatusTypeColors[status]} variant="soft">
              {chargeId ? chargeCollectionStatusLabel(status) : feeInstallmentStatusLabel(status)}
            </Label>
          )}
        </Box>
      )}
    </Box>
  );
};

// ─── GroupHeader ───────────────────────────────────────────────────────────────

export interface GroupHeaderProps {
  label: string;
  badge: string;
  totalDue: number;
  isAllSelected: boolean;
  isPartialSelected: boolean;
  isDisabled?: boolean;
  isOpen: boolean;
  onCheckboxToggle: () => void;
  onExpandToggle: () => void;
}

export const GroupHeader = ({
  label,
  badge,
  totalDue,
  isAllSelected,
  isPartialSelected,
  isDisabled = false,
  isOpen,
  onCheckboxToggle,
  onExpandToggle,
}: GroupHeaderProps) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={1.5}
      py={1.05}
      sx={{
        bgcolor: isAllSelected
          ? alpha(theme.palette.primary.main, 0.075)
          : alpha(theme.palette.background.neutral ?? theme.palette.action.hover, 0.72),
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.18s ease, border-color 0.18s ease',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
        '&:hover': {
          bgcolor: isAllSelected
            ? alpha(theme.palette.primary.main, 0.1)
            : alpha(theme.palette.action.hover, 0.75),
        },
      }}
      onClick={onExpandToggle}
    >
      <Checkbox
        size="small"
        checked={isAllSelected}
        indeterminate={isPartialSelected}
        disabled={isDisabled}
        onChange={onCheckboxToggle}
        onClick={(e) => e.stopPropagation()}
        sx={{
          p: 0.375,
          '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
        }}
      />

      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{
          fontSize: '0.84rem',
          color: isAllSelected ? 'primary.main' : 'text.primary',
          transition: 'color 0.15s',
        }}
      >
        {label}
      </Typography>

      {/* Badge pill */}
      <Box
        sx={{
          px: 1,
          py: 0.2,
          borderRadius: 999,
          bgcolor: alpha(theme.palette.text.secondary, 0.09),
          border: `1px solid ${alpha(theme.palette.text.secondary, 0.14)}`,
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ fontSize: '0.7rem' }}
        >
          {badge}
        </Typography>
      </Box>

      <Box flex={1} />

      {/* Due amount */}
      {totalDue > 0 && (
        <Box
          sx={{
            px: 1,
            py: 0.22,
            borderRadius: 999,
            bgcolor: alpha(theme.palette.error.main, 0.09),
            border: `1px solid ${alpha(theme.palette.error.main, 0.18)}`,
            mr: 0.5,
          }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            color="error.main"
            sx={{ fontSize: '0.72rem', fontVariantNumeric: 'tabular-nums' }}
          >
            Due: ₹{formatNumber(roundUpToRupee(totalDue))}
          </Typography>
        </Box>
      )}

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onExpandToggle();
        }}
        sx={{
          p: 0.5,
          borderRadius: 1,
          color: 'text.secondary',
          transition: 'transform 0.2s ease, background-color 0.15s',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 1) },
        }}
      >
        <Iconify icon="eva:chevron-down-fill" width={16} />
      </IconButton>
    </Box>
  );
};

// ─── Re-export SelectedItem so consumers can import from one place ─────────────
