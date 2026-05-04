'use client';

import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Checkbox, Typography } from '@mui/material';

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

// â”€â”€â”€ Charges Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ChargesSectionProps {
  chargesData: IFeeCharge[];
  selectedCharges: string[];
  onToggleCharge: (chargeId: string) => void;
}

const ChargesSection = ({ chargesData, selectedCharges, onToggleCharge }: ChargesSectionProps) => {
  const theme = useTheme();

  return (
    <Box mt={2}>
      <Box display="flex" alignItems="center" gap={1} mb={1} px={0.5}>
        <Iconify icon="solar:bill-bold" sx={{ color: 'error.main', width: 16, height: 16 }} />
        <Typography variant="subtitle2" fontWeight={700} color="error.main">
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
            px={1}
            py={0.75}
            sx={{
              border: `1px solid ${isSelected ? theme.palette.error.light : theme.palette.divider}`,
              borderRadius: 1.5,
              mb: 0.75,
              cursor: isDisabled ? 'default' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              bgcolor: isSelected ? alpha(theme.palette.error.main, 0.04) : 'transparent',
              transition: 'all 0.15s',
              '&:hover': !isDisabled ? { bgcolor: alpha(theme.palette.error.main, 0.04) } : {},
            }}
            onClick={!isDisabled ? () => onToggleCharge(charge.chargeId) : undefined}
          >
            <Checkbox
              size="small"
              checked={isSelected}
              disabled={isDisabled}
              onChange={() => onToggleCharge(charge.chargeId)}
              onClick={(e) => e.stopPropagation()}
              sx={{ p: 0.5, color: 'error.light', '&.Mui-checked': { color: 'error.main' } }}
            />
            <Typography variant="body2" fontWeight={500} flex={1}>
              {charge.chargeName}
            </Typography>
            <Typography variant="body2" fontWeight={600} color="error.main">
              ₹ {formatNumber(charge.amount)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

// â”€â”€â”€ Main Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  // â”€â”€ Item toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Month group toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Fee head group toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Charge toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const toggleCharge = (chargeId: string) => {
    const exists = charges.includes(chargeId);
    onChargesChange(exists ? charges.filter((c) => c !== chargeId) : [...charges, chargeId]);
  };

  // â”€â”€ Empty state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const isEmpty =
    (activeTab === 'by-month' && !data.monthWise?.length) ||
    (activeTab === 'by-fee-head' && !data.feeHeadWise?.length);

  if (isEmpty) {
    return (
      <Box py={5} textAlign="center">
        <Iconify
          icon="solar:inbox-bold"
          sx={{ width: 40, height: 40, color: 'text.disabled', mb: 1 }}
        />
        <Typography variant="body2" color="text.secondary">
          No fee records found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
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
