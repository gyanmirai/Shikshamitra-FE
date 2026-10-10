import type { FormikProps } from 'formik';

import { Grid, Alert, MenuItem, TextField, Typography } from '@mui/material';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useGetAdmissionIntakeSetupsQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionDefinitionSelect } from './admission-definition-select';
import {
  type AdmissionOfferingFormValues,
  isAdmissionOfferingConfigurationIncomplete,
} from './admission-offering-model';
import {
  getIntakeSetupSelection,
  findSelectedIntakeSetup,
  hasLegacyIntakeSelection,
} from './admission-intake-setup-selection';

import type {
  AdmissionDefinitionOption,
  AdmissionDefinitionFetcher,
} from './use-admission-definition-options';

type Props = {
  formik: FormikProps<AdmissionOfferingFormValues>;
  fetchWorkflows: AdmissionDefinitionFetcher;
  fetchInquiryForms: AdmissionDefinitionFetcher;
  initialWorkflow?: AdmissionDefinitionOption | null;
  initialInquiryForm?: AdmissionDefinitionOption | null;
};

export function AdmissionOfferingConfigurationFields({
  formik,
  fetchWorkflows,
  fetchInquiryForms,
  initialWorkflow,
  initialInquiryForm,
}: Props) {
  const missingPublishedConfiguration = isAdmissionOfferingConfigurationIncomplete(formik.values);
  const startsWithInquiry = formik.values.entryMode !== 1;
  const inquiryForm = useGetAdmissionFormQuery(formik.values.inquiryFormDefinitionId ?? '', {
    skip: !formik.values.inquiryFormDefinitionId,
  });
  const setups = useGetAdmissionIntakeSetupsQuery();
  const selectedSetup = findSelectedIntakeSetup(
    setups.data ?? [],
    formik.values.inquiryIntakeProfileId,
    formik.values.counsellorAssignmentProfileId,
    startsWithInquiry
  );
  const legacySelection = hasLegacyIntakeSelection(
    selectedSetup,
    formik.values.inquiryIntakeProfileId,
    formik.values.counsellorAssignmentProfileId,
    startsWithInquiry
  );

  return (
    <Grid container spacing={1.5}>
      <Grid size={12}>
        <Typography variant="subtitle2">Admission configuration</Typography>
      </Grid>
      {missingPublishedConfiguration && (
        <Grid size={12}>
          <Alert severity="warning">
            Select a published workflow
            {startsWithInquiry ? ', plus an inquiry form' : ''} before activating this Offering. You
            may save it as inactive while configuration is incomplete.
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
          onChange={(id) => {
            formik.setFieldValue('workflowDefinitionId', id);
            formik.setFieldValue('applicationFormDefinitionId', null);
          }}
          noOptionsText="No published workflows found"
          helperText="Application form comes from the workflow’s Form stage."
        />
      </Grid>
      {startsWithInquiry && (
        <Grid size={12}>
          <AdmissionDefinitionSelect
            label="Published inquiry form"
            valueId={formik.values.inquiryFormDefinitionId ?? null}
            initialOption={
              inquiryForm.data?.id === formik.values.inquiryFormDefinitionId
                ? inquiryForm.data
                : initialInquiryForm
            }
            fetchOptions={fetchInquiryForms}
            onChange={(value) => formik.setFieldValue('inquiryFormDefinitionId', value)}
            noOptionsText="No published forms found"
          />
        </Grid>
      )}
      <Grid size={12}>
        <TextField
          select
          fullWidth
          size="small"
          label="Intake & assignment setup (optional)"
          value={selectedSetup?.id ?? (legacySelection ? '__legacy__' : '')}
          onChange={(event) => {
            if (event.target.value === '__legacy__') return;
            if (!event.target.value) {
              formik.setFieldValue('inquiryIntakeProfileId', null);
              formik.setFieldValue('counsellorAssignmentProfileId', null);
              return;
            }
            const setup = (setups.data ?? []).find((item) => item.id === event.target.value);
            if (!setup) return;
            const selection = getIntakeSetupSelection(setup, startsWithInquiry);
            formik.setFieldValue('inquiryIntakeProfileId', selection.inquiryIntakeProfileId);
            formik.setFieldValue(
              'counsellorAssignmentProfileId',
              selection.counsellorAssignmentProfileId
            );
          }}
          error={setups.isError}
          helperText={
            setups.isError
              ? 'Unable to load admission intake setups.'
              : legacySelection
                ? 'Legacy profiles are preserved. Choose a combined setup only when you want to replace them.'
                : startsWithInquiry
                  ? 'Optional. Choose a setup for inquiry handling and automatic counsellor routing. Leave empty for manual assignment.'
                  : 'Optional. Choose a setup for automatic routing, or assign the counsellor during registration.'
          }
        >
          <MenuItem value="">No setup — manual assignment</MenuItem>
          {legacySelection && <MenuItem value="__legacy__">Legacy profile selection</MenuItem>}
          {(setups.data ?? []).map((setup) => (
            <MenuItem key={setup.id} value={setup.id}>
              {setup.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={12}>
        <Typography variant="caption" color="text.secondary">
          Save incomplete preparation as inactive. Activation requires a published cycle, the forms
          linked to its workflow and valid dates. Intake & assignment is optional.
        </Typography>
      </Grid>
    </Grid>
  );
}
