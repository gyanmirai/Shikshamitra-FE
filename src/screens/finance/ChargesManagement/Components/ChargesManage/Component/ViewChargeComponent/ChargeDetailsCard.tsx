import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { formatNumber } from 'src/utils/formate_number';
import { ChargeWorkflowStatusOptions } from 'src/enums/fee-charges-status';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';

import type { IChargeDetailData } from '../type';

export default function ChargeViewDetailsCard({ charge }: { charge: IChargeDetailData | null }) {
  const workflow = ChargeWorkflowStatusOptions.find(
    (option) => option.value === charge?.workflowStatus
  );
  return (
    <DetailSection
      helpText="The charge amount, category and dates recorded for this request."
      title="Charge Details"
      icon="mdi:information-outline"

      action={<Label color={workflow?.color ?? 'default'}>{workflow?.label ?? 'Unknown'}</Label>}
    >
      <DetailGrid>
        <DetailField label="Charge name" value={charge?.chargeName} />
        <DetailField
          label="Amount"
          value={charge?.amount == null ? null : formatNumber(charge.amount, 'INR')}
        />
        <DetailField label="Category" value={charge?.categoryName} />
        <DetailField
          label="Due date"
          value={charge?.dueDate ? dayjs(charge.dueDate).format('DD-MM-YYYY') : null}
        />
        <DetailField
          label="Created date"
          value={charge?.appliedOn ? dayjs(charge.appliedOn).format('DD-MM-YYYY') : null}
        />
        <DetailField fullWidth label="Description" value={charge?.purposeDescription} />
      </DetailGrid>
    </DetailSection>
  );
}
