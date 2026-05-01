'use client';

import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
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
  Overdue: 'error',
};

export const toPeriod = (month: string, year: number): string =>
  `${year}-${String(MONTH_TO_NUM[month] ?? 0).padStart(2, '0')}`;

export const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const getFeeHeadConfig = (name: string): { icon: string; color: string; bg: string } => {
  const n = name.toLowerCase();
  if (n.includes('tuition')) return { icon: 'solar:book-bold', color: '#1565C0', bg: '#E3F2FD' };
  if (n.includes('hostel')) return { icon: 'solar:home-2-bold', color: '#B71C1C', bg: '#FFEBEE' };
  if (n.includes('transport')) return { icon: 'solar:bus-bold', color: '#1B5E20', bg: '#E8F5E9' };
  if (n.includes('library')) return { icon: 'solar:library-bold', color: '#E65100', bg: '#FFF3E0' };
  if (n.includes('exam')) return { icon: 'solar:document-bold', color: '#4A148C', bg: '#F3E5F5' };
  if (n.includes('sport')) return { icon: 'solar:football-bold', color: '#004D40', bg: '#E0F2F1' };
  if (n.includes('lab')) return { icon: 'solar:test-tube-bold', color: '#880E4F', bg: '#FCE4EC' };
  return { icon: 'solar:wallet-bold', color: '#01579B', bg: '#E1F5FE' };
};

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
    gap={1}
    pl={2.5}
    pr={1.5}
    py={0.5}
    sx={{ bgcolor: 'action.hover' }}
  >
    <Box sx={{ width: 32 }} />
    <Typography
      variant="caption"
      color="text.disabled"
      fontWeight={700}
      textTransform="uppercase"
      flex={1}
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
        sx={{ width: 72, textAlign: 'right' }}
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
        sx={{ width: 84, textAlign: 'center' }}
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
      pl={2}
      pr={1}
      py={0.625}
      sx={{
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.5 : 1,
        transition: 'background-color 0.15s',
        '&:hover': !isDisabled ? { bgcolor: alpha(theme.palette.primary.main, 0.04) } : {},
      }}
      onClick={!isDisabled ? onToggle : undefined}
    >
      <Checkbox
        size="small"
        checked={isSelected}
        disabled={isDisabled}
        onChange={onToggle}
        onClick={(e) => e.stopPropagation()}
        sx={{ p: 0.5 }}
      />
      <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
        <Typography variant="body2" noWrap fontWeight={500}>
          {name}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ width: 72, textAlign: 'right' }}>
        {fmt(total)}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ width: 72, textAlign: 'right' }}>
        {fmt(paid)}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={due > 0 ? 600 : 400}
        color={due > 0 ? 'error.main' : 'text.secondary'}
        sx={{ width: 72, textAlign: 'right' }}
      >
        {fmt(due)}
      </Typography>

      <Box sx={{ width: 84, display: 'flex', justifyContent: 'center' }}>
        {status && (
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
      py={1}
      sx={{
        bgcolor: isAllSelected ? alpha(theme.palette.primary.main, 0.06) : 'background.neutral',
        cursor: 'pointer',
        userSelect: 'none',
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
        sx={{ p: 0.5 }}
      />

      <Typography variant="subtitle2" fontWeight={700}>
        {label}
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
          {badge}
        </Typography>
      </Box>
      <Box flex={1} />
      {totalDue > 0 && (
        <Typography variant="caption" fontWeight={700} color="error.main" sx={{ mr: 0.5 }}>
          Due: {fmt(totalDue)}
        </Typography>
      )}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onExpandToggle();
        }}
      >
        <Iconify icon={isOpen ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={18} />
      </IconButton>
    </Box>
  );
};

// ─── Re-export SelectedItem so consumers can import from one place ─────────────
