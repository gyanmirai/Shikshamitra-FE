'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Checkbox, Typography } from '@mui/material';

import ByMonthView from './FeeLedgerByMonth';
import { toPeriod } from './FeeLedgerShared';
import ByFeeHeadView from './FeeLedgerByFeeHead';

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
      sx={{
        p: 1.5,
        borderRadius: 2.25,
        ml: 0.25,
        mt: 1.5,
        boxShadow: (t) => `0 6px 16px ${alpha(t.palette.common.black, 0.05)}`,
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.7)}`,
      }}
    >
      {/* Section header */}
      <Box display="flex" alignItems="center" gap={1} mb={1.25} px={0.5}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.25,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.error.main, 0.09),
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:bill-bold" sx={{ color: 'error.main', width: 15, height: 15 }} />
        </Box>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="error.main"
          sx={{ fontSize: '0.84rem' }}
        >
          Additional Charges
        </Typography>
      </Box>
      {chargesData.map((charge) => {
        const isSelected = selectedCharges.includes(charge.chargeId);
        const isDisabled = charge.status === 0 || charge.status === 'Paid';

        return (
          <Box
            key={charge.chargeId}
            display="flex"
            alignItems="center"
            gap={1}
            px={1.25}
            py={0.875}
            sx={{
              border: `1px solid ${
                isSelected
                  ? alpha(theme.palette.error.main, 0.35)
                  : alpha(theme.palette.error.main, 0.15)
              }`,
              borderRadius: 1.5,
              mb: 0.875,
              cursor: isDisabled ? 'default' : 'pointer',
              opacity: isDisabled ? 0.45 : 1,
              bgcolor: isSelected ? alpha(theme.palette.error.main, 0.05) : 'transparent',
              transition: 'all 0.18s ease',
              boxShadow: isSelected ? `0 0 0 2px ${alpha(theme.palette.error.main, 0.1)}` : 'none',
              '&:hover': !isDisabled
                ? {
                    bgcolor: isSelected
                      ? alpha(theme.palette.error.main, 0.08)
                      : alpha(theme.palette.action.hover, 0.6),
                    borderColor: alpha(theme.palette.error.main, 0.25),
                  }
                : {},
            }}
            onClick={!isDisabled ? () => onToggleCharge(charge.chargeId) : undefined}
          >
            <Checkbox
              size="small"
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => onToggleCharge(charge.chargeId)}
              onClick={(e) => e.stopPropagation()}
              sx={{
                p: 0.375,
                color: 'error.light',
                '&.Mui-checked': { color: 'error.main' },
                '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
              }}
            />
            <Typography
              variant="body2"
              fontWeight={isSelected ? 600 : 500}
              flex={1}
              sx={{
                fontSize: '0.8125rem',
                color: isSelected ? 'error.main' : 'text.primary',
                transition: 'color 0.15s',
              }}
            >
              {charge.chargeName}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color="error.main"
              sx={{ fontVariantNumeric: 'tabular-nums', fontSize: '0.8125rem' }}
            >
              ₹{formatNumber(charge.amount)}
            </Typography>
          </Box>
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
  // ── Item toggle ────────────────────────────────────────────────────────────
  const toggleItem = (feeHeadId: string, month: string, due: number) => {
    if (due === 0) return;
    const period = toPeriod(month, year);
    const exists = selectedItems.some((s) => s.feeHeadId === feeHeadId && s.period === period);
    if (exists) {
      onSelectionChange(
        selectedItems.filter((s) => !(s.feeHeadId === feeHeadId && s.period === period))
      );
    } else {
      onSelectionChange([...selectedItems, { feeHeadId, period, dueAmount: due }]);
    }
  };

  // ── Month group toggle ─────────────────────────────────────────────────────
  const toggleMonthGroup = (group: MonthWiseGroup) => {
    const period = toPeriod(group.month, year);
    const selectableItems = group.items.filter((i) => i.due > 0);
    const isAllSelected = selectableItems.every((i) =>
      selectedItems.some((s) => s.feeHeadId === i.feeHeadId && s.period === period)
    );

    if (isAllSelected) {
      onSelectionChange(
        selectedItems.filter(
          (s) => !(s.period === period && selectableItems.some((i) => i.feeHeadId === s.feeHeadId))
        )
      );
    } else {
      const toAdd = selectableItems
        .filter(
          (i) => !selectedItems.some((s) => s.feeHeadId === i.feeHeadId && s.period === period)
        )
        .map((i) => ({ feeHeadId: i.feeHeadId, period, dueAmount: i.due }));
      onSelectionChange([...selectedItems, ...toAdd]);
    }
  };

  // ── Fee head group toggle ──────────────────────────────────────────────────
  const toggleFeeHeadGroup = (group: FeeHeadWiseGroup) => {
    const getPeriod = (month: string) => toPeriod(month, year);
    const selectableItems = group.items.filter((i) => i.due > 0);
    const isAllSelected = selectableItems.every((i) => {
      const period = getPeriod(i.month);
      return selectedItems.some((s) => s.feeHeadId === group.feeHeadId && s.period === period);
    });

    if (isAllSelected) {
      onSelectionChange(
        selectedItems.filter(
          (s) =>
            !(
              s.feeHeadId === group.feeHeadId &&
              selectableItems.some((i) => getPeriod(i.month) === s.period)
            )
        )
      );
    } else {
      const toAdd = selectableItems
        .filter((i) => {
          const period = getPeriod(i.month);
          return !selectedItems.some((s) => s.feeHeadId === group.feeHeadId && s.period === period);
        })
        .map((i) => ({ feeHeadId: group.feeHeadId, period: getPeriod(i.month), dueAmount: i.due }));
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
    (activeTab === 'by-month' && !data.monthWise?.length) ||
    (activeTab === 'by-fee-head' && !data.feeHeadWise?.length);

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
    <Box sx={{ pl: 0.25 }}>
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

      {chargesData && chargesData.length > 0 && (
        <ChargesSection
          chargesData={chargesData}
          selectedCharges={charges}
          onToggleCharge={toggleCharge}
        />
      )}
    </Box>
  );
};

export default FeeLedgerList;
