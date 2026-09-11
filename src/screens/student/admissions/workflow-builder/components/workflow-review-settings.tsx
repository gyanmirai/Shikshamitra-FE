import type { FormikProps } from 'formik';
import type { AdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { getReviewConfigurationError } from 'src/redux/student/admissions/admission-review-validation';
import {
  Alert,
  Paper,
  Radio,
  Stack,
  RadioGroup,
  Typography,
  FormControlLabel,
} from '@mui/material';
import {
  DEFAULT_REVIEW_POLICY,
  readAdmissionReviewPolicy,
  writeAdmissionReviewPolicy,
} from 'src/redux/student/admissions/admission-review-policy';

import { ReviewPrerequisites } from './review-prerequisites';
import { ReviewTimingSettings } from './review-timing-settings';
import { getReviewStageError } from '../review-stage-prerequisites';
import { ReviewChecklistSettings } from './review-checklist-settings';
import { ReviewResponsibilitySettings } from './review-responsibility-settings';

export function WorkflowReviewSettings({
  formik,
  stages,
  readOnly,
  available,
}: {
  formik: FormikProps<AdmissionWorkflowStage>;
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
  available: boolean;
}) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionReviewPolicy(json);
  const error = getReviewConfigurationError(json) || getReviewStageError(formik.values, stages);
  const unreadable = Boolean(error && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionReviewPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionReviewPolicy(json, { ...(policy ?? DEFAULT_REVIEW_POLICY), ...change })
    );
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Review setup</Typography>
        <Typography variant="body2" color="text.secondary">
          Bring evidence and staff recommendations together before the admission decision.
        </Typography>
        {!available && (
          <Alert severity="info">Managed review is not available in this environment yet.</Alert>
        )}
        {unreadable && <Alert severity="error">{error}</Alert>}
        <RadioGroup
          aria-label="Review process"
          value={policy?.enabled ? 'managed' : 'basic'}
          onChange={(_, value) => update({ enabled: value === 'managed' })}
        >
          <FormControlLabel
            value="basic"
            disabled={disabled}
            control={<Radio size="small" />}
            label="Basic completion (existing process)"
          />
          <FormControlLabel
            value="managed"
            disabled={disabled}
            control={<Radio size="small" />}
            label="Collect a staff review and recommendation"
          />
        </RadioGroup>
        {policy?.enabled && (
          <>
            <ReviewResponsibilitySettings
              policy={policy}
              disabled={disabled}
              available={available}
              onChange={update}
            />
            <ReviewPrerequisites
              value={policy.prerequisites}
              stages={stages}
              stageOrder={formik.values.displayOrder}
              disabled={disabled}
              onChange={(prerequisites) => update({ prerequisites })}
            />
            <ReviewChecklistSettings
              value={policy.checklist}
              disabled={disabled}
              onChange={(checklist) => update({ checklist })}
            />
            <ReviewTimingSettings
              value={policy.dueInDays}
              disabled={disabled}
              onChange={(dueInDays) => update({ dueInDays })}
            />
            <Alert severity="info">
              Staff save a draft, then submit a recommendation with a reason. An authorized approver
              makes the decision. Changed evidence requires another review.
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
          </>
        )}
      </Stack>
    </Paper>
  );
}
