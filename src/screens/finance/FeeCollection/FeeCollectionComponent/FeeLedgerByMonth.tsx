'use client';

import React, { useState } from 'react';
import { Box, Collapse } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { FeeRow, toPeriod, ColHeader, GroupHeader } from './FeeLedgerShared';

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

  return (
    <Box
      sx={{
        border: `1px solid ${isAllSelected ? alpha(theme.palette.primary.main, 0.28) : theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        mb: 1.5,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isAllSelected ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}` : 'none',
      }}
    >
      <GroupHeader
        label={group.month}
        badge={`${group.items.length} ${group.items.length === 1 ? 'item' : 'items'}`}
        totalDue={group.totalDue}
        isAllSelected={isAllSelected}
        isPartialSelected={isPartialSelected}
        isDisabled={selectableItems.length === 0}
        isOpen={open}
        onCheckboxToggle={() => onToggleGroup(group)}
        onExpandToggle={() => setOpen((o) => !o)}
      />

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
