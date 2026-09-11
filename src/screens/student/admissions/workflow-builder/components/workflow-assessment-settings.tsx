import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import { Alert, Paper, Stack, Divider, MenuItem, TextField, Typography } from '@mui/material';
import {
  DEFAULT_ASSESSMENT_POLICY,
  readAdmissionAssessmentPolicy,
  writeAdmissionAssessmentPolicy,
  getAssessmentConfigurationError,
} from 'src/redux/student/admissions/admission-assessment-policy';

import { WorkflowAssessmentOptions } from './workflow-assessment-options';

type Props = {
  formik: FormikProps<AdmissionWorkflowStage>;
  available: boolean;
  readOnly: boolean;
};

export function WorkflowAssessmentSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionAssessmentPolicy(json);
  const enabled = policy?.enabled === true;
  const mode = enabled ? (policy.schedulingEnabled ? 'scheduled' : 'result') : 'legacy';
  const invalid = getAssessmentConfigurationError(json);
  const unreadable = Boolean(invalid && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionAssessmentPolicy>) => {
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionAssessmentPolicy(json, {
        ...(policy ?? DEFAULT_ASSESSMENT_POLICY),
        ...change,
      })
    );
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Assessment setup</Typography>
          <Typography variant="body2" color="text.secondary">
            Choose how staff schedule, record, and review this assessment.
          </Typography>
        </Stack>
        {!available && (
          <Alert severity="info">
            Assessment scheduling and records are not available in this environment yet.
          </Alert>
        )}
        {unreadable && <Alert severity="error">{invalid}</Alert>}
        <TextField
          select
          fullWidth
          size="small"
          label="Assessment process"
          value={mode}
          disabled={disabled}
          onChange={(event) =>
            update({
              enabled: event.target.value !== 'legacy',
              schedulingEnabled: event.target.value === 'scheduled',
            })
          }
        >
          <MenuItem value="legacy">Basic completion (existing process)</MenuItem>
          <MenuItem value="result">Record an assessment result</MenuItem>
          <MenuItem value="scheduled">Schedule an entrance exam</MenuItem>
        </TextField>
        {!enabled ? (
          <Typography variant="body2" color="text.secondary">
            Keeps the existing completion process. Choose another process to use separate assessment
            records.
          </Typography>
        ) : (
          <>
            <Alert severity="info">
              {policy.schedulingEnabled
                ? 'Staff create exam sessions in Assessments, then book applicants into available places.'
                : 'Staff record an applicant’s result directly. No exam session or booking is required.'}
            </Alert>
            <WorkflowAssessmentOptions policy={policy} onChange={update} readOnly={disabled} />
            <Divider />
            <Stack spacing={0.5}>
              <Typography variant="subtitle2">Before this stage can finish</Typography>
              <Typography variant="body2">
                Staff must record an outcome.
                {policy.schedulingEnabled ? ' Book an exam session first.' : ''}
                {policy.attendanceRequired ? ' Record attendance.' : ''}
                {policy.scoringEnabled ? ' Enter marks unless the applicant is absent.' : ''}
                {policy.reviewRequired ? ' Have another staff member approve the result.' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Add outcome routes in Transitions. Failed, absent, and retake outcomes need an
                explicit route to continue. Authorized staff can waive the assessment with a reason.
              </Typography>
            </Stack>
            {invalid && <Alert severity="error">{invalid}</Alert>}
          </>
        )}
      </Stack>
    </Paper>
  );
}
