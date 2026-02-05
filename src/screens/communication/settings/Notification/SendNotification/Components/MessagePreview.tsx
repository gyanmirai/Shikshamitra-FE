'use client';

import type { FormikProps } from 'formik';

import React, { memo } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { INotificationSendSchema } from './type';

interface MessagePreviewProps {
  formik: FormikProps<INotificationSendSchema>;
}

/**
 * Component: MessagePreview
 * Responsibilities:
 * - Rendering the subject and message HTML for preview
 * - Handling word wrap and formatting for long content
 */
const MessagePreview = ({ formik }: MessagePreviewProps) => {
  const { selectedTemplate } = formik.values;

  return (
    <SectionCard title="Preview">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Typography
            variant="subtitle1"
            color="text.primary"
            sx={{
              fontWeight: 'bold',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              pb: 1,
              mb: 1,
            }}
          >
            {selectedTemplate?.subject || 'Subject'}
          </Typography>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: 100,
              '& p': { m: 0 },
            }}
            dangerouslySetInnerHTML={{
              __html:
                selectedTemplate?.message ||
                '<span style="color:Gray">Message body will appear here...</span>',
            }}
          />
        </Grid>
      </Grid>
    </SectionCard>
  );
};

/**
 * Memoization Justification:
 * Pure component that only depends on the template subject and message.
 * Prevents re-renders of the preview pane when other form fields (e.g., audience) change.
 */
export default memo(MessagePreview);
