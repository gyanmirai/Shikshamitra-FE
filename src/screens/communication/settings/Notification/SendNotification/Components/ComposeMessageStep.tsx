import type { FormikProps } from 'formik';

import { debounce } from 'lodash';
import React, { useCallback } from 'react';
import { Editor } from 'src/components/editor';
import CustomSelect from 'src/components/custom-select';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Card, TextField, Typography, Autocomplete } from '@mui/material';
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
      setFieldValue('selectedTemplate.message', value);
    }, 300),
    []
  );

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 8 }} sx={{ height: '100%' }}>
        <SectionCard title="Compose Message">
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              disabled={isLoading}
              options={templateData || []}
              value={
                templateData?.find(
                  (item: any) => item.templateName === formik.values.selectedTemplate?.templateName
                ) || null
              }
              fullWidth
              getOptionLabel={(option: any) => option.templateName}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Template *"
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
                <Autocomplete
                  /* …other props… */
                  onChange={(e, value) => {
                    formik.setFieldValue('selectedTemplate.id',       value?.id       ?? '');
                    formik.setFieldValue('selectedTemplate.templateName', value?.templateName ?? '');
                    formik.setFieldValue('selectedTemplate.subject',     value?.subject    ?? '');
                    formik.setFieldValue('selectedTemplate.message',     value?.message    ?? '');
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
            <TextField
              label="Subject *"
              size="small"
              fullWidth
              value={formik.values.selectedTemplate?.subject}
              disabled
              error={
                formik.touched.selectedTemplate?.subject &&
                Boolean(formik.errors.selectedTemplate?.subject)
              }
              helperText={
                formik.touched.selectedTemplate?.subject && formik.errors.selectedTemplate?.subject
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Editor
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
        </SectionCard>
      </Grid>

      <Grid size={{ xs: 4 }} sx={{ height: '100%' }}>
        <SectionCard title="Quick State">
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                borderColor: 'success.main',
                bgcolor: 'success.lighter',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: 100,
              }}
            >
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                Recipients Selected
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight={700}>
                {formik.values.members?.filter((m) => m.isSelect).length}
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Card
              sx={{
                borderColor: 'warning.main',
                bgcolor: 'warning.lighter',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: 100,
              }}
            >
              <Typography variant="h6" color="text.secondary" fontWeight={600}>
                Channels Active
              </Typography>
              <Typography variant="h6" color="warning.main" fontWeight={700}>
                {formik.values.channels.length}
              </Typography>
            </Card>
          </Grid>
        </SectionCard>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <SectionCard title="Preview">
          <Grid size={{ xs: 12 }}>
            <Box display="flex" alignItems="center">
              <Typography color="text.secondary">Channels :</Typography>
              <Typography sx={{ fontWeight: 300 }} variant="body2">
                {' '}
                {formik.values.channels.join(', ')}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Subject *"
              size="small"
              fullWidth
              value={formik.values.selectedTemplate?.subject}
              disabled
              error={
                formik.touched.selectedTemplate?.subject &&
                Boolean(formik.errors.selectedTemplate?.subject)
              }
              helperText={
                formik.touched.selectedTemplate?.subject && formik.errors.selectedTemplate?.subject
              }
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Editor
              value={formik.values.selectedTemplate?.message}
              onChange={(value) => handleEditorChange(value, formik.setFieldValue)}
              placeholder="Message"
              error={
                !!(
                  formik.touched.selectedTemplate?.message &&
                  formik.errors.selectedTemplate?.message
                )
              }
              editable={false}
              helperText={
                (formik.touched.selectedTemplate?.message &&
                  formik.errors.selectedTemplate?.message) ||
                ''
              }
            />
          </Grid>
        </SectionCard>
      </Grid>
    </Grid>
  );
};

export default ComposeMessageStep;
