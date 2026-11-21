import type { LibraryIssuePlan } from 'src/redux/library/circulation-types';

import { Alert, Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';

export function IssuePlanDetails({ plan }: { plan: LibraryIssuePlan }) {
  const manual = plan.policy.isLegacyManualDate || plan.policy.terms.dueDateMode === 0;
  return (
    <FormSectionCard
      title="Checkout Preview"
      icon={GlobalIcons.bookIcon}
      descriptionTooltip="The server checks the exact copy, borrower, saved policy, reservations and dates again when you submit."
    >
      <Stack spacing={2}>
        {plan.blockedReasons.map((reason) => (
          <Alert key={reason} severity="warning">
            {reason}
          </Alert>
        ))}
        <DetailGrid>
          <DetailField
            label="Date rules"
            value={
              plan.policy.isLegacyManualDate
                ? 'Legacy manual dates'
                : manual
                  ? 'Published manual dates'
                  : 'Automatic dates'
            }
          />
          <DetailField label="Policy version" value={plan.policy.version ?? 'Legacy rules'} />
          <DetailField
            label={manual ? 'Requested due date' : 'Due date from policy'}
            value={plan.dueDate ? fDate(plan.dueDate) : 'Enter an explicit due date'}
          />
          <DetailField label="Active loans" value={plan.activeLoanCount} />
          <DetailField label="Borrowing limit" value={plan.policy.terms.maxBooksAtTime} />
        </DetailGrid>
      </Stack>
    </FormSectionCard>
  );
}
