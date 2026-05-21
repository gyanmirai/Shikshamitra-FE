'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Chip, Checkbox, Collapse, Typography } from '@mui/material';

import { FeeRow, toPeriod, ColHeader } from './FeeLedgerShared';

import type { SelectedItem, MonthWiseGroup } from '../Components/type';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ByMonthViewProps {
  groups: MonthWiseGroup[];
  selectedItems: SelectedItem[];
  year: number;
  onToggleItem: (feeHeadId: string, month: string, due: number) => void;
  onToggleGroup: (group: MonthWiseGroup) => void;
}

// ─── Month Group ───────────────────────────────────────────────────────────────

interface MonthGroupProps {
  group: MonthWiseGroup;
  selectedItems: SelectedItem[];
  year: number;
  onToggleItem: (feeHeadId: string, month: string, due: number) => void;
  onToggleGroup: (group: MonthWiseGroup) => void;
}

const MonthGroup = ({
  group,
  selectedItems,
  year,
  onToggleItem,
  onToggleGroup,
}: MonthGroupProps) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const period = toPeriod(group.month, year);
  const selectableItems = group.items.filter((i) => i.due > 0);
  const selectedCount = selectableItems.filter((i) =>
    selectedItems.some((s) => s.feeHeadId === i.feeHeadId && s.period === period)
  ).length;

  const isAllSelected = selectableItems.length > 0 && selectedCount === selectableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;
  const urgency =
    group.totalDue > 6000
      ? 'High'
      : group.totalDue > 0
        ? 'Medium'
        : selectableItems.length > 0
          ? 'Low'
          : 'None';
  const urgencyColor =
    urgency === 'High' ? 'error.main' : urgency === 'Medium' ? 'warning.main' : 'success.main';
  console.log('group====', group);
  return (
    <Box
      sx={{
        border: `1px solid ${isAllSelected ? alpha(theme.palette.primary.main, 0.28) : alpha(theme.palette.divider, 0.78)}`,
        borderRadius: 2.4,
        overflow: 'hidden',
        mb: 1.25,
        bgcolor: 'background.paper',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isAllSelected
          ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.12)}`
          : theme.palette.mode === 'dark'
            ? `0 8px 18px ${alpha(theme.palette.common.black, 0.28)}`
            : `0 6px 16px ${alpha(theme.palette.common.black, 0.04)}`,
      }}
    >
      <Box
        sx={{
          px: 1.35,
          py: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
          bgcolor: isAllSelected
            ? alpha(theme.palette.primary.main, 0.08)
            : theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.neutral ?? theme.palette.action.hover, 0.55)
              : alpha(theme.palette.background.default, 0.35),
          cursor: 'pointer',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            bgcolor: isAllSelected ? 'primary.main' : alpha(theme.palette.primary.main, 0.35),
          },
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <Checkbox
              size="small"
              checked={isAllSelected}
              indeterminate={isPartialSelected}
              disabled={selectableItems.length === 0}
              onChange={() => onToggleGroup(group)}
              onClick={(e) => e.stopPropagation()}
              sx={{
                p: 0.35,
                '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
              }}
            />
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: 1.1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
              }}
            >
              <Iconify icon="solar:calendar-bold" width={14} sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
              {`${group.month.toUpperCase()} ${year}`}
            </Typography>
            <Chip
              label={`${group.items.length} ${group.items.length === 1 ? 'head' : 'heads'}`}
              size="small"
              variant="soft"
              color="default"
              sx={{ height: 20, fontWeight: 700 }}
            />
          </Box>

          <Box display="flex" alignItems="center" gap={0.7}>
            <Chip
              label={`Urgency: ${urgency}`}
              size="small"
              variant={urgency === 'High' ? 'filled' : 'outlined'}
              sx={{
                height: 20,
                color: urgencyColor,
                borderColor: alpha(theme.palette.text.primary, 0.18),
                bgcolor: urgency === 'High' ? alpha(theme.palette.error.main, 0.14) : 'transparent',
                fontWeight: 700,
              }}
            />
            <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800 }}>
              Due: ₹{group.totalDue.toLocaleString('en-IN')}
            </Typography>
            <Iconify
              icon="eva:chevron-down-fill"
              width={17}
              sx={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s ease' }}
            />
          </Box>
        </Box>
      </Box>

      <Collapse in={open} timeout={180}>
        <ColHeader firstLabel="Fee Head" showStatus />
        {group.items.map((item, idx) => {
          const isSelected = selectedItems.some(
            (s) => s.feeHeadId === item.feeHeadId && s.period === period
          );
          return (
            <React.Fragment key={item.feeHeadId}>
              <FeeRow
                name={item.feeHeadName}
                total={item.total}
                paid={item.paid}
                due={item.due}
                status={item.status}
                showStatus
                isSelected={isSelected}
                isDisabled={item.due === 0}
                onToggle={() => onToggleItem(item.feeHeadId, group.month, item.due)}
              />
              {idx < group.items.length - 1 && (
                <Box
                  sx={{
                    mx: 1.5,
                    borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.5)}`,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </Collapse>
    </Box>
  );
};

// ─── By Month View (exported) ──────────────────────────────────────────────────

const ByMonthView = ({
  groups,
  selectedItems,
  year,
  onToggleItem,
  onToggleGroup,
}: ByMonthViewProps) => (
  <Box>
    {groups.map((group) => (
      <MonthGroup
        key={group.month}
        group={group}
        selectedItems={selectedItems}
        year={year}
        onToggleItem={onToggleItem}
        onToggleGroup={onToggleGroup}
      />
    ))}
  </Box>
);

export default ByMonthView;
