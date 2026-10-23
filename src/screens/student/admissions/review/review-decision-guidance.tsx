import type { ReviewDecisionCapabilities } from 'src/redux/student/admissions/admission-review-types';

import { Stack } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

export function ReviewDecisionGuidance({
  capabilities,
}: {
  capabilities?: ReviewDecisionCapabilities | null;
}) {
  if (!capabilities?.managedReviewEnabled || !capabilities.blockers.length) return null;
  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      {capabilities.blockers.map((message) => (
        <StudentFeedback
          notificationKey="STU-0461"
          presentation="persistent"
          key={message}
          severity="info"
        >
          {message}
        </StudentFeedback>
      ))}
    </Stack>
  );
}
