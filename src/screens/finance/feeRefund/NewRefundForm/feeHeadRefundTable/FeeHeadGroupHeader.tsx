'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Chip, Button, Tooltip, Checkbox, IconButton, Typography } from '@mui/material';

import type { IFeeHeadPayment } from '../types';

export interface FeeHeadGroupHeaderProps {
  feeHead: IFeeHeadPayment;
  selectedMonths: string[];
  isOpen: boolean;
  totalRefundInput: number;
  mode?: 'refund' | 'adjustment';
  onCheckboxToggle: () => void;
  onExpandToggle: () => void;
  applyInAllState?: { isApplying: boolean; amount: number | string };
  onApplyInAllAmountChange?: (amount: number | string) => void;
  onApplyInAllToggle?: () => void;
}

const FeeHeadGroupHeader: React.FC<FeeHeadGroupHeaderProps> = ({
  feeHead,
  selectedMonths,
  isOpen,
  totalRefundInput,
  mode = 'refund',
  onCheckboxToggle,
  onExpandToggle,
  applyInAllState = { isApplying: false, amount: '' },
  onApplyInAllAmountChange,
  onApplyInAllToggle,
}): React.ReactElement => {
  const theme = useTheme();
  const isAdj = mode === 'adjustment';
  const selectableItems = feeHead.items.filter((i) => Math.max(0, i.paid - i.refunded) > 0);
  const selectedCount = selectableItems.filter((i) => selectedMonths.includes(i.month)).length;
  const isAllSelected = selectableItems.length > 0 && selectedCount === selectableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;
  const hasSelectable = selectableItems.length > 0;
  const hasSelectedMonths = selectedMonths.length > 0;
  const hasValidApplyAmount = applyInAllState.amount !== '' && Number(applyInAllState.amount) >= 0;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1.25}
      px={1.5}
      py={1.25}
      sx={{
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
        title={!hasSelectable ? 'No refundable months for this fee head' : ''}
        placement="top"
      >
        <span>
          <Checkbox
            size="small"
            checked={isAllSelected}
            indeterminate={isPartialSelected}
            disabled={!hasSelectable}
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
      <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
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
          {selectableItems.length} {isAdj ? 'adjustable' : 'refundable'}
        </Typography>
      </Box>

      {/* Apply in all controls - visible only when months are selected */}

      {/* Fully refunded badge */}
      {!hasSelectable && (
        <Chip
          label="Fully Refunded"
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
          color="primary.main"
          sx={{
            mr: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: '6px',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {formatCurrency(totalRefundInput)}
        </Typography>
      )}

      <Box flex={1} />
      {hasSelectedMonths && (
        <Box display="flex" alignItems="center" gap={1}>
          <NumericFormatCustom
            size="small"
            value={applyInAllState.amount}
            onValueChange={(vals) => onApplyInAllAmountChange?.(vals.value)}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            placeholder=""
            inputProps={{
              // min: 0,
              style: {
                textAlign: 'right',
                fontSize: 13,
                fontVariantNumeric: 'tabular-nums',
              },
            }}
            sx={{
              width: 100,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                fontSize: 12,
                height: 32,
                '&.Mui-focused': {
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              },
            }}
          />
          <Tooltip
            title={
              hasValidApplyAmount
                ? `Apply to ${selectedMonths.length} selected month${selectedMonths.length !== 1 ? 's' : ''}`
                : 'Enter an amount first'
            }
          >
            <span>
              <Button
                size="small"
                variant="contained"
                color="success"
                disabled={!hasValidApplyAmount}
                onClick={(e) => {
                  e.stopPropagation();
                  onApplyInAllToggle?.();
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
