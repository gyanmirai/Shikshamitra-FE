import { Alert, Box, Typography } from '@mui/material';

import type { EnrollmentBulkFailure } from './bulk-operation-errors';

type Props = {
  failures: EnrollmentBulkFailure[];
  onClose: () => void;
};

export function ExamBulkFailureAlert({ failures, onClose }: Props) {
  if (!failures.length) return null;

  return (
    <Alert severity="error" onClose={onClose}>
      <Typography variant="subtitle2">Some exam records were not updated.</Typography>
      <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>
        {failures.map((failure) => (
          <li key={failure.entityId}>
            <strong>{failure.applicantName}:</strong> {failure.reason}
          </li>
        ))}
      </Box>
      Correct the listed records and retry; successful rows were already saved.
    </Alert>
  );
}
