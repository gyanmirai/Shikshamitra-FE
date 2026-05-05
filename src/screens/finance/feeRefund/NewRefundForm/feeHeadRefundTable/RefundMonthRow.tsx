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
  refundValue: number;
  showInputError: boolean;
  onToggle: () => void;
  onAmountChange: (raw: string) => void;
}

const RefundMonthRow: React.FC<RefundMonthRowProps> = ({
  item,
  isSelected,
  isDisabled,
  refundValue,
  showInputError,
  onToggle,
  onAmountChange,
}): React.ReactElement => {
  const theme = useTheme();
  const refundable = Math.max(0, item.paid - item.refunded);
  const isFullyRefunded = refundable === 0;
  const effectivelyDisabled = isDisabled || isFullyRefunded;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      pl={4}
      pr={1.5}
      py={0.75}
      sx={{
        opacity: effectivelyDisabled ? 0.5 : 1,
        cursor: effectivelyDisabled ? 'default' : 'pointer',
        transition: 'background-color 0.15s',
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.06) : 'transparent',
        '&:hover': !effectivelyDisabled ? { bgcolor: alpha(theme.palette.primary.main, 0.04) } : {},
      }}
      onClick={!effectivelyDisabled ? onToggle : undefined}
    >
      <Checkbox
        size="small"
        checked={isSelected}
        disabled={effectivelyDisabled}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        sx={{ p: 0.5 }}
      />

      <Typography variant="body2" fontWeight={500} flex={1} noWrap>
        {item.month}
      </Typography>

      <Typography variant="body2" sx={{ width: 88, textAlign: 'right' }}>
        {formatCurrency(item.total)}
      </Typography>
      <Typography variant="body2" sx={{ width: 88, textAlign: 'right' }}>
        {formatCurrency(item.paid)}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={item.refunded > 0 ? 600 : 400}
        color={item.refunded > 0 ? 'error.main' : 'text.secondary'}
        sx={{ width: 88, textAlign: 'right' }}
      >
        {formatCurrency(item.refunded)}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={refundable > 0 ? 600 : 400}
        color={refundable > 0 ? 'success.main' : 'text.disabled'}
        sx={{ width: 88, textAlign: 'right' }}
      >
        {formatCurrency(refundable)}
      </Typography>

      <Box sx={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
        {isSelected ? (
          <NumericFormatCustom
            size="small"
            value={refundValue}
            onChange={(e) => onAmountChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            isAllowed={({ floatValue }) => floatValue === undefined || floatValue <= refundable}
            error={showInputError}
            helperText={
              showInputError
                ? Number(refundValue) > refundable
                  ? `Max ${formatCurrency(refundable)}`
                  : 'Required'
                : undefined
            }
            inputProps={{ min: 0, max: refundable, style: { textAlign: 'right', fontSize: 13 } }}
            placeholder="0"
            sx={{ width: 110 }}
          />
        ) : (
          <Typography variant="body2" color="text.disabled" sx={{ pr: 1.5 }}>
            —
          </Typography>
        )}
      </Box>

      <Box sx={{ width: 72, display: 'flex', justifyContent: 'flex-end' }}>
        <Label color={FeeCollectionStatusTypeColors[item.status]} sx={{ fontSize: 11 }}>
          {FeeCollectionStatusType[item.status]}
        </Label>
      </Box>
    </Box>
  );
};

export default RefundMonthRow;
