'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Checkbox, Typography } from '@mui/material';
import { formatCurrency } from 'src/utils/cureencyFormater';
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
  refundValue: number | string;
  showInputError: boolean;
  mode?: 'refund' | 'adjustment';
  onToggle: () => void;
  /** Receives the parsed string value from react-number-format's onValueChange. */
  onAmountChange: (value: number | string) => void;
}

const RefundMonthRow: React.FC<RefundMonthRowProps> = ({
  item,
  isSelected,
  isDisabled,
  refundValue,
  showInputError,
  mode = 'refund',
  onToggle,
  onAmountChange,
}): React.ReactElement => {
  const theme = useTheme();
  const isAdj = mode === 'adjustment';
  const refundable = Math.max(0, item.paid - item.refunded);
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
      <Checkbox
        size="small"
        checked={isSelected}
        disabled={effectivelyDisabled}
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
        {formatCurrency(item.total)}
      </Typography>

      {/* Paid */}
      <Typography
        variant="body2"
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatCurrency(item.paid)}
      </Typography>

      {/* Refunded/Adjusted */}
      <Typography
        variant="body2"
        fontWeight={item.refunded > 0 ? 600 : 400}
        color={item.refunded > 0 ? 'warning.dark' : 'text.secondary'}
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatCurrency(item.refunded)}
      </Typography>

      {/* Adjustable/Refundable amount */}
      <Typography
        variant="body2"
        fontWeight={refundable > 0 ? 600 : 400}
        color={refundable > 0 ? (isAdj ? 'info.main' : 'success.main') : 'text.disabled'}
        sx={{ width: 90, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
      >
        {formatCurrency(refundable)}
      </Typography>

      {/* Refund/Adjustment amount input or placeholder */}
      <Box sx={{ width: 124, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
        {isSelected ? (
          <NumericFormatCustom
            size="small"
            value={refundValue}
            onValueChange={(vals) => onAmountChange(vals.value)}
            onClick={(e) => e.stopPropagation()}
            isAllowed={
              ({ floatValue }) => floatValue === undefined || floatValue <= refundable // Limit to refundable/adjustable for both modes
            }
            error={showInputError}
            helperText={
              showInputError
                ? Number(refundValue) > refundable
                  ? `Max ${formatCurrency(refundable)}`
                  : 'Required'
                : undefined
            }
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
