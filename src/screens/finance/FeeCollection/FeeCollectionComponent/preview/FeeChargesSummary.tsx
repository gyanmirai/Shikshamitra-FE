import { useMemo } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Divider, Typography } from '@mui/material';

import type { IFeeCharge, SelectedItem } from '../../Components/type';

interface Props {
  selectedItems: SelectedItem[];
  chargesData: IFeeCharge[];
  selectedChargeIds: string[];
  paidAmount: number;
}

const SummaryLine = ({
  label,
  value,
  bold,
  color,
  large,
}: {
  label: string;
  value: string;
  bold?: boolean;
  color?: string;
  large?: boolean;
}) => (
  <Box display="flex" justifyContent="space-between" alignItems="center" py={0.4}>
    <Typography
      variant={large ? 'subtitle2' : 'body2'}
      fontWeight={bold ? 700 : 400}
      color={color ?? 'text.secondary'}
    >
      {label}
    </Typography>
    <Typography
      variant={large ? 'subtitle1' : 'body2'}
      fontWeight={bold ? 700 : 500}
      color={color ?? 'text.primary'}
    >
      {value}
    </Typography>
  </Box>
);

const FeeChargesSummary = ({
  selectedItems,
  chargesData,
  selectedChargeIds,
  paidAmount,
}: Props) => {
  const itemsTotal = useMemo(
    () => selectedItems.reduce((s, i) => s + i.dueAmount, 0),
    [selectedItems]
  );

  const selectedCharges = useMemo(
    () => chargesData.filter((c) => selectedChargeIds.includes(c.chargeId)),
    [chargesData, selectedChargeIds]
  );

  const chargesTotal = useMemo(
    () => selectedCharges.reduce((s, c) => s + c.amount, 0),
    [selectedCharges]
  );

  const finalAmount = itemsTotal + chargesTotal;
  const remaining = finalAmount - paidAmount;

  return (
    <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Summary
      </Typography>
      <Divider sx={{ mb: 1 }} />

      <SummaryLine label="Fee Items Subtotal" value={`₹${formatNumber(itemsTotal)}`} />
      {chargesTotal > 0 && (
        <SummaryLine
          label="Additional Charges"
          value={`₹${formatNumber(chargesTotal)}`}
          color="error.main"
        />
      )}
      <Divider sx={{ my: 0.75 }} />
      <SummaryLine
        label="Total Payable"
        value={`₹${formatNumber(finalAmount)}`}
        bold
        large
        color="primary.main"
      />
      <SummaryLine
        label="Paying Now"
        value={`₹${formatNumber(paidAmount)}`}
        bold
        color="success.main"
      />
      {remaining > 0 && (
        <SummaryLine
          label="Remaining After Payment"
          value={`₹${formatNumber(remaining)}`}
          color="warning.main"
          bold
        />
      )}
    </Card>
  );
};

export default FeeChargesSummary;
