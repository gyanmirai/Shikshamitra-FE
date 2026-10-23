import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import CustomSelect from 'src/components/custom-select';
import { Stack, Switch, FormControlLabel } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import {
  readPaymentCompletionPolicy,
  writePaymentCompletionPolicy,
} from 'src/redux/student/admissions/admission-payment-completion-policy';

import { WorkflowSettingLabel } from './workflow-setting-label';

export function WorkflowPaymentSettings({
  available,
  formik,
  readOnly,
}: {
  available: boolean;
  formik: FormikProps<AdmissionWorkflowStage>;
  readOnly: boolean;
}) {
  const policy = readPaymentCompletionPolicy(formik.values.configurationJson);
  const disabled = readOnly || !available || !policy;
  const update = (change: Partial<NonNullable<typeof policy>>) => {
    if (policy)
      formik.setFieldValue(
        'configurationJson',
        writePaymentCompletionPolicy(formik.values.configurationJson, { ...policy, ...change })
      );
  };
  return (
    <FormSectionCard
      icon="mdi:cash-check"
      title="Payment Completion"
      descriptionTooltip="Finance supplies the class fee structure, balances and payment evidence. Full payment covers the entire selected structure, including future installments. If Finance verifies no amount is due, no payment entry is required."
    >
      <Stack spacing={2}>
        {!policy && (
          <StudentFeedback notificationKey="STU-0161" presentation="persistent" severity="error">
            These Payment completion settings are unsupported. Reload the workflow.
          </StudentFeedback>
        )}
        <CustomSelect
          fullWidth
          size="small"
          required
          label="Payment rule"
          value={policy?.paymentRule ?? ''}
          disabled={disabled}
          options={[
            { value: 'partial', label: 'Partial payment is sufficient' },
            { value: 'full', label: 'Full payment required' },
          ]}
          onChange={(value) => update({ paymentRule: value as 'partial' | 'full' })}
        />
        <FormControlLabel
          label={
            <WorkflowSettingLabel
              label="Allow collection later in Onboarding"
              help="Allow authorized staff to continue without meeting the payment rule by entering a mandatory reason. Remaining fees stay with Finance and Onboarding."
            />
          }
          control={
            <Switch
              size="small"
              checked={policy?.allowCollectionLater ?? false}
              disabled={disabled}
              slotProps={{ input: { 'aria-label': 'Allow collection later in Onboarding' } }}
              onChange={(_, value) => update({ allowCollectionLater: value })}
            />
          }
          sx={{
            m: 0,
            width: 1,
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
            gap: 1,
          }}
        />
      </Stack>
      {!available && (
        <StudentFeedback notificationKey="STU-0569" presentation="persistent" severity="warning">
          Fee structure confirmation is not available in this environment.
        </StudentFeedback>
      )}
    </FormSectionCard>
  );
}
