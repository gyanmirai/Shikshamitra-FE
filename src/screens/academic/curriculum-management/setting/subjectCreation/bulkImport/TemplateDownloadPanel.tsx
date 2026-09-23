import { Iconify } from 'src/components/iconify';
import { Box, Button, Typography } from '@mui/material';

import { downloadSubjectTemplate } from './template';

export function TemplateDownloadPanel() {
  return (
    <Box
      sx={{
        p: 2,
        display: 'flex',
        gap: 2,
        alignItems: { xs: 'flex-start', sm: 'center' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
      }}
    >
      <Box>
        <Typography variant="subtitle2">Download a template</Typography>
        <Typography variant="caption" color="text.secondary">
          Keep the column names unchanged. The example row can be replaced or removed.
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:file-text-outline" />}
          onClick={() => downloadSubjectTemplate('csv')}
        >
          CSV
        </Button>
        <Button
          type="button"
          size="small"
          variant="outlined"
          startIcon={<Iconify icon="solar:document-add-outline" />}
          onClick={() => downloadSubjectTemplate('xlsx')}
        >
          Excel
        </Button>
      </Box>
    </Box>
  );
}
