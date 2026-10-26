import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { downloadSubjectTemplate } from './template';

export function TemplateDownloadPanel() {
  return (
    <FormSectionCard
      title="Import Template"
      icon={GlobalIcons.download}
      descriptionTooltip="Choose a CSV or Excel template to prepare subjects for import."
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Add up to 200 subjects. Keep the column names unchanged. The example row can be replaced
          or removed.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.documentIcon} />}
            onClick={() => downloadSubjectTemplate('csv')}
          >
            CSV
          </Button>
          <Button
            type="button"
            size="small"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.excel} />}
            onClick={() => downloadSubjectTemplate('xlsx')}
          >
            Excel
          </Button>
        </Box>
      </Box>
    </FormSectionCard>
  );
}
