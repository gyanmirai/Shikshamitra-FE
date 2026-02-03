'use client';

import type { FormikProps } from 'formik';

import React from 'react';
import { Editor } from 'src/components/editor';
import CustomSelect from 'src/components/custom-select';
import { Grid, TextField, Autocomplete } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

import MessagePreview from './MessagePreview';
import SelectedMembersSummary from './SelectedMembersSummary';
import { useComposeMessageStep } from '../hooks/useComposeMessageStep';

import type { INotificationSendSchema } from './type';

/**
 * Component: ComposeMessageStep
 * Responsibilities:
 * - Orchestrating the message composition step
 * - Connecting UI components with the useComposeMessageStep hook
 * - Layout management for editor and preview
 */
const ComposeMessageStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
  const {
    templateData,
    isTemplatesLoading,
    importanceData,
    handleEditorChange,
    handleTemplateChange,
  } = useComposeMessageStep(formik);

  return (
    <Grid container spacing={2}>
      {/* Editor Side */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <SelectedMembersSummary formik={formik} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <SectionCard title="Compose Message">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    disabled={isTemplatesLoading}
                    options={templateData || []}
                    value={
                      templateData?.find(
                        (item: any) =>
                          item.templateName === formik.values.selectedTemplate?.templateName
                      ) || null
                    }
                    fullWidth
                    getOptionLabel={(option: any) => option.templateName}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Template"
                        size="small"
                        fullWidth
                        error={
                          formik.touched.selectedTemplate?.templateName &&
                          Boolean(formik.errors.selectedTemplate?.templateName)
                        }
                        helperText={
                          formik.touched.selectedTemplate?.templateName &&
                          formik.errors.selectedTemplate?.templateName
                        }
                      />
                    )}
                    onChange={(e, value) => handleTemplateChange(value)}
                    onBlur={() => formik.setFieldTouched('selectedTemplate.id', true)}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <CustomSelect
                    label="Importance Level *"
                    options={importanceData || []}
                    value={formik.values.selectedTemplate?.importance_level as string}
                    onChange={(val) =>
                      formik.setFieldValue('selectedTemplate.importance_level', val as string)
                    }
                    valueKey="levelName"
                    labelKey="levelName"
                    formControlProps={{ fullWidth: true }}
                    error={
                      formik.touched.selectedTemplate?.importance_level &&
                      Boolean(formik.errors.selectedTemplate?.importance_level)
                    }
                    helperText={
                      formik.touched.selectedTemplate?.importance_level &&
                      formik.errors.selectedTemplate?.importance_level
                        ? formik.errors.selectedTemplate?.importance_level
                        : undefined
                    }
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ShakingTextField
                    error={
                      !!(
                        formik.touched.selectedTemplate?.subject &&
                        formik.errors.selectedTemplate?.subject
                      )
                    }
                  >
                    <TextField
                      label="Subject *"
                      size="small"
                      fullWidth
                      value={formik.values.selectedTemplate?.subject}
                      disabled={!!formik.values.selectedTemplate?.templateName}
                      onChange={(e) => {
                        formik.setFieldValue('selectedTemplate.subject', e.target.value);
                      }}
                      error={
                        formik.touched.selectedTemplate?.subject &&
                        Boolean(formik.errors.selectedTemplate?.subject)
                      }
                      helperText={
                        formik.touched.selectedTemplate?.subject &&
                        formik.errors.selectedTemplate?.subject
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Editor
                    mentionable
                    mentionItems={[
                      { id: '1', label: 'Student Name' },
                      { id: '2', label: 'Parent Name' },
                    ]}
                    value={formik.values.selectedTemplate?.message}
                    onChange={(value) => handleEditorChange(value)}
                    placeholder="Message"
                    error={
                      !!(
                        formik.touched.selectedTemplate?.message &&
                        formik.errors.selectedTemplate?.message
                      )
                    }
                    editable={!formik.values.selectedTemplate?.templateName}
                    helperText={
                      (formik.touched.selectedTemplate?.message &&
                        formik.errors.selectedTemplate?.message) ||
                      ''
                    }
                  />
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>
        </Grid>
      </Grid>

      {/* Preview Side */}
      <Grid size={{ xs: 12, lg: 6 }}>
        <MessagePreview formik={formik} />
      </Grid>
    </Grid>
  );
};

export default ComposeMessageStep;
