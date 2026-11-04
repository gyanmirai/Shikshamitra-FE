import type { FormikProps } from 'formik';
import type { AdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Stack } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
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
        title="Admission Capacity"
        descriptionTooltip="Historical Seat-Stage Settings Preserve Capacity, Reservation and Waitlist Rules. Capacity Changes and Applicant Actions Are Audited. Confirmed Admissions Consume Capacity Until Released."
      >
        <Stack spacing={2}>
          {!available && (
            <StudentFeedback notificationKey="STU-0576" presentation="inline" severity="info">
              Managed Seat settings are not available in this environment yet.
            </StudentFeedback>
          )}
          <WorkflowProcessChoice
            label="Seat Process"
            value={policy?.enabled ? 'managed' : 'basic'}
            disabled={disabled}
            onChange={(value) => update({ enabled: value === 'managed' })}
            options={[
              {
                value: 'basic',
                title: 'Basic Seat Step (Existing Process)',
                description: 'Keep the saved Seat-stage completion process.',
                icon: 'mdi:seat-outline',
              },
              {
                value: 'managed',
                title: 'Managed Capacity, Reservation, and Waitlist',
                description:
                  'Preserve capacity, reservation and waitlist rules for this historical Seat stage.',
                icon: 'mdi:account-group-outline',
              },
            ]}
          />
          {error && (
            <StudentFeedback notificationKey="STU-0577" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
        </Stack>
      </FormSectionCard>
      {policy?.enabled && (
        <>
          <FormSectionCard icon="mdi:account-group-outline" title="Reservation Rules">
            <SeatCapacitySettings policy={policy} disabled={disabled} onChange={update} />
          </FormSectionCard>
          <FormSectionCard icon="mdi:sign-direction" title="Completion Outcomes">
            <SeatOutcomeSettings policy={policy} disabled={disabled} onChange={update} />
          </FormSectionCard>
        </>
      )}
    </Stack>
  );
}
