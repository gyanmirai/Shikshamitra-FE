import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';

import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import { Alert, Paper, Radio, Stack, RadioGroup, Typography, FormControlLabel } from '@mui/material';
import { DEFAULT_PAYMENT_POLICY, readAdmissionPaymentPolicy, writeAdmissionPaymentPolicy, getAdmissionPaymentConfigurationError } from 'src/redux/student/admissions/admission-payment-policy';

import { PaymentPurposeSettings } from './payment-purpose-settings';
import { PaymentCollectionSettings } from './payment-collection-settings';

type Props = { formik: FormikProps<AdmissionWorkflowStage>; available: boolean; readOnly: boolean };

export function WorkflowPaymentSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionPaymentPolicy(json);
  const error = getAdmissionPaymentConfigurationError(json);
  const unreadable = Boolean(readStageConfiguration(json)?.payment !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionPaymentPolicy>) => formik.setFieldValue('configurationJson',
    writeAdmissionPaymentPolicy(json, { ...(policy ?? DEFAULT_PAYMENT_POLICY), ...change }));
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Payment process</Typography>
        <Typography variant="body2" color="text.secondary">Set the fee, accepted methods, deadline, installments, verification, and exception controls.</Typography>
        {!available && <Alert severity="info">Managed Payment settings are not available in this environment yet.</Alert>}
        <RadioGroup value={policy?.enabled ? 'managed' : 'basic'} onChange={(_, value) => update({ enabled: value === 'managed' })}>
          <FormControlLabel value="basic" disabled={disabled} control={<Radio size="small" />} label="Basic manual stage (existing process)" />
          <FormControlLabel value="managed" disabled={disabled} control={<Radio size="small" />} label="Managed collection with financial controls" />
        </RadioGroup>
        {policy?.enabled && <><PaymentPurposeSettings policy={policy} disabled={disabled} onChange={update} />
          <PaymentCollectionSettings policy={policy} disabled={disabled} onChange={update} />
          <Alert severity="success">The application cannot leave this stage until the amount is settled, independently verified when required, or explicitly waived.</Alert></>}
        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </Paper>
  );
}
