import React from 'react';
import { Box, Grid, Chip, Divider, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { INotificationTemplateFormValues } from '../types';

interface NotificationTemplatePreviewProps {
  values: INotificationTemplateFormValues;
}

const NotificationTemplatePreview: React.FC<NotificationTemplatePreviewProps> = ({ values }) => {
  if (!values.templateName) return null;

  return (
    <SectionCard title="Preview">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box
            display="flex"
            flexDirection="column"
            sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Subject : {values.subject || 'No Subject'}
            </Typography>
            <Divider sx={{ my: 1 }} />
            {/* Message */}
            <Typography variant="subtitle1" fontWeight="bold">
              Dear {`{${values.targetRole || 'Role'}_name}`},
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography
                component="div"
                variant="body2"
                dangerouslySetInnerHTML={{ __html: values.message || '' }}
              />
            </Box>
            {/* Hashtags */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {values.hashtags?.map((value: string, index: number) => (
                <Chip key={index} label={`#${value}`} variant="outlined" size="small" />
              ))}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </SectionCard>
  );
};

/**
 * Memoization Justification:
 * Pure presentation component. Should only re-render when values change.
 * Prevents unnecessary re-renders when parent state unrelated to preview updates.
 */
export default React.memo(NotificationTemplatePreview);
