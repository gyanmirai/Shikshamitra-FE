import type { FormikProps } from 'formik';

import React from 'react';
import { Editor } from 'src/components/editor';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { CommunicationTemplateApprovalStatus } from 'src/redux/communication/communicationTypes';
import { Box, Grid, Chip, Checkbox, TextField, Typography, FormControlLabel } from '@mui/material';
import {
  channelLabel,
  communicationChannelOptions,
} from 'src/redux/communication/communicationMappers';

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

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Category *"
          name="category"
          size="small"
          value={formik.values.category}
          onChange={formik.handleChange}
          error={formik.touched.category && Boolean(formik.errors.category)}
          helperText={(formik.touched.category && formik.errors.category) as string}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Language *"
          name="languageCode"
          size="small"
          value={formik.values.languageCode}
          onChange={(e) => formik.setFieldValue('languageCode', e.target.value.toLowerCase())}
          error={formik.touched.languageCode && Boolean(formik.errors.languageCode)}
          helperText={(formik.touched.languageCode && formik.errors.languageCode) as string}
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

      <Grid size={{ xs: 12 }}>
        <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'text.secondary' }}>
          Channels *
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {communicationChannelOptions.map((option) => {
            const checked = formik.values.channels?.includes(option.value);

            return (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={checked}
                    onChange={(event) => {
                      const nextChannels = event.target.checked
                        ? [...formik.values.channels, option.value]
                        : formik.values.channels.filter((channel) => channel !== option.value);
                      formik.setFieldValue('channels', nextChannels);
                    }}
                  />
                }
                label={channelLabel(option.value)}
              />
            );
          })}
        </Box>
        {formik.touched.channels && formik.errors.channels && (
          <Typography variant="caption" color="error">
            {formik.errors.channels as string}
          </Typography>
        )}
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
            editable
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

      <Grid size={{ xs: 12 }}>
        <CustomSelect
          options={[
            { label: 'Draft', value: CommunicationTemplateApprovalStatus.Draft },
            {
              label: 'Pending Approval',
              value: CommunicationTemplateApprovalStatus.PendingApproval,
            },
            { label: 'Approved', value: CommunicationTemplateApprovalStatus.Approved },
          ]}
          value={formik.values.approvalStatus}
          name="approvalStatus"
          label="Approval Status"
          valueKey="value"
          labelKey="label"
          onChange={(val: any) => formik.setFieldValue('approvalStatus', val)}
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
