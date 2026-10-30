import { Stack, Typography } from '@mui/material';

export function WorkflowInquiryContext() {
  return (
    <Stack spacing={0.5} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1.5 }}>
      <Typography variant="subtitle2">Inquiry submitted</Typography>
      <Typography variant="body2" color="text.secondary">
        Mark the inquiry Interested, then choose Move to next stage to start this journey.
      </Typography>
    </Stack>
  );
}
