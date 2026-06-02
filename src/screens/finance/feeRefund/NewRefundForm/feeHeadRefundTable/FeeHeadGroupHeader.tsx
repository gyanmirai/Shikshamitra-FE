'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatCurrency } from 'src/utils/cureencyFormater';
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

// ── Contextual icon mapping per fee head name ────────────────────────────────
const getFeeHeadIcon = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('tuition') || lower.includes('education')) return 'solar:graduation-bold';
  if (lower.includes('hostel') || lower.includes('boarding') || lower.includes('dorm'))
    return 'solar:home-bold';
  if (lower.includes('transport') || lower.includes('bus') || lower.includes('vehicle'))
    return 'solar:bus-bold';
  if (lower.includes('exam') || lower.includes('test')) return 'solar:document-bold';
  if (lower.includes('library') || lower.includes('book')) return 'solar:book-bold';
  if (lower.includes('lab') || lower.includes('science')) return 'solar:test-tube-bold';
  return 'solar:bill-list-bold';
};

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
  const icon = getFeeHeadIcon(feeHead.feeHeadName);

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

      {/* Refundable months pill */}
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
          {selectableItems.length} refundable
        </Typography>
      </Box>

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

      <Box flex={1} />

      {/* Selected refund amount */}
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
