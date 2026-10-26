import { EmptyContent } from 'src/components/empty-content';
import { Box, Paper, Stack, Typography } from '@mui/material';
import { FormSectionHeader } from 'src/components/form-section-card/section-header';

import { Iconify } from '../iconify';

import type { ReportSubCategory } from './types';

interface RightPanelProps {
  selectedReport: ReportSubCategory | null;
}

export default function RightPanel({ selectedReport }: RightPanelProps) {
  if (!selectedReport) {
    return <EmptyContent title="Select a report to configure settings" />;
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
      <Box
        sx={{
          p: { xs: 2, lg: 3 },
          flexShrink: 0,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {selectedReport.configurationHelp ? (
          <FormSectionHeader
            icon="mdi:file-document-outline"
            title={selectedReport.name}
            descriptionTooltip={selectedReport.configurationHelp}
          />
        ) : (
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
        )}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>
        {selectedReport.render(selectedReport)}
      </Box>
    </Paper>
  );
}
