import { Alert, Stack } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

type FeeOverviewProps = {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  concession: number;
  netFee?: number;
  grossPaid?: number;
  refunded?: number;
  overpayment?: number;
  adjustment?: number;
};

export default function FeeOverview({
  total,
  paid,
  pending,
  overdue,
  concession,
  netFee,
  grossPaid = 0,
  refunded = 0,
  overpayment = 0,
  adjustment = 0,
}: FeeOverviewProps) {
  return (
    <DetailSection
      helpText="Academic-year principal fees. Net fee is after concessions and adjustment credits. Paid fee is money applied to that principal, excluding refunds and excess payment. Additional charges are listed separately."
      title="Fee Overview"
      icon="mdi:cash-multiple"
    >
      <DetailGrid desktopColumns={6}>
        <DetailField label="Total fee" value={formatNumber(total, 'INR')} />
        <DetailField label="Concession" value={formatNumber(concession, 'INR')} />
        <DetailField label="Net fee" value={netFee == null ? null : formatNumber(netFee, 'INR')} />
        <DetailField label="Paid fee" value={formatNumber(paid, 'INR')} />
        <DetailField label="Pending fee" value={formatNumber(pending, 'INR')} />
        <DetailField label="Overdue fee" value={formatNumber(overdue, 'INR')} />
      </DetailGrid>
      {(refunded > 0 || overpayment > 0 || adjustment > 0) && (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {adjustment > 0 && (
            <Alert severity="info">
              Adjustment credits: {formatNumber(adjustment, 'INR')}. These also reduce the net fee.
            </Alert>
          )}
          {refunded > 0 && (
            <Alert severity="info">
              Recorded fee payments: {formatNumber(grossPaid, 'INR')}. Refunded:{' '}
              {formatNumber(refunded, 'INR')}. Refunded money is excluded from paid fee.
            </Alert>
          )}
          {overpayment > 0 && (
            <Alert severity="warning">
              Excess fee payment: {formatNumber(overpayment, 'INR')}. This money is separate from
              the paid fee and has not been refunded. Payment history retains the original receipt
              amounts.
            </Alert>
          )}
        </Stack>
      )}
    </DetailSection>
  );
}
