import type { ElectiveCorrectionReview } from 'src/redux/classManagementApi/studentElectiveAssignment/electiveCorrectionTypes';

import { Alert, Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export default function LockedElectiveImpactReview({ review }: { review: ElectiveCorrectionReview }) {
  return (
    <Stack spacing={2}>
      <FormSectionCard title="Changes" descriptionTooltip="Only this student's locked assignment will change.">
        <Typography variant="body2">Subject: {review.previousSubject} → {review.selectedSubject}</Typography>
        <Typography variant="body2">Preference: {review.previousPreference || 'No preference'} → {review.preferredSubject || 'No preference'}</Typography>
      </FormSectionCard>
      <Alert severity="warning">Confirming keeps this assignment locked. Existing marks, results, seating, submissions, and evaluations are preserved. Review any affected records separately.</Alert>
      <FormSectionCard title="Affected Records" descriptionTooltip="The backend checks related records again when you confirm. A changed or expired review must be repeated.">
        {review.impacts.length === 0 ? <Typography variant="body2">No related records are affected.</Typography> : (
          <Stack spacing={1.5} component="ul" sx={{ m: 0, pl: 2.5 }}>
            {review.impacts.map((impact, index) => (
              <Stack component="li" key={`${impact.area}-${impact.recordId ?? index}`} spacing={0.5} sx={{ display: 'list-item', overflowWrap: 'anywhere' }}>
                <Typography variant="subtitle2">{impact.area}</Typography>
                <Typography variant="body2" color="text.secondary">{impact.description}</Typography>
              </Stack>
            ))}
          </Stack>
        )}
      </FormSectionCard>
    </Stack>
  );
}
