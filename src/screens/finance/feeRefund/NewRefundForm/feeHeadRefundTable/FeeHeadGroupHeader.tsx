'use client';

import React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Box, Chip, Tooltip, Checkbox, IconButton, Typography } from '@mui/material';

import type { IFeeHeadPayment } from '../types';

export interface FeeHeadGroupHeaderProps {
  feeHead: IFeeHeadPayment;
  selectedMonths: string[];
  isOpen: boolean;
  totalRefundInput: number;
  onCheckboxToggle: () => void;
  onExpandToggle: () => void;
}

const FeeHeadGroupHeader: React.FC<FeeHeadGroupHeaderProps> = ({
  feeHead,
  selectedMonths,
  isOpen,
  totalRefundInput,
  onCheckboxToggle,
  onExpandToggle,
}): React.ReactElement => {
  const theme = useTheme();
  const selectableItems = feeHead.items.filter((i) => Math.max(0, i.paid - i.refunded) > 0);
  const selectedCount = selectableItems.filter((i) => selectedMonths.includes(i.month)).length;
  const isAllSelected = selectableItems.length > 0 && selectedCount === selectableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;
  const hasSelectable = selectableItems.length > 0;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      px={1}
      py={1}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
        bgcolor: isAllSelected ? alpha(theme.palette.primary.main, 0.06) : 'background.neutral',
      }}
      onClick={onExpandToggle}
    >
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
            sx={{ p: 0.5 }}
          />
        </span>
      </Tooltip>

      <Typography variant="subtitle2" fontWeight={700}>
        {feeHead.feeHeadName}
      </Typography>

      <Box
        sx={{
          px: 0.75,
          py: 0.2,
          borderRadius: 0.5,
          bgcolor: alpha(theme.palette.text.secondary, 0.08),
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {selectableItems.length} refundable month{selectableItems.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {!hasSelectable && (
        <Chip label="Fully Refunded" size="small" sx={{ height: 20, fontSize: '10px' }} />
      )}

      <Box flex={1} />

      {totalRefundInput > 0 && (
        <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ mr: 0.5 }}>
          {formatCurrency(totalRefundInput)} selected
        </Typography>
      )}

      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onExpandToggle();
        }}
      >
        {isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
      </IconButton>
    </Box>
  );
};

export default FeeHeadGroupHeader;
