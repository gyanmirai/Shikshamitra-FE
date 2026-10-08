import type { FormikProps } from 'formik';
import type { AdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Alert, Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';
import {
  DEFAULT_SEAT_POLICY,
  readAdmissionSeatPolicy,
  writeAdmissionSeatPolicy,
  getAdmissionSeatConfigurationError,
} from 'src/redux/student/admissions/admission-seat-policy';

import { SeatOutcomeSettings } from './seat-outcome-settings';
import { SeatCapacitySettings } from './seat-capacity-settings';
import { WorkflowProcessChoice } from './workflow-process-choice';

type Props = { formik: FormikProps<AdmissionWorkflowStage>; available: boolean; readOnly: boolean };

export function WorkflowSeatSettings({ formik, available, readOnly }: Props) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionSeatPolicy(json);
  const error = getAdmissionSeatConfigurationError(json);
  const unreadable = Boolean(readStageConfiguration(json)?.seat !== undefined && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionSeatPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionSeatPolicy(json, { ...(policy ?? DEFAULT_SEAT_POLICY), ...change })
    );
  return (
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:seat-outline"
        title="Admission capacity"
        descriptionTooltip="Historical Seat-stage settings preserve capacity, reservation and waitlist rules. Capacity changes and applicant actions are audited. Confirmed admissions consume capacity until released."
      >
        <Stack spacing={2}>
          {!available && (
            <Alert severity="info">
              Managed Seat settings are not available in this environment yet.
            </Alert>
          )}
          <WorkflowProcessChoice
            label="Seat process"
            value={policy?.enabled ? 'managed' : 'basic'}
            disabled={disabled}
            onChange={(value) => update({ enabled: value === 'managed' })}
            options={[
              {
                value: 'basic',
                title: 'Basic seat step (existing process)',
                description: 'Keep the saved Seat-stage completion process.',
                icon: 'mdi:seat-outline',
              },
              {
                value: 'managed',
                title: 'Managed capacity, reservation, and waitlist',
                description:
                  'Preserve capacity, reservation and waitlist rules for this historical Seat stage.',
                icon: 'mdi:account-group-outline',
              },
            ]}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </FormSectionCard>
      {policy?.enabled && (
        <>
          <FormSectionCard icon="mdi:account-group-outline" title="Reservation rules">
            <SeatCapacitySettings policy={policy} disabled={disabled} onChange={update} />
          </FormSectionCard>
          <FormSectionCard icon="mdi:sign-direction" title="Completion outcomes">
            <SeatOutcomeSettings policy={policy} disabled={disabled} onChange={update} />
          </FormSectionCard>
        </>
      )}
    </Stack>
  );
}
