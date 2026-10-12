import type { FormikProps } from 'formik';

import { Box, Grid, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { useGetAdmissionIntakeSetupsQuery } from 'src/redux/student/admissions/admission-intake-profiles-api';

import { AdmissionDefinitionSelect } from './admission-definition-select';
import {
  getIntakeSetupSelection,
  findSelectedIntakeSetup,
  hasLegacyIntakeSelection,
} from './admission-intake-setup-selection';

import type { BulkOfferingValues } from './bulk-admission-offering-model';
import type { BulkOfferingFieldIssues } from './bulk-admission-offering-validation';
import type { AdmissionDefinitionFetcher } from './use-admission-definition-options';

type Props = {
  formik: FormikProps<BulkOfferingValues>;
  fetchWorkflows: AdmissionDefinitionFetcher;
  fetchInquiryForms: AdmissionDefinitionFetcher;
  change: (updates: Partial<BulkOfferingValues>) => void;
  fieldIssues?: BulkOfferingFieldIssues;
};

export function BulkAdmissionConfigurationFields({
  formik,
  fetchWorkflows,
  fetchInquiryForms,
  change,
  fieldIssues = {},
}: Props) {
  const { values, errors, touched } = formik;
  const setups = useGetAdmissionIntakeSetupsQuery();
  const startsWithInquiry = values.entryMode !== 1;
  const selectedSetup = findSelectedIntakeSetup(
    setups.data ?? [],
    values.inquiryIntakeProfileId || null,
    values.counsellorAssignmentProfileId || null,
    startsWithInquiry
  );
  const legacySelection = hasLegacyIntakeSelection(
    selectedSetup,
    values.inquiryIntakeProfileId,
    values.counsellorAssignmentProfileId,
    startsWithInquiry
  );
  const feedback = (field: keyof BulkOfferingValues) => {
    const localError = touched[field] && errors[field];
    const issue = fieldIssues[field];
    return {
      error: Boolean(localError || issue?.blocking),
      helperText: localError
        ? String(localError)
        : issue
          ? `${issue.blocking ? '' : 'Before activation: '}${issue.message}`
          : undefined,
    };
  };
  const intakeFeedback = feedback('inquiryIntakeProfileId');
  const workflowFeedback = feedback('workflowDefinitionId');
  const inquiryFeedback = feedback('inquiryFormDefinitionId');
  return (
    <Grid container spacing={1}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <ShakingTextField error={workflowFeedback.error}>
          <AdmissionDefinitionSelect
            label="Published workflow"
            name="workflowDefinitionId"
            required={values.isActive}
            valueId={values.workflowDefinitionId || null}
            fetchOptions={fetchWorkflows}
            onChange={(id) => change({ workflowDefinitionId: id ?? '' })}
            onBlur={() => formik.setFieldTouched('workflowDefinitionId', true)}
            error={workflowFeedback.error}
            helperText={
              workflowFeedback.helperText && (
                <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
                  {workflowFeedback.helperText}
                </Box>
              )
            }
            noOptionsText="No published workflows found"
          />
        </ShakingTextField>
      </Grid>
      {startsWithInquiry && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <ShakingTextField error={inquiryFeedback.error}>
            <AdmissionDefinitionSelect
              label="Inquiry form"
              name="inquiryFormDefinitionId"
              required={values.isActive}
              valueId={values.inquiryFormDefinitionId || null}
              fetchOptions={fetchInquiryForms}
              onChange={(id) => change({ inquiryFormDefinitionId: id ?? '' })}
              onBlur={() => formik.setFieldTouched('inquiryFormDefinitionId', true)}
              error={inquiryFeedback.error}
              helperText={
                inquiryFeedback.helperText && (
                  <Box component="span" sx={{ whiteSpace: 'pre-line' }}>
                    {inquiryFeedback.helperText}
                  </Box>
                )
              }
              noOptionsText="No published forms found"
            />
          </ShakingTextField>
        </Grid>
      )}
      <Grid size={12}>
        <ShakingTextField error={Boolean(intakeFeedback.error || setups.isError)}>
          <CustomSelect
            label="Intake & assignment setup (optional)"
            name="inquiryIntakeProfileId"
            labelId="bulk-intake-setup-label"
            SelectDisplayProps={{ 'aria-labelledby': 'bulk-intake-setup-label' }}
            size="small"
            isLoading={setups.isFetching}
            value={selectedSetup?.id ?? (legacySelection ? '__legacy__' : '__manual__')}
            options={[
              { value: '__manual__', label: 'No setup — manual assignment' },
              ...(legacySelection
                ? [{ value: '__legacy__', label: 'Legacy profile selection' }]
                : []),
              ...(setups.data ?? []).map((setup) => ({ value: setup.id, label: setup.name })),
            ]}
            onChange={(id) => {
              if (id === '__legacy__') return;
              const setup = (setups.data ?? []).find((item) => item.id === id);
              if (id === '__manual__') {
                change({ inquiryIntakeProfileId: '', counsellorAssignmentProfileId: '' });
                return;
              }
              if (!setup) return;
              const selection = getIntakeSetupSelection(setup, startsWithInquiry);
              change({
                inquiryIntakeProfileId: selection.inquiryIntakeProfileId ?? '',
                counsellorAssignmentProfileId: selection.counsellorAssignmentProfileId ?? '',
              });
            }}
            onBlur={() => {
              formik.setFieldTouched('inquiryIntakeProfileId', true);
              formik.setFieldTouched('counsellorAssignmentProfileId', true);
            }}
            error={
              intakeFeedback.error ||
              (touched.counsellorAssignmentProfileId &&
                Boolean(errors.counsellorAssignmentProfileId)) ||
              setups.isError
            }
            helperText={
              setups.isError
                ? 'Unable to load admission intake setups.'
                : intakeFeedback.helperText
                  ? intakeFeedback.helperText
                  : legacySelection
                    ? 'Legacy profiles are preserved until you choose a combined setup.'
                    : touched.inquiryIntakeProfileId || touched.counsellorAssignmentProfileId
                      ? errors.inquiryIntakeProfileId || errors.counsellorAssignmentProfileId
                      : ''
            }
            helperTextProps={{ sx: { whiteSpace: 'pre-line' } }}
          />
        </ShakingTextField>
        {setups.isError && (
          <Button size="small" onClick={() => setups.refetch()}>
            Retry intake setups
          </Button>
        )}
      </Grid>
    </Grid>
  );
}
