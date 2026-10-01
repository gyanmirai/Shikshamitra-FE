'use client';

import { motion } from 'framer-motion';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { Box, Chip, Button, Divider, Tooltip } from '@mui/material';

import { toPeriod } from './FeeLedgerShared';
import { roundUpToRupee, safeRoundingDifference } from './preview/paymentAllocationUtils';

import type { IFeeCharge, SelectedItem, FeeLedgerData } from '../Components/type';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  badgeColor?: 'error' | 'warning' | 'info' | 'success' | 'primary';
  priority?: 'high' | 'normal';
  tooltip?: string;
}

interface QuickActionToolbarProps {
  ledgerData: FeeLedgerData;
  chargesData: IFeeCharge[];
  selectedItems: SelectedItem[];
  charges: string[];
  currentYear: number;
  onSelectionChange: (items: SelectedItem[]) => void;
  onChargesChange: (ids: string[]) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const QuickActionToolbar = ({
  ledgerData,
  chargesData,
  selectedItems,
  charges,
  currentYear,
  onSelectionChange,
  onChargesChange,
}: QuickActionToolbarProps) => {
  const theme = useTheme();

  const allMonthWise = ledgerData.monthWise ?? [];

  // ── Computed badges ────────────────────────────────────────────────────────
  const currentMonthName = new Date().toLocaleString('en-IN', { month: 'long' });
  const currentMonthEnum = FeeMonth[currentMonthName as keyof typeof FeeMonth];
  const currentMonthGroup = allMonthWise.find((g) => g.month === currentMonthEnum);
  const currentMonthCount =
    currentMonthGroup?.items.filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0).length ?? 0;

  const totalDueFeeItems = allMonthWise.reduce(
    (s, g) => s + g.items.filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0).length,
    0
  );

  const pendingChargesCount = chargesData.filter(
    (c) => c.status !== 0 && c.status !== 'Paid'
  ).length;

  const selectedCount = selectedItems.length + charges.length;

  // ── Action handlers ────────────────────────────────────────────────────────

  const selectAllPending = () => {
    const items: SelectedItem[] = [];
    allMonthWise.forEach((g) => {
      const period = toPeriod(FeeMonth[g.month] as string, currentYear);
      g.items
        .filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0)
        .forEach((i) => {
          const roundedDue = roundUpToRupee(i.due);
          items.push({
            dueFeeId: i.dueFeeId,
            feeHeadId: i.feeHeadId,
            period,
            dueAmount: roundedDue,
            originalDueAmount: i.due,
            roundingAdjustment: safeRoundingDifference(i.due, roundedDue),
            lateFeeAmount: i.lateFeeAmount,
            installmentLabel: i.installmentLabel,
          });
        });
    });
    onSelectionChange(items);
    const allCharges = chargesData
      .filter((c) => c.status !== 0 && c.status !== 'Paid')
      .map((c) => c.chargeId);
    onChargesChange(allCharges);
  };

  const selectCurrentMonth = () => {
    if (!currentMonthGroup) return;
    const period = toPeriod(FeeMonth[currentMonthGroup.month] as string, currentYear);
    const items: SelectedItem[] = currentMonthGroup.items
      .filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0)
      .map((i) => {
        const roundedDue = roundUpToRupee(i.due);
        return {
          dueFeeId: i.dueFeeId,
          feeHeadId: i.feeHeadId,
          period,
          dueAmount: roundedDue,
          originalDueAmount: i.due,
          roundingAdjustment: safeRoundingDifference(i.due, roundedDue),
          lateFeeAmount: i.lateFeeAmount,
          installmentLabel: i.installmentLabel,
        };
      });
    onSelectionChange(items);
    onChargesChange([]);
  };

  const selectCurrentQuarter = () => {
    const nowMonth = new Date().getMonth();
    const quarterStart = Math.floor(nowMonth / 3) * 3;
    const quarterMonths = Array.from({ length: 3 }, (_, i) =>
      new Date(currentYear, quarterStart + i, 1).toLocaleString('en-IN', { month: 'long' })
    );
    const quarterMonthEnums = quarterMonths.map((m) => FeeMonth[m as keyof typeof FeeMonth]);
    const items: SelectedItem[] = [];
    allMonthWise.forEach((g) => {
      if (!quarterMonthEnums.includes(g.month)) return;
      const period = toPeriod(FeeMonth[g.month] as string, currentYear);
      g.items
        .filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0)
        .forEach((i) => {
          const roundedDue = roundUpToRupee(i.due);
          items.push({
            dueFeeId: i.dueFeeId,
            feeHeadId: i.feeHeadId,
            period,
            dueAmount: roundedDue,
            originalDueAmount: i.due,
            roundingAdjustment: safeRoundingDifference(i.due, roundedDue),
            lateFeeAmount: i.lateFeeAmount,
            installmentLabel: i.installmentLabel,
          });
        });
    });
    onSelectionChange(items);
  };

  const clearAll = () => {
    onSelectionChange([]);
    onChargesChange([]);
  };

  const ACTIONS: (QuickAction & { onClick: () => void })[] = [
    {
      id: 'all-pending',
      label: 'All Pending',
      icon: 'solar:check-read-bold',
      badge: totalDueFeeItems > 0 ? `${totalDueFeeItems}` : undefined,
      badgeColor: 'warning',
      tooltip: 'Select all pending fees (Ctrl+A)',
      onClick: selectAllPending,
    },
    {
      id: 'current-month',
      label: 'This Month',
      icon: 'solar:calendar-date-bold',
      badge: currentMonthCount > 0 ? `${currentMonthCount}` : undefined,
      badgeColor: 'info',
      tooltip: `Select ${currentMonthName} fees`,
      onClick: selectCurrentMonth,
    },
    {
      id: 'quarter',
      label: 'This Quarter',
      icon: 'solar:calendar-mark-bold',
      tooltip: 'Select current quarter fees',
      onClick: selectCurrentQuarter,
    },
    {
      id: 'clear',
      label: 'Clear All',
      icon: 'solar:close-circle-bold',
      badge: selectedCount > 0 ? `${selectedCount}` : undefined,
      badgeColor: 'error',
      tooltip: 'Clear all selections (Ctrl+D)',
      onClick: clearAll,
    },
  ];

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        mb: 0.85,
        px: 1,
        py: 0.75,
        borderRadius: 1.75,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.6)}`,
        // bgcolor: (t) => alpha(t.palette.background.paper, 0.9),
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        gap: 0.6,
        flexWrap: 'nowrap',
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        boxShadow: (t) => `0 4px 12px ${alpha(t.palette.common.black, 0.04)}`,
      }}
    >
      {/* <Divider orientation="vertical" flexItem sx={{ mx: 0.25, height: 18, alignSelf: 'center' }} /> */}
      {ACTIONS.map((action) => {
        const isHigh = action.priority === 'high';
        const isClear = action.id === 'clear';

        return (
          <Tooltip key={action.id} title={action.tooltip ?? ''} arrow placement="bottom">
            <Button
              size="small"
              variant={isHigh ? 'contained' : 'outlined'}
              color={isClear ? 'error' : isHigh ? 'primary' : 'inherit'}
              startIcon={<Iconify icon={action.icon} width={13} />}
              onClick={action.onClick}
              disabled={isClear && selectedCount === 0}
              sx={{
                flexShrink: 0,
                height: 28,
                px: 1.1,
                fontSize: '0.72rem',
                fontWeight: 700,
                borderRadius: 1.25,
                whiteSpace: 'nowrap',
                minWidth: 'unset',
                gap: 0.5,
                ...(!isHigh &&
                  !isClear && {
                    borderColor: (t) => alpha(t.palette.divider, 0.75),
                    '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.9) },
                  }),
              }}
            >
              {action.label}
              {action.badge && (
                <Chip
                  label={action.badge}
                  size="small"
                  color={action.badgeColor ?? 'default'}
                  variant="filled"
                  sx={{
                    height: 16,
                    ml: 0.4,
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    '& .MuiChip-label': { px: 0.5 },
                    pointerEvents: 'none',
                  }}
                />
              )}
            </Button>
          </Tooltip>
        );
      })}

      {pendingChargesCount > 0 && (
        <>
          <Divider
            orientation="vertical"
            flexItem
            sx={{ mx: 0.25, height: 18, alignSelf: 'center' }}
          />
          <Tooltip title={`${pendingChargesCount} additional charge(s) pending`}>
            <Chip
              icon={<Iconify icon="solar:bill-bold" width={12} />}
              label={`${pendingChargesCount} charges`}
              size="small"
              color="error"
              variant="soft"
              sx={{ fontWeight: 700, height: 24, borderRadius: 1 }}
            />
          </Tooltip>
        </>
      )}

      <Box flex={1} />

      {selectedCount > 0 && (
        <Chip
          label={`${selectedCount} selected`}
          size="small"
          color="primary"
          variant="soft"
          sx={{ fontWeight: 700, height: 24, borderRadius: 1, flexShrink: 0 }}
        />
      )}
    </Box>
  );
};

export default QuickActionToolbar;
