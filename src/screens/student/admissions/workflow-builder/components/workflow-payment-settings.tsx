import type { FormikProps } from 'formik';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionPaymentPolicy } from 'src/redux/student/admissions/admission-payment-policy';

import { Alert, Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  DEFAULT_PAYMENT_POLICY,
  readAdmissionPaymentPolicy,
  writeAdmissionPaymentPolicy,
  getAdmissionPaymentConfigurationError,
} from 'src/redux/student/admissions/admission-payment-policy';

import { WorkflowProcessChoice } from './workflow-process-choice';
import { PaymentPurposeSettings } from './payment-purpose-settings';
import { PaymentCollectionSettings } from './payment-collection-settings';

type Props = { formik: FormikProps<AdmissionWorkflowStage>; available: boolean; readOnly: boolean };

export function WorkflowPaymentSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionPaymentPolicy(json);
  const error = getAdmissionPaymentConfigurationError(json);
  const unreadable = Boolean(readStageConfiguration(json)?.payment !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionPaymentPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionPaymentPolicy(json, { ...(policy ?? DEFAULT_PAYMENT_POLICY), ...change })
    );
  return (
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:cash-check"
        title="Payment process"
        descriptionTooltip="The application cannot leave a collection stage until the amount is settled, independently verified when required, or explicitly waived by authorized staff."
      >
        <Stack spacing={2}>
          {!available && (
            <Alert severity="info">
              Managed Payment settings are not available in this environment yet.
            </Alert>
          )}
          <WorkflowProcessChoice
            label="Payment process"
            value={policy?.enabled ? 'managed' : 'basic'}
            disabled={disabled}
            onChange={(value) => update({ enabled: value === 'managed' })}
            options={[
              {
                value: 'basic',
                title: 'Complete manually',
                description: 'Keep the existing manual Payment stage completion controls.',
                icon: 'mdi:check-circle-outline',
              },
              {
                value: 'managed',
                title: 'Collect and verify payment',
                description:
                  'Collect the required amount using the configured methods, verification and authorized waiver rules.',
                icon: 'mdi:cash-check',
              },
            ]}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </FormSectionCard>
      {policy?.enabled && (
        <>
          <PaymentPurposeSettings policy={policy} disabled={disabled} onChange={update} />
          <PaymentCollectionSettings policy={policy} disabled={disabled} onChange={update} />
        </>
      )}
    </Stack>
  );
}
