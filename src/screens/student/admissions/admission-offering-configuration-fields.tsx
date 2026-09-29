import type { FormikProps } from 'formik';
import type {
  AdmissionTrack,
  AdmissionEntryMode,
} from 'src/redux/student/admissions/admission-offerings-api';

import { useRef, useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { Grid, Alert, MenuItem, TextField, Typography } from '@mui/material';
import { useGetAdmissionFormQuery } from 'src/redux/student/admissions/admission-forms-api';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import { useLazyGetAdmissionWorkflowQuery } from 'src/redux/student/admissions/admission-workflows-api';
import { useGetAdmissionIntakeProfilesQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionDefinitionSelect } from './admission-definition-select';
import {
  type AdmissionOfferingFormValues,
  isAdmissionOfferingConfigurationIncomplete,
} from './admission-offering-model';

import type {
  AdmissionDefinitionOption,
  AdmissionDefinitionFetcher,
} from './use-admission-definition-options';

type Props = {
  formik: FormikProps<AdmissionOfferingFormValues>;
  fetchWorkflows: AdmissionDefinitionFetcher;
  fetchInquiryForms: AdmissionDefinitionFetcher;
  fetchRegistrationForms: AdmissionDefinitionFetcher;
  initialWorkflow?: AdmissionDefinitionOption | null;
  initialInquiryForm?: AdmissionDefinitionOption | null;
  initialApplicationForm?: AdmissionDefinitionOption | null;
};

export function AdmissionOfferingConfigurationFields({
  formik,
  fetchWorkflows,
  fetchInquiryForms,
  fetchRegistrationForms,
  initialWorkflow,
  initialInquiryForm,
  initialApplicationForm,
}: Props) {
  const missingPublishedConfiguration = isAdmissionOfferingConfigurationIncomplete(formik.values);
  const startsWithInquiry = formik.values.entryMode !== 1;
  const [loadWorkflow] = useLazyGetAdmissionWorkflowQuery();
  const [loadingWorkflowForms, setLoadingWorkflowForms] = useState(false);
  const [workflowFormsError, setWorkflowFormsError] = useState(false);
  const workflowSelection = useRef(0);
  const entryModeRef = useRef(formik.values.entryMode);
  entryModeRef.current = formik.values.entryMode;
  const inquiryForm = useGetAdmissionFormQuery(formik.values.inquiryFormDefinitionId ?? '', {
    skip: !formik.values.inquiryFormDefinitionId,
  });
  const registrationForm = useGetAdmissionFormQuery(
    formik.values.applicationFormDefinitionId ?? '',
    {
      skip: !formik.values.applicationFormDefinitionId,
    }
  );
  const selectWorkflow = async (id: string | null) => {
    workflowSelection.current += 1;
    const selection = workflowSelection.current;
    setWorkflowFormsError(false);
    formik.setFieldValue('workflowDefinitionId', id);
    formik.setFieldValue('inquiryFormDefinitionId', null);
    formik.setFieldValue('applicationFormDefinitionId', null);
    if (!id) {
      setLoadingWorkflowForms(false);
      return;
    }

    setLoadingWorkflowForms(true);
    try {
      const workflow = await loadWorkflow(id, true).unwrap();
      if (selection !== workflowSelection.current) return;
      const formStage = workflow.stages.find((stage) => stage.stageType === 1);
      const registrationId = readStageConfiguration(formStage?.configurationJson)?.formDefinitionId;
      formik.setFieldValue(
        'applicationFormDefinitionId',
        typeof registrationId === 'string' ? registrationId : null
      );
      if (entryModeRef.current !== 1) {
        formik.setFieldValue(
          'inquiryFormDefinitionId',
          workflow.defaultInquiryFormDefinitionId ?? null
        );
      }
    } catch {
      if (selection === workflowSelection.current) setWorkflowFormsError(true);
    } finally {
      if (selection === workflowSelection.current) setLoadingWorkflowForms(false);
    }
  };
  const profiles = useGetAdmissionIntakeProfilesQuery();
  const inquiryProfiles = profiles.data?.filter((profile) => profile.kind === 0) ?? [];
  const assignmentProfiles = profiles.data?.filter((profile) => profile.kind === 1) ?? [];

  return (
    <Grid container spacing={1.5}>
      <Grid size={12}>
        <Typography variant="subtitle2">Admission configuration</Typography>
      </Grid>
      {missingPublishedConfiguration && (
        <Grid size={12}>
          <Alert severity="warning">
            Select a published workflow and application form, plus a counsellor assignment profile
            {startsWithInquiry ? ', an inquiry form, and an inquiry profile' : ''} before activating
            this offering. You may save it as inactive while configuration is incomplete.
          </Alert>
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          label="Admission track *"
          options={[
            { value: 0, label: 'General' },
            { value: 1, label: 'RTE' },
            { value: 2, label: 'Management' },
            { value: 3, label: 'Staff' },
          ]}
          value={formik.values.track}
          onChange={(value) => {
            const track = Number(value) as AdmissionTrack;
            formik.setFieldValue('track', track);
            if (track === 1) {
              formik.setFieldValue('entryMode', 1);
              formik.setFieldValue('inquiryFormDefinitionId', null);
            }
          }}
          helperText="Separate offerings for the same class can use different tracks."
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <CustomSelect
          label="Entry mode *"
          options={
            formik.values.track === 1
              ? [{ value: 1, label: 'Start with registration' }]
              : [
                  { value: 0, label: 'Start with inquiry' },
                  { value: 1, label: 'Start with registration' },
                  { value: 2, label: 'Inquiry or direct registration' },
                ]
          }
          value={formik.values.entryMode}
          onChange={(value) => {
            const entryMode = Number(value) as AdmissionEntryMode;
            formik.setFieldValue('entryMode', entryMode);
            if (entryMode === 1) {
              formik.setFieldValue('inquiryFormDefinitionId', null);
              formik.setFieldValue('inquiryIntakeProfileId', null);
            }
          }}
          helperText={
            formik.values.track === 1
              ? 'RTE starts with registration and requires a workflow without Inquiry or Assessment.'
              : 'The selected workflow still determines later admission stages.'
          }
        />
      </Grid>
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
          onChange={selectWorkflow}
          noOptionsText="No published workflows found"
          helperText="Selecting a workflow fills its linked forms. You can change them for this offering."
        />
      </Grid>
      {workflowFormsError && (
        <Grid size={12}>
          <Alert severity="error">
            Unable to load the selected workflow’s forms. Choose it again.
          </Alert>
        </Grid>
      )}
      {startsWithInquiry && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <AdmissionDefinitionSelect
            label="Published inquiry form"
            valueId={formik.values.inquiryFormDefinitionId ?? null}
            initialOption={
              inquiryForm.data?.id === formik.values.inquiryFormDefinitionId
                ? inquiryForm.data
                : initialInquiryForm
            }
            fetchOptions={fetchInquiryForms}
            disabled={loadingWorkflowForms}
            onChange={(value) => formik.setFieldValue('inquiryFormDefinitionId', value)}
            noOptionsText="No published forms found"
          />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: startsWithInquiry ? 6 : 12 }}>
        <AdmissionDefinitionSelect
          label="Published application form"
          valueId={formik.values.applicationFormDefinitionId ?? null}
          initialOption={
            registrationForm.data?.id === formik.values.applicationFormDefinitionId
              ? registrationForm.data
              : initialApplicationForm
          }
          fetchOptions={fetchRegistrationForms}
          disabled={loadingWorkflowForms}
          onChange={(value) => formik.setFieldValue('applicationFormDefinitionId', value)}
          noOptionsText="No published forms found"
        />
      </Grid>
      {startsWithInquiry && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            fullWidth
            size="small"
            label="Inquiry setup"
            value={formik.values.inquiryIntakeProfileId ?? ''}
            onChange={(event) =>
              formik.setFieldValue('inquiryIntakeProfileId', event.target.value || null)
            }
            helperText="Controls sources, duplicates, follow-ups, and when an application may start."
          >
            <MenuItem value="">Choose inquiry setup</MenuItem>
            {inquiryProfiles.map((profile) => (
              <MenuItem key={profile.id} value={profile.id}>
                {profile.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Counsellor assignment"
          value={formik.values.counsellorAssignmentProfileId ?? ''}
          onChange={(event) =>
            formik.setFieldValue('counsellorAssignmentProfileId', event.target.value || null)
          }
          helperText="Assigns the owner for inquiries and direct registrations."
        >
          <MenuItem value="">Choose assignment setup</MenuItem>
          {assignmentProfiles.map((profile) => (
            <MenuItem key={profile.id} value={profile.id}>
              {profile.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={12}>
        <Typography variant="caption" color="text.secondary">
          Save incomplete preparation as inactive. Activation requires a published cycle, the forms
          needed by this entry mode, a workflow, the intake profiles, and valid dates.
        </Typography>
      </Grid>
    </Grid>
  );
}
