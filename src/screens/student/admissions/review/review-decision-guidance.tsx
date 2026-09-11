import type { ReviewDecisionCapabilities } from 'src/redux/student/admissions/admission-review-types';

import { Alert, Stack } from '@mui/material';

export function ReviewDecisionGuidance({
  capabilities,
}: {
  capabilities?: ReviewDecisionCapabilities | null;
}) {
  if (!capabilities?.managedReviewEnabled || !capabilities.blockers.length) return null;
  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      {capabilities.blockers.map((message) => (
        <Alert key={message} severity="info">
          {message}
        </Alert>
      ))}
    </Stack>
  );
}
