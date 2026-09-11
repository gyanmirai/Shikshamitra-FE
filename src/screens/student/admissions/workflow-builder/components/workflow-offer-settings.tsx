import type { FormikProps } from 'formik';
import type { AdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import { Alert, Paper, Radio, Stack, Divider, RadioGroup, Typography, FormControlLabel } from '@mui/material';
import { DEFAULT_OFFER_POLICY, readAdmissionOfferPolicy, writeAdmissionOfferPolicy, getAdmissionOfferConfigurationError } from 'src/redux/student/admissions/admission-offer-policy';

import { OfferContentSettings } from './offer-content-settings';
import { OfferResponseSettings } from './offer-response-settings';

type Props = { formik: FormikProps<AdmissionWorkflowStage>; available: boolean; readOnly: boolean };

export function WorkflowOfferSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionOfferPolicy(json);
  const error = getAdmissionOfferConfigurationError(json);
  const unreadable = Boolean(readStageConfiguration(json)?.offer !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionOfferPolicy>) => formik.setFieldValue('configurationJson',
    writeAdmissionOfferPolicy(json, { ...(policy ?? DEFAULT_OFFER_POLICY), ...change }));
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1">Admission offer</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure the offer content, validity, response evidence, exceptions, and completion outcomes.
          </Typography>
        </Stack>
        {!available && <Alert severity="info">Managed Offer settings are not available in this environment yet.</Alert>}
        <RadioGroup value={policy?.enabled ? 'managed' : 'basic'} onChange={(_, value) => update({ enabled: value === 'managed' })}>
          <FormControlLabel value="basic" disabled={disabled} control={<Radio size="small" />} label="Basic offer actions (existing process)" />
          <FormControlLabel value="managed" disabled={disabled} control={<Radio size="small" />} label="Managed offer with expiry and response controls" />
        </RadioGroup>
        {policy?.enabled && <>
          <OfferContentSettings policy={policy} disabled={disabled} onChange={update} />
          <Divider />
          <OfferResponseSettings policy={policy} disabled={disabled} onChange={update} />
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
            <Typography variant="overline" color="text.secondary">Offer preview</Typography>
            <Typography variant="subtitle1">{policy.title || 'Untitled offer'}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', mt: 0.5 }}>{policy.message || 'Add the offer message.'}</Typography>
            <Typography variant="caption" color="text.secondary">
              {policy.offerType === 'conditional' ? 'Conditional' : 'Unconditional'} · valid for {policy.validityDays} days
            </Typography>
          </Paper>
          <Alert severity="success">Every offer action is recorded. The workflow can continue only for the outcomes selected above.</Alert>
        </>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
}
