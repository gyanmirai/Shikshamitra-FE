'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Tooltip, Checkbox, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

import type { IMonthItem } from '../types';

export interface RefundMonthRowProps {
  item: IMonthItem;
  isSelected: boolean;
  isDisabled: boolean;
  disabledReason?: string;
  refundValue: number | string;
  showInputError: boolean;
  mode?: 'refund' | 'adjustment';
  isFullRefund?: boolean;
  onToggle: () => void;
  /** Receives the parsed string value from react-number-format's onValueChange. */
  onAmountChange: (value: number | string) => void;
}

const RefundMonthRow: React.FC<RefundMonthRowProps> = ({
  item,
  isSelected,
  isDisabled,
  disabledReason,
  refundValue,
  showInputError,
  mode = 'refund',
  isFullRefund = false,
  onToggle,
  onAmountChange,
}): React.ReactElement => {
  const theme = useTheme();
  const isAdj = mode === 'adjustment';
  const refundable = Math.max(0, item.refundable);
  const isFullyRefunded = refundable === 0;

  // Disable row if not selectable (only check refundable for both modes)
  const effectivelyDisabled = isDisabled || isFullyRefunded;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      pl={4}
      pr={1.5}
      sx={{
        minHeight: 52,
        opacity: effectivelyDisabled ? 0.45 : 1,
        cursor: effectivelyDisabled ? 'default' : 'pointer',
        transition: 'background-color 0.15s ease',
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.055) : 'transparent',
        borderLeft: isSelected
          ? `3px solid ${theme.palette.primary.main}`
          : '3px solid transparent',
        '&:hover': !effectivelyDisabled ? { bgcolor: alpha(theme.palette.primary.main, 0.04) } : {},
      }}
      onClick={!effectivelyDisabled ? onToggle : undefined}
    >
      {/* Animated checkbox */}
      <Tooltip title={disabledReason || ''}>
        <span>
          <Checkbox
            size="small"
            checked={isSelected}
            disabled={effectivelyDisabled}
            inputProps={{ 'aria-label': `Select ${item.month}` }}
            onChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            sx={{
              p: 0.5,
              borderRadius: '5px',
              transition: 'transform 0.15s',
              '&.Mui-checked': { color: 'primary.main' },
              '&:hover': !effectivelyDisabled ? { transform: 'scale(1.12)' } : {},
            }}
          />
        </span>
      </Tooltip>

      {/* Month name */}
      <Typography
        variant="body2"
        fontWeight={isSelected ? 700 : 500}
        flex={1}
        noWrap
        sx={{ color: isSelected ? 'primary.main' : 'text.primary', transition: 'color 0.15s' }}
      >
        {item.month}
      </Typography>

      {/* Total */}
      <Typography
        variant="body2"
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(item.total, 'INR')}
      </Typography>

      {/* Paid */}
      <Typography
        variant="body2"
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(item.paid, 'INR')}
      </Typography>

      {/* Refunded/Adjusted */}
      <Typography
        variant="body2"
        fontWeight={item.refunded > 0 ? 600 : 400}
        color={item.refunded > 0 ? 'warning.dark' : 'text.secondary'}
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(item.refunded, 'INR')}
      </Typography>

      {/* Adjustable/Refundable amount */}
      <Typography
        variant="body2"
        fontWeight={refundable > 0 ? 600 : 400}
        color={refundable > 0 ? (isAdj ? 'info.main' : 'success.main') : 'text.disabled'}
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatNumber(refundable, 'INR')}
      </Typography>

      {/* Refund/Adjustment amount input or placeholder */}
      <Box sx={{ width: 124, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
        {isSelected ? (
          <NumericFormatCustom
            size="small"
            name={`refund-${item.sourceAllocationId || item.dueFeeId}`}
            roundToWholeRupees={false}
            decimalScale={2}
            value={refundValue}
            onValueChange={(vals, source) => {
              if (source.source === 'event') onAmountChange(vals.value);
            }}
            onClick={(e) => e.stopPropagation()}
            isAllowed={
              ({ floatValue }) => floatValue === undefined || floatValue <= refundable // Limit to refundable/adjustable for both modes
            }
            disabled={isFullRefund}
            error={showInputError}
            helperText={
              showInputError
                ? Number(refundValue) > refundable
                  ? `Max ${formatNumber(refundable, 'INR')}`
                  : 'Required'
                : undefined
            }
            inputProps={{
              'aria-label': `${isAdj ? 'Adjustment' : 'Refund'} amount for ${item.month}`,
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
        ) : (
          <Typography
            variant="body2"
            color="text.disabled"
            sx={{
              pr: 1.5,
              fontStyle: effectivelyDisabled ? 'normal' : 'italic',
              fontSize: 12,
            }}
          >
            {effectivelyDisabled ? '—' : 'Not selected'}
          </Typography>
        )}
      </Box>

      {/* Status badge */}
      <Box sx={{ width: 76, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
        <Label color={FeeCollectionStatusTypeColors[item.status]} variant="soft">
          {FeeCollectionStatusType[item.status]}
        </Label>
      </Box>
    </Box>
  );
};

export default RefundMonthRow;
