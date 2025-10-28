import type { FormikProps } from 'formik';

import { debounce } from 'lodash';
import React, { useCallback } from 'react';
import { Editor } from 'src/components/editor';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Chip, TextField, Typography, Autocomplete } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetImportanceLevelOptionsQuery } from 'src/redux/communication/setting/importanceLevel';
import { useGetNotificationTemplatesQuery } from 'src/redux/communication/notification/notificationTemplateApi';

import type { INotificationSendSchema } from './type';

const ComposeMessageStep = ({ formik }: { formik: FormikProps<INotificationSendSchema> }) => {
  const { data: templateData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetNotificationTemplatesQuery,
  });
  const { data: importanceData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetImportanceLevelOptionsQuery,
  });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEditorChange = useCallback(
    debounce((value, setFieldValue) => {
      const trimmedValue = value.replace(/<p>(&nbsp;|\s)*<\/p>/g, '').trim();
      setFieldValue('selectedTemplate.message', trimmedValue);
    }, 300),
    []
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }} sx={{ height: '100%' }}>
        <SectionCard title="Selected Members">
          <Grid size={{ xs: 12 }}>
            <Typography>
              {formik.values.members.filter((member: any) => member.isSelect).length > 0
                ? (() => {
                    const selectedMembers = formik.values.members
                      .filter((member: any) => member.isSelect)
                      .map((member: any) => member.name);
                    const count = selectedMembers.length;
                    if (count > 5) {
                      return (
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            flexWrap: 'wrap',
                            verticalAlign: 'middle',
                          }}
                        >
                          {selectedMembers.slice(0, 5).map((org: string) => (
                            <Chip key={org} label={org} size="small" variant="outlined" />
                          ))}
                          <Typography component="span" sx={{ ml: 0.5 }}>
                            +{count - 5}...
                          </Typography>
                        </Box>
                      );
                    }
                    return (
                      <Box
                        sx={{
                          display: 'flex',
                          gap: 0.5,
                          flexWrap: 'wrap',
                          verticalAlign: 'middle',
                        }}
                      >
                        {selectedMembers.map((org: string) => (
                          <Chip key={org} label={org} size="small" variant="outlined" />
                        ))}
                      </Box>
                    );
                  })()
                : 'Please select members to send notifications'}
            </Typography>
          </Grid>
        </SectionCard>
        <SectionCard title="Compose Message">
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                disabled={isLoading}
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
                onChange={(e, value) => {
                  formik.setFieldValue('selectedTemplate.id', value?.id ?? '');
                  formik.setFieldValue('selectedTemplate.templateName', value?.templateName ?? '');
                  formik.setFieldValue('selectedTemplate.subject', value?.subject ?? '');
                  formik.setFieldValue('selectedTemplate.message', value?.message ?? '');
                }}
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
                formControlProps={{ fullWidth: true, sx: { minWidth: 200 } }}
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
              {/* <EditorWithPlaceholder
              value={formik.values.selectedTemplate?.message || ''}
              onChange={(value) => handleEditorChange(value, formik.setFieldValue)}
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
              placeholderOptions={[
                { value: '[Student Name]', label: 'Student Name' },
                { value: '[Parent Name]', label: 'Parent Name' },
              ]}
            /> */}

              <Editor
                mentionable
                mentionItems={[
                  { id: '1', label: 'student Name' },
                  { id: '2', label: 'Parent Name' },
                ]}
                value={formik.values.selectedTemplate?.message}
                onChange={(value) => handleEditorChange(value, formik.setFieldValue)}
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

      <Grid size={{ xs: 6 }} sx={{ height: '100%' }}>
        <SectionCard title="Preview">
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {formik.values.selectedTemplate?.subject || 'Subject'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box
              component="p"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: formik.values.selectedTemplate?.message }}
            />
          </Grid>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

export default ComposeMessageStep;
