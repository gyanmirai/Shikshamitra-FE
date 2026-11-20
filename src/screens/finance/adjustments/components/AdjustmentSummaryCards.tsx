import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/screens/finance/components/detail-view';

import type { AdjustmentRequest } from '../types/adjustment.types';
import type { AdjustmentApplySummary } from '../types/adjustmentApply.types';

export default function AdjustmentSummaryCards({
  summary,
  adjustment,
}: {
  summary: AdjustmentApplySummary;
  adjustment?: AdjustmentRequest;
}) {
  const fields = [
    { label: 'Adjustment balance', value: summary.approvedAdjustmentAmount },
    { label: 'Pending fees', value: summary.totalPendingFees },
    { label: 'Applicable adjustment', value: summary.totalAppliedAmount },
    { label: 'Remaining adjustment', value: summary.remainingAdjustmentBalance },
  ];
  return (
    <FormSectionCard
      sx={{ containerType: 'inline-size', minWidth: 0 }}
      title="Adjustment Information"
      icon={GlobalIcons.notebook}
      descriptionTooltip="The available request balance, current outstanding fees and the effect of the allocation being reviewed. Remaining adjustment may be applied in a later batch."
    >
      <DetailGrid desktopColumns={4}>
        {fields.map((field) => (
          <DetailField
            key={field.label}
            label={field.label}
            value={formatNumber(field.value, 'INR', { fractionDigits: 2 })}
          />
        ))}
        {(adjustment?.remarks || adjustment?.reason) && (
          <DetailField
            label="Remarks"
            value={adjustment.remarks || adjustment.reason}
            fullWidth
          />
        )}
      </DetailGrid>
    </FormSectionCard>
  );
}
