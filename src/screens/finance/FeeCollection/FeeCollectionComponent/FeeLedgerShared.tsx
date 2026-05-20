'use client';

import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Checkbox, IconButton, Typography } from '@mui/material';
import {
  FeeCollectionStatusType,
  FeeCollectionStatusTypeColors,
} from 'src/enums/fee-collection-type';

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

export const toPeriod = (month: string, year: number): string =>
  `${year}-${String(MONTH_TO_NUM[month] ?? 0).padStart(2, '0')}`;

// ─── ColHeader ─────────────────────────────────────────────────────────────────

export const ColHeader = ({
  firstLabel,
  showStatus = false,
}: {
  firstLabel: string;
  showStatus?: boolean;
}) => (
  <Box
    display="flex"
    alignItems="center"
    pl={1.25}
    gap={1}
    pr={2}
    py={0.9}
    sx={{
      bgcolor: (theme) =>
        theme.palette.mode === 'dark'
          ? alpha(theme.palette.background.neutral ?? theme.palette.action.hover, 0.62)
          : alpha(theme.palette.text.primary, 0.035),
      borderBottom: (theme) => `1px solid ${alpha(theme.palette.divider, 0.7)}`,
    }}
  >
    {/* Checkbox placeholder */}
    <Box sx={{ width: 28 }} />
    <Typography
      variant="caption"
      color="text.disabled"
      fontWeight={700}
      textTransform="uppercase"
      letterSpacing="0.05em"
      flex={1}
      sx={{ fontSize: '0.7rem' }}
    >
      {firstLabel}
    </Typography>
    {(['TOTAL', 'PAID', 'PENDING'] as const).map((col) => (
      <Typography
        key={col}
        variant="caption"
        color="text.disabled"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.05em"
        sx={{ width: 105, textAlign: 'right', fontSize: '0.7rem' }}
      >
        {col}
      </Typography>
    ))}
    {showStatus && (
      <Typography
        variant="caption"
        color="text.disabled"
        fontWeight={700}
        textTransform="uppercase"
        letterSpacing="0.05em"
        sx={{ width: 102, textAlign: 'center', fontSize: '0.7rem' }}
      >
        STATUS
      </Typography>
    )}
  </Box>
);

// ─── FeeRow ────────────────────────────────────────────────────────────────────

export interface FeeRowProps {
  name: string;
  total: number;
  paid: number;
  due: number;
  status?: FeeCollectionStatusType;
  isSelected: boolean;
  isDisabled?: boolean;
  showStatus?: boolean;
  onToggle: () => void;
}

export const FeeRow = ({
  name,
  total,
  paid,
  due,
  status,
  isSelected,
  isDisabled = false,
  showStatus = false,
  onToggle,
}: FeeRowProps) => {
  const theme = useTheme();

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      pl={4}
      pr={2}
      py={0.95}
      sx={{
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
      <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {name}
        </Typography>
      </Box>

      {/* TOTAL */}
      <Typography
        variant="body2"
        sx={{
          width: 110,
          textAlign: 'right',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
          color: 'text.secondary',
        }}
      >
        ₹{formatNumber(total)}
      </Typography>

      {/* PAID */}
      <Typography
        variant="body2"
        sx={{
          width: 110,
          textAlign: 'right',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
          color: 'text.secondary',
        }}
      >
        ₹{formatNumber(paid)}
      </Typography>

      {/* PENDING / DUE */}
      <Typography
        variant="body2"
        sx={{
          width: 110,
          textAlign: 'right',
          flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
          fontWeight: 600,
        }}
      >
        ₹{formatNumber(due)}
      </Typography>

      {/* STATUS */}
      <Box sx={{ width: 88, display: 'flex', justifyContent: 'center' }}>
        {showStatus && status && (
          <Label color={FeeCollectionStatusTypeColors[status]} variant="soft">
            {FeeCollectionStatusType[status]}
          </Label>
        )}
      </Box>
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
            Due: ₹{formatNumber(totalDue)}
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
