import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflow } from 'src/redux/student/admissions/admission-workflows-api';

import CustomSelect from 'src/components/custom-select';
import { Grid, Alert, Switch, TextField, Typography, FormControlLabel } from '@mui/material';

import {
  type AdmissionOfferingFormValues,
  isAdmissionOfferingConfigurationIncomplete,
} from './admission-offering-model';

type Props = {
  formik: FormikProps<AdmissionOfferingFormValues>;
  workflows: AdmissionWorkflow[];
  forms: AdmissionForm[];
  loading: boolean;
  statusLocked?: boolean;
};

export function AdmissionOfferingConfigurationFields({
  formik,
  workflows,
  forms,
  loading,
  statusLocked,
}: Props) {
  const missingPublishedConfiguration = isAdmissionOfferingConfigurationIncomplete(formik.values);

  return (
    <Grid container spacing={1.5}>
      <Grid size={12}>
        <Typography variant="subtitle2">Admission configuration</Typography>
      </Grid>
      {missingPublishedConfiguration && !loading && (
        <Grid size={12}>
          <Alert severity="warning">
            Select a published workflow, inquiry form, and application form before activating this
            offering. You may save it as inactive while configuration is incomplete.
          </Alert>
        </Grid>
      )}
      <Grid size={12}>
        <TextField
          fullWidth
          size="small"
          label="Offering code *"
          {...formik.getFieldProps('code')}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={
            formik.touched.code ? formik.errors.code : 'A stable, unique operational code.'
          }
        />
      </Grid>
      <Grid size={12}>
        <CustomSelect
          options={workflows}
          label="Published workflow"
          value={formik.values.workflowDefinitionId ?? ''}
          onChange={(value) => formik.setFieldValue('workflowDefinitionId', value || null)}
          labelKey="name"
          valueKey="id"
          isLoading={loading}
          noOptionsMessage="No published workflows available"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={forms}
          label="Published inquiry form"
          value={formik.values.inquiryFormDefinitionId ?? ''}
          onChange={(value) => formik.setFieldValue('inquiryFormDefinitionId', value || null)}
          labelKey="name"
          valueKey="id"
          isLoading={loading}
          noOptionsMessage="No published forms available"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          options={forms}
          label="Published application form"
          value={formik.values.applicationFormDefinitionId ?? ''}
          onChange={(value) => formik.setFieldValue('applicationFormDefinitionId', value || null)}
          labelKey="name"
          valueKey="id"
          isLoading={loading}
          noOptionsMessage="No published forms available"
        />
      </Grid>
      <Grid size={12}>
        <FormControlLabel
          control={
            <Switch
              checked={formik.values.isActive}
              disabled={statusLocked}
              onChange={(_, checked) => formik.setFieldValue('isActive', checked)}
            />
          }
          label="Active"
        />
        <Typography variant="caption" color="text.secondary" display="block">
          Active offerings require a published cycle, complete forms, workflow, and valid dates.
        </Typography>
      </Grid>
    </Grid>
  );
}
