import type { FormikProps } from 'formik';

import { Box, Grid } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';

import { AdmissionDefinitionSelect } from './admission-definition-select';

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
  const startsWithInquiry = values.entryMode !== 1;
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
    </Grid>
  );
}
