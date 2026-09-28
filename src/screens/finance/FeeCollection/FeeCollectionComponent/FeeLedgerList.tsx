'use client';

import { motion } from 'framer-motion';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import ByMonthView from './FeeLedgerByMonth';
import ByFeeHeadView from './FeeLedgerByFeeHead';
import { FeeRow, toPeriod, ColHeader } from './FeeLedgerShared';

import type { FeeLedgerTab } from './FeeLedgerFilterBar';
import type {
  IFeeCharge,
  SelectedItem,
  FeeLedgerData,
  MonthWiseGroup,
  FeeHeadWiseGroup,
} from '../Components/type';

// ─── Charges Section ───────────────────────────────────────────────────────────

interface ChargesSectionProps {
  chargesData: IFeeCharge[];
  selectedCharges: string[];
  onToggleCharge: (chargeId: string) => void;
}

const ChargesSection = ({ chargesData, selectedCharges, onToggleCharge }: ChargesSectionProps) => {
  const theme = useTheme();

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        mb: 1.25,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: (t) => `var(--shadows-4)`,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.75)}`,
      }}
    >
      {/* Section header */}
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        px={1.35}
        py={1}
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.65)}`,
          bgcolor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.neutral ?? theme.palette.action.hover, 0.55)
              : alpha(theme.palette.background.default, 0.35),
        }}
      >
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.text.secondary, 0.09),
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:bill-bold" sx={{ color: 'text.secondary', width: 15, height: 15 }} />
        </Box>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.primary"
          sx={{ fontSize: '0.84rem' }}
        >
          Additional Charges
        </Typography>
      </Box>

      {/* Column Header */}
      <ColHeader firstLabel="Charge Name" showStatus />

      {/* Charge Rows */}
      {chargesData.map((charge) => {
        const isDisabled = charge.amount <= 0;
        const isSelected = selectedCharges.includes(charge.chargeId) || isDisabled;

        return (
          <FeeRow
            key={charge.chargeId}
            name={charge.chargeName}
            subtitle={charge.isSystemGenerated ? 'System generated' : undefined}
            total={charge.total ?? charge.amount}
            paid={charge.paid ?? 0}
            due={charge.amount}
            chargeId={charge.chargeId}
            waiverSourceType={charge.sourceType}
            onWaiverApplied={isSelected && !isDisabled ? () => onToggleCharge(charge.chargeId) : undefined}
            status={charge.status as FeeCollectionStatusType}
            isSelected={isSelected}
            isDisabled={isDisabled}
            showStatus
            onToggle={() => onToggleCharge(charge.chargeId)}
          />
        );
      })}
    </Card>
  );
};

// ─── Main Export ───────────────────────────────────────────────────────────────

export interface FeeLedgerListProps {
  data: FeeLedgerData;
  activeTab: FeeLedgerTab;
  selectedItems: SelectedItem[];
  charges: string[];
  chargesData?: IFeeCharge[];
  onSelectionChange: (items: SelectedItem[]) => void;
  onChargesChange: (chargeIds: string[]) => void;
  year?: number;
}

const FeeLedgerList = ({
  data,
  activeTab,
  selectedItems,
  charges,
  chargesData,
  onSelectionChange,
  onChargesChange,
  year = new Date().getFullYear(),
}: FeeLedgerListProps) => {
  const isItemSelected = (
    selected: SelectedItem[],
    feeHeadId: string,
    period: string,
    dueFeeId?: string
  ) =>
    selected.some((s) =>
      dueFeeId
        ? s.dueFeeId === dueFeeId
        : s.feeHeadId === feeHeadId && s.period === period && !s.dueFeeId
    );

  // ── Item toggle ────────────────────────────────────────────────────────────
  const toggleItem = (
    feeHeadId: string,
    month: string,
    due: number,
    itemYear?: number,
    dueFeeId?: string,
    installmentLabel?: string,
    lateFeeAmount?: number
  ) => {
    if (due === 0 && (lateFeeAmount ?? 0) === 0) return;
    const period = toPeriod(month, itemYear ?? year);
    const exists = isItemSelected(selectedItems, feeHeadId, period, dueFeeId);
    if (exists) {
      onSelectionChange(
        selectedItems.filter((s) =>
          dueFeeId
            ? s.dueFeeId !== dueFeeId
            : !(s.feeHeadId === feeHeadId && s.period === period && !s.dueFeeId)
        )
      );
    } else {
      onSelectionChange([
        ...selectedItems,
        { dueFeeId, feeHeadId, period, dueAmount: due, lateFeeAmount, installmentLabel },
      ]);
    }
  };

  // ── Month group toggle ─────────────────────────────────────────────────────
  const toggleMonthGroup = (group: MonthWiseGroup) => {
    const period = toPeriod(FeeMonth[group.month] as string, group.year ?? year);
    const selectableItems = group.items.filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0);
    const isAllSelected = selectableItems.every((i) =>
      isItemSelected(selectedItems, i.feeHeadId, period, i.dueFeeId)
    );

    if (isAllSelected) {
      onSelectionChange(
        selectedItems.filter(
          (s) =>
            !(
              s.period === period &&
              selectableItems.some((i) =>
                i.dueFeeId ? s.dueFeeId === i.dueFeeId : s.feeHeadId === i.feeHeadId && !s.dueFeeId
              )
            )
        )
      );
    } else {
      const toAdd = selectableItems
        .filter((i) => !isItemSelected(selectedItems, i.feeHeadId, period, i.dueFeeId))
        .map((i) => ({
          dueFeeId: i.dueFeeId,
          feeHeadId: i.feeHeadId,
          period,
          dueAmount: i.due,
          lateFeeAmount: i.lateFeeAmount,
          installmentLabel: i.installmentLabel,
        }));
      onSelectionChange([...selectedItems, ...toAdd]);
    }
  };

  // ── Fee head group toggle ──────────────────────────────────────────────────
  const toggleFeeHeadGroup = (group: FeeHeadWiseGroup) => {
    const getPeriod = (item: { month: any; year?: number }) =>
      toPeriod(FeeMonth[item.month] as string, item.year ?? year);
    const selectableItems = group.items.filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0);
    const isAllSelected = selectableItems.every((i) => {
      const period = getPeriod(i);
      return isItemSelected(selectedItems, group.feeHeadId, period, i.dueFeeId);
    });

    if (isAllSelected) {
      onSelectionChange(
        selectedItems.filter(
          (s) =>
            !(
              s.feeHeadId === group.feeHeadId &&
              selectableItems.some((i) => {
                const period = getPeriod(i);
                return i.dueFeeId ? s.dueFeeId === i.dueFeeId : s.period === period && !s.dueFeeId;
              })
            )
        )
      );
    } else {
      const toAdd = selectableItems
        .filter((i) => {
          const period = getPeriod(i);
          return !isItemSelected(selectedItems, group.feeHeadId, period, i.dueFeeId);
        })
        .map((i) => ({
          dueFeeId: i.dueFeeId,
          feeHeadId: group.feeHeadId,
          period: getPeriod(i),
          dueAmount: i.due,
          lateFeeAmount: i.lateFeeAmount,
          installmentLabel: i.installmentLabel,
        }));
      onSelectionChange([...selectedItems, ...toAdd]);
    }
  };

  // ── Charge toggle ──────────────────────────────────────────────────────────
  const toggleCharge = (chargeId: string) => {
    const exists = charges.includes(chargeId);
    onChargesChange(exists ? charges.filter((c) => c !== chargeId) : [...charges, chargeId]);
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  const isEmpty =
    !chargesData?.length &&
    ((activeTab === 'by-month' && !data.monthWise?.length) ||
      (activeTab === 'by-fee-head' && !data.feeHeadWise?.length));

  if (isEmpty) {
    return (
      <Box
        py={6}
        textAlign="center"
        sx={{
          borderRadius: 2,
          border: (t) => `1px dashed ${alpha(t.palette.divider, 0.85)}`,
          bgcolor: (t) => alpha(t.palette.action.hover, 0.25),
        }}
      >
        <Iconify
          icon="solar:inbox-bold"
          sx={{ width: 40, height: 40, color: 'text.disabled', mb: 1.5 }}
        />
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          No fee records found
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
          Records will appear here once available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pl: 0.25, mb: 1 }}>
      {chargesData && chargesData.length > 0 && (
        <ChargesSection
          chargesData={chargesData}
          selectedCharges={charges}
          onToggleCharge={toggleCharge}
        />
      )}

      {activeTab === 'by-month' && (
        <ByMonthView
          groups={data.monthWise}
          selectedItems={selectedItems}
          year={year}
          onToggleItem={toggleItem}
          onToggleGroup={toggleMonthGroup}
        />
      )}

      {activeTab === 'by-fee-head' && (
        <ByFeeHeadView
          groups={data.feeHeadWise}
          selectedItems={selectedItems}
          year={year}
          onToggleItem={toggleItem}
          onToggleGroup={toggleFeeHeadGroup}
        />
      )}

    </Box>
  );
};

export default FeeLedgerList;
