import type { FeeProrationResult as FinanceResult } from 'src/redux/finance/fee-proration-result';

import { Typography } from '@mui/material';
import { fDate } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField, DetailSection } from 'src/screens/finance/components/detail-view';

/** Shared read-only output for Admission, Onboarding and withdrawal preview. */
export default function FeeProrationResult({
  result,
  title = 'Fee Proration',
  compact = false,
}: {
  result?: FinanceResult | null;
  title?: string;
  compact?: boolean;
}) {
  if (!result) return null;

  const labelTypographyProps = compact
    ? {
        color: 'text.secondary',
        sx: { fontWeight: 'fontWeightSemiBold', letterSpacing: '0.25px' },
      }
    : undefined;
  const payable = formatNumber(result.payableAmount, 'INR');

  return (
    <DetailSection
      title={title}
      icon="mdi:calendar-range"
      helpText={
        result.explanations.join(' ') ||
        'Calculated by Finance using the saved policy version and registration joining date.'
      }
    >
      <DetailGrid
        desktopColumns={compact ? 2 : undefined}
        desktopMinWidth={compact ? 320 : undefined}
      >
        <DetailField
          label="Finance policy"
          value={`${result.policyName} · v${result.policyVersion}`}
          labelTypographyProps={labelTypographyProps}
        />
        <DetailField
          label="Actual joining date"
          value={fDate(result.joiningDate)}
          labelTypographyProps={labelTypographyProps}
        />
        <DetailField
          label="Charge period"
          value={`${fDate(result.chargeStartDate)} – ${fDate(result.chargeEndDate)}`}
          labelTypographyProps={labelTypographyProps}
        />
        <DetailField
          label="Scheduled fees"
          value={formatNumber(result.scheduledAmount, 'INR')}
          labelTypographyProps={labelTypographyProps}
        />
        {result.admissionReduction > 0 && (
          <DetailField
            label="Joining date reduction"
            value={formatNumber(result.admissionReduction, 'INR')}
            labelTypographyProps={labelTypographyProps}
          />
        )}
        {result.withdrawalCredit > 0 && (
          <DetailField
            label="Withdrawal credit"
            value={formatNumber(result.withdrawalCredit, 'INR')}
            labelTypographyProps={labelTypographyProps}
          />
        )}
        <DetailField
          label="Payable fees"
          value={
            compact ? (
              <Typography
                component="strong"
                variant="inherit"
                sx={{ fontWeight: 'fontWeightSemiBold' }}
              >
                {payable}
              </Typography>
            ) : (
              payable
            )
          }
          labelTypographyProps={labelTypographyProps}
        />
        {result.excessPaidAmount > 0 && (
          <DetailField
            label="Excess paid"
            value={formatNumber(result.excessPaidAmount, 'INR')}
            secondary="Subject to Finance refund review. No cash refund is created here."
            labelTypographyProps={labelTypographyProps}
          />
        )}
      </DetailGrid>
    </DetailSection>
  );
}
