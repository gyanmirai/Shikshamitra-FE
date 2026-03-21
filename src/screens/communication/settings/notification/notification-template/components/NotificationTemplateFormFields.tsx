import type { FormikProps } from 'formik';

import React from 'react';
import { Editor } from 'src/components/editor';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Chip, TextField, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import type { INotificationTemplateFormValues } from '../types';

interface NotificationTemplateFormFieldsProps {
  formik: FormikProps<INotificationTemplateFormValues>;
  roleOptions: any[];
  roleLoading: boolean;
  tag: string;
  setTag: (tag: string) => void;
  handleTagKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleDeleteTag: (tag: string) => void;
  handleEditorChange: (value: string) => void;
}

const NotificationTemplateFormFields: React.FC<NotificationTemplateFormFieldsProps> = ({
  formik,
  roleOptions,
  roleLoading,
  tag,
  setTag,
  handleTagKeyDown,
  handleDeleteTag,
  handleEditorChange,
}) => (
  <SectionCard title="Basic Information">
    {/* Template Name */}
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <ShakingTextField
          error={!!(formik.touched.templateName && formik.errors.templateName) || false}
        >
          <TextField
            fullWidth
            label="Template Name *"
            name="templateName"
            size="small"
            value={formik.values.templateName}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z0-9\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('templateName', value);
            }}
            error={formik.touched.templateName && Boolean(formik.errors.templateName)}
            helperText={(formik.touched.templateName && formik.errors.templateName) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Target Role */}
      <Grid size={{ xs: 12 }}>
        <CustomSelect
          options={roleOptions}
          value={formik.values.targetRole}
          isLoading={roleLoading}
          name="targetRole"
          label="Role *"
          valueKey="name"
          labelKey="name"
          onChange={(val: any) => {
            formik.setFieldValue('targetRole', val);
          }}
          error={formik.touched.targetRole && Boolean(formik.errors.targetRole)}
          helperText={((formik.touched.targetRole && formik.errors.targetRole) as string) || ''}
        />
      </Grid>

      {/* Subject */}
      <Grid size={{ xs: 12 }}>
        <ShakingTextField error={!!(formik.touched.subject && formik.errors.subject) || false}>
          <TextField
            fullWidth
            label="Subject *"
            name="subject"
            size="small"
            value={formik.values.subject}
            onChange={(e) => {
              const value = e.target.value
                .replace(/[^a-zA-Z\s]/g, '')
                .split(' ')
                .map((word) =>
                  word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                )
                .join(' ');
              formik.setFieldValue('subject', value);
            }}
            error={formik.touched.subject && Boolean(formik.errors.subject)}
            helperText={(formik.touched.subject && formik.errors.subject) as string}
          />
        </ShakingTextField>
      </Grid>

      {/* Message Body */}
      <Grid size={{ xs: 12 }}>
        <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
          Message *
        </Typography>
        <ShakingTextField error={!!(formik.touched.message && formik.errors.message) || false}>
          <Editor
            mentionable
            mentionItems={[
              { id: '1', label: 'student Name' },
              { id: '2', label: 'Parent Name' },
            ]}
            value={formik.values.message}
            onChange={handleEditorChange}
            placeholder="Type your message here..."
            error={!!(formik.touched.message && formik.errors.message)}
            editable={!formik.values.templateName}
            helperText={(formik.touched.message && formik.errors.message) || ''}
          />
        </ShakingTextField>
      </Grid>

      {/* Tags */}
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          size="small"
          label="Tags"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          onKeyDown={handleTagKeyDown}
          InputProps={{
            startAdornment: (
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  alignItems: 'center',
                  maxWidth: '100%',
                }}
              >
                {formik.values.hashtags.map((t, index) => (
                  <Chip
                    key={index}
                    label={t}
                    onDelete={() => handleDeleteTag(t)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                ))}
              </Box>
            ),
          }}
          sx={{
            '& .MuiInputBase-root': {
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              minHeight: 'auto',
            },
            '& .MuiInputBase-input': {
              flexGrow: 1,
              minWidth: '80px',
            },
          }}
        />
      </Grid>
    </Grid>
  </SectionCard>
);

/**
 * Memoization Justification:
 * This component is expensive to render due to Editor and multiple Fields.
 * It should only re-render when formik values or options change.
 */
export default React.memo(NotificationTemplateFormFields);
