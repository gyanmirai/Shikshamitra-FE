import { Box, Stack, Typography } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';

export function WorkflowPreservedCondition({ json }: { json: string }) {
  return (
    <Stack spacing={1}>
      <StudentFeedback notificationKey="STU-0570" presentation="inline" severity="info">
        This saved condition uses a format this editor cannot change. Its rule is preserved when you
        save the route details.
      </StudentFeedback>
      <Typography variant="subtitle2">Saved condition</Typography>
      <Box
        component="pre"
        sx={{
          m: 0,
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          maxHeight: 240,
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'anywhere',
          typography: 'body2',
        }}
      >
        {json}
      </Box>
    </Stack>
  );
}
