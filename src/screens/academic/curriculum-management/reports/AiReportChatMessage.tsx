import { Box, Paper, Stack, Typography } from '@mui/material';

export function AiReportUserMessage({ prompt }: { prompt: string }) {
  return (
    <Stack alignItems="flex-end" spacing={0.5} aria-label="Your report request">
      <Typography variant="caption" color="text.secondary" sx={{ pr: 0.5 }}>
        You
      </Typography>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          maxWidth: '92%',
          borderRadius: 2,
          bgcolor: 'background.neutral',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          component="p"
          sx={{ m: 0, typography: 'body2', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {prompt}
        </Box>
      </Paper>
    </Stack>
  );
}
