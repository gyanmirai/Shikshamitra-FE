import type { FormikProps } from 'formik';

import { Grid, Alert, TextField, Typography } from '@mui/material';

import { AdmissionDefinitionSelect } from './admission-definition-select';

import type {
  AdmissionDefinitionOption,
  AdmissionDefinitionFetcher,
} from './use-admission-definition-options';
import {
  type AdmissionOfferingFormValues,
  isAdmissionOfferingConfigurationIncomplete,
} from './admission-offering-model';

type Props = {
  formik: FormikProps<AdmissionOfferingFormValues>;
  fetchWorkflows: AdmissionDefinitionFetcher;
  fetchForms: AdmissionDefinitionFetcher;
  initialWorkflow?: AdmissionDefinitionOption | null;
  initialInquiryForm?: AdmissionDefinitionOption | null;
  initialApplicationForm?: AdmissionDefinitionOption | null;
};

export function AdmissionOfferingConfigurationFields({
  formik,
  fetchWorkflows,
  fetchForms,
  initialWorkflow,
  initialInquiryForm,
  initialApplicationForm,
}: Props) {
  const missingPublishedConfiguration = isAdmissionOfferingConfigurationIncomplete(formik.values);

  return (
    <Grid container spacing={1.5}>
      <Grid size={12}>
        <Typography variant="subtitle2">Admission configuration</Typography>
      </Grid>
      {missingPublishedConfiguration && (
        <Grid size={12}>
          <Alert severity="warning">
            Select a published workflow, inquiry form, and application form before activating this
            offering. You may save it as inactive while configuration is incomplete.
          </Alert>
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 7 }}>
        <TextField
          fullWidth
          size="small"
          label="Offering name *"
          {...formik.getFieldProps('name')}
          error={formik.touched.name && Boolean(formik.errors.name)}
          helperText={
            formik.touched.name
              ? formik.errors.name
              : 'A clear name shown to staff and families, such as Grade 1 General Admission.'
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 5 }}>
        <TextField
          fullWidth
          size="small"
          label="Offering code *"
          {...formik.getFieldProps('code')}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={
            formik.touched.code
              ? formik.errors.code
              : 'A stable operational code used to identify this intake.'
          }
        />
      </Grid>
      <Grid size={12}>
        <AdmissionDefinitionSelect
          label="Published workflow"
          valueId={formik.values.workflowDefinitionId ?? null}
          initialOption={initialWorkflow}
          fetchOptions={fetchWorkflows}
          onChange={(value) => formik.setFieldValue('workflowDefinitionId', value)}
          noOptionsText="No published workflows found"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <AdmissionDefinitionSelect
          label="Published inquiry form"
          valueId={formik.values.inquiryFormDefinitionId ?? null}
          initialOption={initialInquiryForm}
          fetchOptions={fetchForms}
          onChange={(value) => formik.setFieldValue('inquiryFormDefinitionId', value)}
          noOptionsText="No published forms found"
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <AdmissionDefinitionSelect
          label="Published application form"
          valueId={formik.values.applicationFormDefinitionId ?? null}
          initialOption={initialApplicationForm}
          fetchOptions={fetchForms}
          onChange={(value) => formik.setFieldValue('applicationFormDefinitionId', value)}
          noOptionsText="No published forms found"
        />
      </Grid>
      <Grid size={12}>
        <Typography variant="caption" color="text.secondary">
          Save incomplete preparation as inactive. Activation requires a published cycle, complete
          forms and workflow, and valid dates.
        </Typography>
      </Grid>
    </Grid>
  );
}
