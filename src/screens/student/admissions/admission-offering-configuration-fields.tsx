import type { FormikProps } from 'formik';

import ShakingTextField from 'src/components/shaking-text-field';
import { Grid, Alert, MenuItem, TextField, Typography } from '@mui/material';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';
import { useGetAdmissionIntakeSetupsQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionDefinitionSelect } from './admission-definition-select';
import { AdmissionOfferingRoutingFields } from './admission-offering-routing-fields';
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
  compact?: boolean;
  showCode?: boolean;
  twoColumnLayout?: boolean;
  hideConfigurationWarning?: boolean;
  onDismissConfigurationWarning?: () => void;
  routingLocked?: boolean;
};

export function AdmissionOfferingConfigurationFields({
  formik,
  fetchWorkflows,
  fetchInquiryForms,
  initialWorkflow,
  initialInquiryForm,
  compact = false,
  showCode = true,
  twoColumnLayout = false,
  hideConfigurationWarning = false,
  onDismissConfigurationWarning,
  routingLocked = false,
}: Props) {
  const missingPublishedConfiguration = isAdmissionOfferingConfigurationIncomplete(formik.values);
  const startsWithInquiry = formik.values.entryMode !== 1;
  const configurationFieldSize = twoColumnLayout ? { xs: 12, sm: 6 } : 12;
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
    <Grid container spacing={compact ? 1 : 1.5}>
      {!compact && (
        <Grid size={12}>
          <Typography variant="subtitle2">Admission configuration</Typography>
        </Grid>
      )}
      {missingPublishedConfiguration && !hideConfigurationWarning && (
        <Grid size={12}>
          <Alert severity="warning" onClose={onDismissConfigurationWarning}>
            Select a published workflow
            {startsWithInquiry ? ', plus an inquiry form' : ''} before activating this Offering. You
            may save it as inactive while configuration is incomplete.
          </Alert>
        </Grid>
      )}
      <Grid size={12}>
        <AdmissionOfferingRoutingFields
          values={formik.values}
          locked={routingLocked}
          onChange={({ track, entryMode }) => {
            formik.setValues({
              ...formik.values,
              track,
              entryMode,
              workflowDefinitionId: null,
              applicationFormDefinitionId: null,
              inquiryFormDefinitionId: null,
              inquiryIntakeProfileId: null,
            });
          }}
          onBlur={(field) => formik.setFieldTouched(field, true)}
          feedback={{
            track: {
              error: Boolean(formik.touched.track && formik.errors.track),
              helperText: formik.touched.track ? formik.errors.track : undefined,
            },
            entryMode: {
              error: Boolean(formik.touched.entryMode && formik.errors.entryMode),
              helperText: formik.touched.entryMode ? formik.errors.entryMode : undefined,
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, sm: twoColumnLayout ? 6 : showCode ? 7 : 12 }}>
        <ShakingTextField error={Boolean(formik.touched.name && formik.errors.name)}>
          <TextField
            fullWidth
            size="small"
            label="Offering name *"
            {...formik.getFieldProps('name')}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={
              formik.touched.name
                ? formik.errors.name
                : compact
                  ? undefined
                  : 'A clear name shown to staff and families, such as Grade 1 General Admission.'
            }
          />
        </ShakingTextField>
      </Grid>
      {showCode && (
        <Grid size={{ xs: 12, sm: twoColumnLayout ? 6 : 5 }}>
          <ShakingTextField error={Boolean(formik.touched.code && formik.errors.code)}>
            <TextField
              fullWidth
              size="small"
              label="Offering code *"
              {...formik.getFieldProps('code')}
              error={formik.touched.code && Boolean(formik.errors.code)}
              helperText={
                formik.touched.code
                  ? formik.errors.code
                  : compact
                    ? undefined
                    : 'A stable operational code used to identify this intake.'
              }
            />
          </ShakingTextField>
        </Grid>
      )}
      <Grid size={configurationFieldSize}>
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
          helperText={
            compact ? undefined : 'Application form comes from the workflow’s Form stage.'
          }
        />
      </Grid>
      {startsWithInquiry && (
        <Grid size={configurationFieldSize}>
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
      <Grid size={configurationFieldSize}>
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
                : compact
                  ? undefined
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
      {!compact && (
        <Grid size={12}>
          <Typography variant="caption" color="text.secondary">
            Save incomplete preparation as inactive. Activation requires a published cycle, the
            forms linked to its workflow and valid dates. Intake & assignment is optional.
          </Typography>
        </Grid>
      )}
    </Grid>
  );
}
