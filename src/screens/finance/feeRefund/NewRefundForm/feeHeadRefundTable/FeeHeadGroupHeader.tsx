'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Chip, Button, Tooltip, Checkbox, IconButton, Typography } from '@mui/material';

import type { IFeeHeadPayment } from '../types';

export interface FeeHeadGroupHeaderProps {
  feeHead: IFeeHeadPayment;
  selectedMonths: string[];
  isOpen: boolean;
  totalRefundInput: number;
  mode?: 'refund' | 'adjustment';
  selectedReceiptId?: string;
  onCheckboxToggle: () => void;
  onExpandToggle: () => void;
  applyInAllState?: { amount: number | string };
  isFullRefund?: boolean;
  onApplyInAllAmountChange?: (amount: number | string) => void;
  onApplyInAll?: () => void;
}

const FeeHeadGroupHeader: React.FC<FeeHeadGroupHeaderProps> = ({
  feeHead,
  selectedMonths,
  isOpen,
  totalRefundInput,
  mode = 'refund',
  selectedReceiptId,
  onCheckboxToggle,
  onExpandToggle,
  applyInAllState = { amount: '' },
  isFullRefund = false,
  onApplyInAllAmountChange,
  onApplyInAll,
}): React.ReactElement => {
  const theme = useTheme();
  const isAdj = mode === 'adjustment';
  const refundableItems = feeHead.items.filter((i) => i.refundable > 0);
  const selectableItems = refundableItems.filter(
    (item) => isAdj || !selectedReceiptId || item.sourceReceiptId === selectedReceiptId
  );
  const selectedCount = refundableItems.filter((i) => selectedMonths.includes(i.month)).length;
  const isAllSelected = refundableItems.length > 0 && selectedCount === refundableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;
  const hasSelectable = selectableItems.length > 0;
  const hasSelectedMonths = selectedMonths.length > 0;
  const hasValidApplyAmount =
    String(applyInAllState.amount).trim() !== '' &&
    Number.isFinite(Number(applyInAllState.amount)) &&
    Number(applyInAllState.amount) > 0;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={1.5}
      py={1.25}
      sx={{
        flexWrap: 'wrap',
        minWidth: 0,
        cursor: 'pointer',
        userSelect: 'none',
        bgcolor: isAllSelected ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
        transition: 'background-color 0.2s ease',
        '&:hover': {
          bgcolor: isAllSelected
            ? alpha(theme.palette.primary.main, 0.09)
            : alpha(theme.palette.action.hover, 0.8),
        },
      }}
      onClick={onExpandToggle}
    >
      {/* Checkbox */}
      <Tooltip
        title={
          !hasSelectable && refundableItems.length > 0
            ? 'Clear the selected installments to choose this receipt.'
            : !hasSelectable
              ? isAdj
                ? 'No adjustable months for this fee head'
                : 'No refundable months for this fee head'
              : ''
        }
        placement="top"
      >
        <span>
          <Checkbox
            size="small"
            checked={isAllSelected}
            indeterminate={isPartialSelected}
            disabled={!hasSelectable}
            inputProps={{
              'aria-label': `Select refundable installments for ${feeHead.feeHeadName}`,
            }}
            onChange={onCheckboxToggle}
            onClick={(e) => e.stopPropagation()}
            sx={{
              p: 0.5,
              borderRadius: '6px',
              '&.Mui-checked': { color: 'primary.main' },
              '&.MuiCheckbox-indeterminate': { color: 'primary.main' },
              transition: 'transform 0.15s',
              '&:hover': { transform: 'scale(1.1)' },
            }}
          />
        </span>
      </Tooltip>

      {/* Fee head name */}
      <Typography
        variant="subtitle2"
        fontWeight={700}
        sx={{ lineHeight: 1.4, minWidth: 0, overflowWrap: 'anywhere', flex: '1 1 120px' }}
      >
        {feeHead.feeHeadName}
      </Typography>

      {/* Adjustable/Refundable months pill */}
      <Box
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 999,
          bgcolor: alpha(theme.palette.text.secondary, 0.08),
          border: `1px solid ${alpha(theme.palette.text.secondary, 0.12)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ fontSize: 10 }}>
          {refundableItems.length} {isAdj ? 'adjustable' : 'refundable'}
        </Typography>
      </Box>

      {/* Apply in all controls - visible only when months are selected */}

      {/* Fully refunded badge */}
      {refundableItems.length === 0 && (
        <Chip
          label={isAdj ? 'Fully Adjusted' : 'Fully Refunded'}
          size="small"
          color="success"
          variant="soft"
          sx={{ height: 18, fontSize: 10, fontWeight: 600 }}
        />
      )}
      {totalRefundInput > 0 && (
        <Typography
          variant="caption"
          fontWeight={700}
          color="info.main"
          sx={{
            mr: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: alpha(theme.palette.info.main, 0.08),
            whiteSpace: 'nowrap',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatNumber(totalRefundInput, 'INR')}
        </Typography>
      )}

      {hasSelectedMonths && !isFullRefund && (
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          sx={{
            width: { xs: 1, sm: 'auto' },
            order: { xs: 1, sm: 0 },
            justifyContent: 'flex-end',
            flexShrink: 0,
          }}
        >
          <NumericFormatCustom
            size="small"
            label="Amount per installment"
            fullWidth
            name={`apply-amount-${feeHead.feeHeadId}`}
            roundToWholeRupees={false}
            decimalScale={2}
            value={applyInAllState.amount}
            onValueChange={(vals, source) => {
              if (source.source === 'event') onApplyInAllAmountChange?.(vals.value);
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            inputProps={{
              'aria-label': `Amount for selected installments in ${feeHead.feeHeadName}`,
              // min: 0,
              style: {
                textAlign: 'right',
                fontSize: 13,
                fontVariantNumeric: 'tabular-nums',
              },
            }}
            sx={{
              width: { xs: 'auto', sm: 180 },
              minWidth: 140,
              flex: { xs: 1, sm: 'initial' },
            }}
          />
          <Tooltip
            title={
              hasValidApplyAmount
                ? `Replace amounts for ${selectedMonths.length} selected installment${selectedMonths.length !== 1 ? 's' : ''}, up to each ${isAdj ? 'adjustable' : 'refundable'} balance`
                : 'Enter an amount first'
            }
          >
            <span>
              <Button
                size="small"
                variant="contained"
                disabled={!hasValidApplyAmount}
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyInAll?.();
                }}
                sx={{ minWidth: 50, fontWeight: 700, fontSize: '0.72rem', borderRadius: 1 }}
              >
                Apply
              </Button>
            </span>
          </Tooltip>
        </Box>
      )}
      {/* Selected refund amount */}

      {/* Expand / Collapse chevron */}
      <IconButton
        size="small"
        aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${feeHead.feeHeadName}`}
        aria-expanded={isOpen}
        onClick={(e) => {
          e.stopPropagation();
          onExpandToggle();
        }}
        sx={{
          p: 0.5,
          borderRadius: '8px',
          transition: 'transform 0.25s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        <Iconify icon="solar:alt-arrow-down-bold" width={16} />
      </IconButton>
    </Box>
  );
};

export default FeeHeadGroupHeader;
