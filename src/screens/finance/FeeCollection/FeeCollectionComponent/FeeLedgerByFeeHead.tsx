'use client';

import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Divider, Collapse } from '@mui/material';

import { FeeRow, toPeriod, ColHeader, GroupHeader } from './FeeLedgerShared';

import type { SelectedItem, FeeHeadWiseGroup } from '../Components/type';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ByFeeHeadViewProps {
  groups: FeeHeadWiseGroup[];
  selectedItems: SelectedItem[];
  year: number;
  onToggleItem: (feeHeadId: string, month: string, due: number) => void;
  onToggleGroup: (group: FeeHeadWiseGroup) => void;
}

// ─── Fee Head Group ────────────────────────────────────────────────────────────

interface FeeHeadGroupProps {
  group: FeeHeadWiseGroup;
  selectedItems: SelectedItem[];
  year: number;
  onToggleItem: (feeHeadId: string, month: string, due: number) => void;
  onToggleGroup: (group: FeeHeadWiseGroup) => void;
}

const FeeHeadGroup = ({
  group,
  selectedItems,
  year,
  onToggleItem,
  onToggleGroup,
}: FeeHeadGroupProps) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();

  const selectableItems = group.items.filter((i) => i.due > 0);
  const selectedCount = selectableItems.filter((i) => {
    const period = toPeriod(i.month, year);
    return selectedItems.some((s) => s.feeHeadId === group.feeHeadId && s.period === period);
  }).length;

  const isAllSelected = selectableItems.length > 0 && selectedCount === selectableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1.5,
        overflow: 'hidden',
        mb: 1.5,
      }}
    >
      <GroupHeader
        label={group.feeHeadName}
        badge={`${group.months} ${group.months === 1 ? 'month' : 'months'}`}
        totalDue={group.totalDue}
        isAllSelected={isAllSelected}
        isPartialSelected={isPartialSelected}
        isDisabled={selectableItems.length === 0}
        isOpen={open}
        onCheckboxToggle={() => onToggleGroup(group)}
        onExpandToggle={() => setOpen((o) => !o)}
      />

      <Collapse in={open}>
        <Divider />
        <ColHeader firstLabel="Month" showStatus />
        {group.items.map((item, idx) => {
          const period = toPeriod(item.month, year);
          const isSelected = selectedItems.some(
            (s) => s.feeHeadId === group.feeHeadId && s.period === period
          );
          return (
            <React.Fragment key={item.month}>
              <FeeRow
                name={item.month}
                total={item.total}
                paid={item.paid}
                due={item.due}
                status={item.status}
                isSelected={isSelected}
                isDisabled={item.due === 0}
                showStatus
                onToggle={() => onToggleItem(group.feeHeadId, item.month, item.due)}
              />
              {idx < group.items.length - 1 && <Divider sx={{ mx: 1.5, opacity: 0.4 }} />}
            </React.Fragment>
          );
        })}
      </Collapse>
    </Box>
  );
};

// ─── By Fee Head View (exported) ───────────────────────────────────────────────

const ByFeeHeadView = ({
  groups,
  selectedItems,
  year,
  onToggleItem,
  onToggleGroup,
}: ByFeeHeadViewProps) => (
  <Box>
    {groups.map((group) => (
      <FeeHeadGroup
        key={group.feeHeadId}
        group={group}
        selectedItems={selectedItems}
        year={year}
        onToggleItem={onToggleItem}
        onToggleGroup={onToggleGroup}
      />
    ))}
  </Box>
);

export default ByFeeHeadView;
