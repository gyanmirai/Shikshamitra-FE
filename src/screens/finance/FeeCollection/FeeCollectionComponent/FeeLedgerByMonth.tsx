'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { Box, Card, Chip, Divider, Checkbox, Collapse, Typography } from '@mui/material';

import { FeeRow, toPeriod, ColHeader } from './FeeLedgerShared';

import type { SelectedItem, MonthWiseGroup } from '../Components/type';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ByMonthViewProps {
  groups: MonthWiseGroup[];
  selectedItems: SelectedItem[];
  year: number;
  onToggleItem: (
    feeHeadId: string,
    month: string,
    due: number,
    itemYear?: number,
    dueFeeId?: string,
    installmentLabel?: string
  ) => void;
  onToggleGroup: (group: MonthWiseGroup) => void;
}

// ─── Month Group ───────────────────────────────────────────────────────────────

interface MonthGroupProps {
  group: MonthWiseGroup;
  selectedItems: SelectedItem[];
  year: number;
  onToggleItem: (
    feeHeadId: string,
    month: string,
    due: number,
    itemYear?: number,
    dueFeeId?: string,
    installmentLabel?: string
  ) => void;
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

  const period = toPeriod(FeeMonth[group.month] as string, group.year ?? year);
  const selectableItems = group.items.filter((i) => i.due > 0);
  const selectedCount = selectableItems.filter((i) =>
    selectedItems.some((s) => s.feeHeadId === i.feeHeadId && s.period === period)
  ).length;

  const isAllSelected = group.items.length > 0 && selectedCount === selectableItems.length;
  const isPartialSelected = selectedCount > 0 && !isAllSelected;

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        display: 'flex',
        mb: 1,
        flexDirection: 'column',
        boxShadow: (t) => `var(--shadows-4)`,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.75)}`,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
          bgcolor: isAllSelected
            ? alpha(theme.palette.primary.main, 0.08)
            : theme.palette.mode === 'dark'
              ? 'transparent'
              : 'transparent',
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
            <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>
              {`${FeeMonth[group.month]} ${group.year ?? year}`}
            </Typography>
            <Chip
              label={`${group.items.length} ${group.items.length === 1 ? 'head' : 'heads'}`}
              size="small"
              variant="soft"
              color="default"
              sx={{ height: 20, fontWeight: 700 }}
            />
          </Box>
          <Iconify
            icon="solar:alt-arrow-down-bold"
            width={18}
            sx={{
              color: 'text.secondary',
              transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </Box>
      </Box>

      <Collapse in={open} timeout={300} easing="cubic-bezier(0.4, 0, 0.2, 1)">
        <Divider />
        <ColHeader firstLabel="Fee Head" showStatus />
        {group.items.map((item, idx) => {
          const isSelected =
            item.due === 0 ||
            selectedItems.some(
              (s) =>
                (item.dueFeeId && s.dueFeeId === item.dueFeeId) ||
                (!item.dueFeeId && s.feeHeadId === item.feeHeadId && s.period === period)
            );
          return (
            <React.Fragment key={item.dueFeeId ?? `${item.feeHeadId}-${idx}`}>
              <FeeRow
                name={item.feeHeadName}
                subtitle={item.installmentLabel}
                total={item.total}
                paid={item.paid}
                due={item.due}
                reconciliationAmount={item.reconciliationAmount}
                concessionAmount={item.concessionAmount}
                refundAmount={item.refundAmount}
                refundDescription={item.refundDescription}
                lateFeeAmount={item.lateFeeAmount}
                lateFeeExplanation={item.lateFeeExplanation}
                lateFeeWaivedAmount={item.lateFeeWaivedAmount}
                dueFeeId={item.dueFeeId}
                status={item.status}
                showStatus
                isSelected={isSelected}
                isDisabled={item.due === 0}
                onToggle={() =>
                  onToggleItem(
                    item.feeHeadId,
                    FeeMonth[group.month] as string,
                    item.due,
                    group.year,
                    item.dueFeeId,
                    item.installmentLabel
                  )
                }
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
    </Card>
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
        key={`${group.month}-${group.year ?? year}`}
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
