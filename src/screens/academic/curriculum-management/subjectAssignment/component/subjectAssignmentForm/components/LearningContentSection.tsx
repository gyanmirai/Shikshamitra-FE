import React from 'react';
import { Editor } from 'src/components/editor';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Typography, FormHelperText } from '@mui/material';

interface LearningContentSectionProps {
  subject: any;
  getError: (field: string) => any;
  onChange: (field: string, value: unknown) => void;
}

export const LearningContentSection: React.FC<LearningContentSectionProps> = ({
  subject,
  getError,
  onChange,
}) => {
  const sections = [
    {
      label: 'Learning Goals',
      field: 'learningGoal',
      helperText: 'Define measurable outcomes students should achieve',
      placeholder:
        'e.g. Students will explain core concepts, analyze data, and apply problem-solving techniques independently...',
    },
    {
      label: 'Prerequisites',
      field: 'prerequisites',
      helperText: 'List concepts or skills students should already know before starting',
      placeholder:
        'e.g. Basic arithmetic, understanding of fractions and decimals, ability to read simple charts...',
    },
    {
      label: 'Description',
      field: 'description',
      helperText: 'Provide a clear overview of the subject scope and teaching objectives',
      placeholder:
        'e.g. This subject introduces foundational concepts and builds critical thinking skills through structured activities...',
    },
  ];

  return (
    <Grid container spacing={1}>
      {sections.map((section) => (
        <Grid key={section.field} size={{ xs: 12 }}>
          <Box sx={{ mb: 0.5, display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {section.label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {section.helperText}
            </Typography>
          </Box>
          <ShakingTextField error={!!getError(section.field)}>
            <Editor
              onChange={(value) => onChange(section.field, value)}
              value={(subject[section.field] as string) || ''}
              placeholder={section.placeholder}
              error={!!getError(section.field)}
              sx={{
                borderRadius: 1,
                border: (theme) =>
                  `1px solid ${
                    getError(section.field) ? theme.palette.error.main : theme.palette.divider
                  }`,
                '&:hover': { borderColor: 'text.secondary' },
                '&:focus-within': { borderColor: 'primary.main', borderWidth: 2 },
                maxHeight: 250,
                overflow: 'hidden',
              }}
            />
            {getError(section.field) && (
              <FormHelperText error sx={{ ml: 1 }}>
                {getError(section.field)}
              </FormHelperText>
            )}
          </ShakingTextField>
        </Grid>
      ))}
    </Grid>
  );
};
