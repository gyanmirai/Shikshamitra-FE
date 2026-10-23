import type { FeeProrationResult as FinanceResult } from 'src/redux/finance/fee-proration-result';

import { fDate } from 'src/utils/format-time';
import { formatNumber } from 'src/utils/formate_number';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

/** Shared read-only output for Admission, Onboarding and withdrawal preview. */
export default function FeeProrationResult({
  result,
  title = 'Fee Proration',
}: {
  result?: FinanceResult | null;
  title?: string;
}) {
  if (!result) return null;
  return (
    <DetailSection
      title={title}
      icon="mdi:calendar-range"
      helpText={
        result.explanations.join(' ') ||
        'Calculated by Finance using the saved policy version and registration joining date.'
      }
    >
      <DetailGrid>
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
        <DetailField label="Payable fees" value={formatNumber(result.payableAmount, 'INR')} />
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
