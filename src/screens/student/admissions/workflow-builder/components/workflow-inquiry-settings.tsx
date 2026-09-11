import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionInquiryPolicy } from 'src/redux/student/admissions/admission-inquiry-policy';

import { getInquiryConfigurationError } from 'src/redux/student/admissions/admission-inquiry-validation';
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
  DEFAULT_INQUIRY_POLICY,
  readAdmissionInquiryPolicy,
  writeAdmissionInquiryPolicy,
} from 'src/redux/student/admissions/admission-inquiry-policy';

import { InquirySlaSettings } from './inquiry-sla-settings';
import { InquiryCaptureSettings } from './inquiry-capture-settings';
import { getInquiryStageError } from '../inquiry-stage-prerequisites';
import { InquiryOwnershipSettings } from './inquiry-ownership-settings';
import { InquiryQualificationChecklist } from './inquiry-qualification-checklist';

export function WorkflowInquirySettings({
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
  const policy = readAdmissionInquiryPolicy(json);
  const error = getInquiryConfigurationError(json) || getInquiryStageError(formik.values, stages);
  const unreadable = Boolean(error && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionInquiryPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionInquiryPolicy(json, { ...(policy ?? DEFAULT_INQUIRY_POLICY), ...change })
    );
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Inquiry setup</Typography>
        <Typography variant="body2" color="text.secondary">
          Turn every inquiry into an owned, timely and measurable admissions opportunity.
        </Typography>
        {!available && (
          <Alert severity="info">Managed inquiry is not available in this environment yet.</Alert>
        )}
        {unreadable && <Alert severity="error">{error}</Alert>}
        <RadioGroup
          aria-label="Inquiry process"
          value={policy?.enabled ? 'managed' : 'basic'}
          onChange={(_, value) => {
            const managed = value === 'managed';
            update({ enabled: managed });
            if (managed) {
              formik.setFieldValue('isEntryStage', true);
              formik.setFieldValue('allowManualSkip', false);
              formik.setFieldValue('isRequired', true);
            }
          }}
        >
          <FormControlLabel
            value="basic"
            disabled={disabled}
            control={<Radio size="small" />}
            label="Basic inquiry capture (existing process)"
          />
          <FormControlLabel
            value="managed"
            disabled={disabled}
            control={<Radio size="small" />}
            label="Managed inquiry, follow-up and qualification"
          />
        </RadioGroup>
        {policy?.enabled && (
          <>
            <InquiryCaptureSettings policy={policy} disabled={disabled} onChange={update} />
            <InquiryOwnershipSettings
              policy={policy}
              disabled={disabled}
              available={available}
              onChange={update}
            />
            <InquirySlaSettings policy={policy} disabled={disabled} onChange={update} />
            <InquiryQualificationChecklist
              value={policy.qualificationChecklist}
              disabled={disabled}
              onChange={(qualificationChecklist) => update({ qualificationChecklist })}
            />
            <Alert severity="info">
              Staff record contact notes, schedule follow-ups and save a qualification outcome
              before the application can progress.
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
          </>
        )}
      </Stack>
    </Paper>
  );
}
