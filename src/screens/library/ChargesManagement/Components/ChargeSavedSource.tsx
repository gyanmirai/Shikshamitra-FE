import type { ChargeEditorAssessment } from 'src/redux/library/charges-management/charge-editor-types';

import { GlobalIcons } from 'src/utils/icons';
import { Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

export function ChargeSavedSource({ assessment }: { assessment: ChargeEditorAssessment }) {
  return (
    <FormSectionCard
      title="Assessment Source"
      icon={GlobalIcons.issueBook}
      descriptionTooltip="The borrower, category, loan and assessment year are retained from the saved assessment. Financial corrections are handled by Finance."
    >
      <Stack spacing={1}>
        <Typography variant="subtitle2">
          {assessment.memberName || 'Borrower name unavailable'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {assessment.role === 0 ? 'Student' : 'Staff'}
        </Typography>
        <Typography variant="body2">{assessment.chargeType}</Typography>
        {assessment.bookIssueId && (
          <Typography variant="body2">
            {assessment.bookTitle || 'Loan title unavailable'}
          </Typography>
        )}
        {assessment.accessionNo && (
          <Typography variant="body2" color="text.secondary">
            {assessment.accessionNo}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          This record retains its saved assessment year.
        </Typography>
      </Stack>
    </FormSectionCard>
  );
}
