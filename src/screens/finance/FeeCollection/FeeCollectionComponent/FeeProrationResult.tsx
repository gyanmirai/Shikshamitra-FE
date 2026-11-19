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
        />
        <DetailField label="Actual joining date" value={fDate(result.joiningDate)} />
        <DetailField
          label="Charge period"
          value={`${fDate(result.chargeStartDate)} – ${fDate(result.chargeEndDate)}`}
        />
        <DetailField label="Scheduled fees" value={formatNumber(result.scheduledAmount, 'INR')} />
        {result.admissionReduction > 0 && (
          <DetailField
            label="Joining date reduction"
            value={formatNumber(result.admissionReduction, 'INR')}
          />
        )}
        {result.withdrawalCredit > 0 && (
          <DetailField
            label="Withdrawal credit"
            value={formatNumber(result.withdrawalCredit, 'INR')}
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
        />
        {result.excessPaidAmount > 0 && (
          <DetailField
            label="Excess paid"
            value={formatNumber(result.excessPaidAmount, 'INR')}
            secondary="Subject to Finance refund review. No cash refund is created here."
          />
        )}
      </DetailGrid>
    </DetailSection>
  );
}
