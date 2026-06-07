import { Box, Paper, Stack, Typography } from '@mui/material';

import { Iconify } from '../iconify';

import type { ReportSubCategory } from './types';

interface RightPanelProps {
  selectedReport: ReportSubCategory | null;
}

export default function RightPanel({ selectedReport }: RightPanelProps) {
  if (!selectedReport) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'text.secondary',
        }}
      >
        <Iconify icon="ph:files-duotone" width={64} style={{ opacity: 0.5, marginBottom: 16 }} />
        <Typography variant="body1">Select a report to configure settings</Typography>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: 'primary',
              color: 'primary.main',
              display: 'flex',
            }}
          >
            <Iconify icon="proicons:document" width={32} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6">{selectedReport?.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedReport?.description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {selectedReport.render(selectedReport)}
      </Box>
    </Paper>
  );
}
