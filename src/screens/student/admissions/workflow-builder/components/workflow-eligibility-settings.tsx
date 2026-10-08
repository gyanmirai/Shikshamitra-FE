import type { FormikProps } from 'formik';
import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';
import type { AdmissionEligibilityPolicy } from 'src/redux/student/admissions/admission-eligibility-policy';

import { Alert, Stack } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { getEligibilityConfigurationError } from 'src/redux/student/admissions/admission-eligibility-validation';
import {
  DEFAULT_ELIGIBILITY_POLICY,
  readAdmissionEligibilityPolicy,
  writeAdmissionEligibilityPolicy,
} from 'src/redux/student/admissions/admission-eligibility-policy';

import { WorkflowProcessChoice } from './workflow-process-choice';
import { EligibilityCriteriaList } from './eligibility-criteria-list';
import { EligibilityExceptionSettings } from './eligibility-exception-settings';

export function WorkflowEligibilitySettings({
  formik,
  forms,
  stages,
  readOnly,
  available,
}: {
  formik: FormikProps<AdmissionWorkflowStage>;
  forms: AdmissionForm[];
  stages: AdmissionWorkflowStage[];
  readOnly: boolean;
  available: boolean;
}) {
  const json = formik.values.configurationJson;
  const policy = readAdmissionEligibilityPolicy(json);
  const error = getEligibilityConfigurationError(json);
  const unreadable = Boolean(error && !policy);
  const disabled = readOnly || !available || unreadable;
  const update = (change: Partial<AdmissionEligibilityPolicy>) =>
    formik.setFieldValue(
      'configurationJson',
      writeAdmissionEligibilityPolicy(json, {
        ...(policy ?? DEFAULT_ELIGIBILITY_POLICY),
        ...change,
      })
    );
  return (
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:clipboard-check-outline"
        title="Eligibility checks"
        descriptionTooltip="Check saved information, resolve missing answers and review authorized exceptions before continuing. Failed eligibility checks do not automatically reject the application."
      >
        <Stack spacing={2}>
          {!available && (
            <Alert severity="info">
              Eligibility evaluation is not available in this environment yet.
            </Alert>
          )}
          {unreadable && <Alert severity="error">{error}</Alert>}
          <WorkflowProcessChoice
            label="Eligibility process"
            value={policy?.enabled ? 'managed' : 'basic'}
            disabled={disabled}
            onChange={(value) => update({ enabled: value === 'managed' })}
            options={[
              {
                value: 'basic',
                title: 'Complete manually',
                description: 'Staff complete this stage using the existing workflow controls.',
                icon: 'mdi:check-circle-outline',
              },
              {
                value: 'managed',
                title: 'Check eligibility rules',
                description:
                  'Evaluate saved information, explain each result and record approved exceptions.',
                icon: 'mdi:clipboard-check-outline',
              },
            ]}
          />
          {policy?.enabled && (
            <>
              <EligibilityCriteriaList
                criteria={policy.criteria}
                onChange={(criteria) => update({ criteria })}
                forms={forms}
                stages={stages}
                stageOrder={formik.values.displayOrder}
                readOnly={disabled}
              />
              {error && <Alert severity="error">{error}</Alert>}
            </>
          )}
        </Stack>
      </FormSectionCard>
      {policy?.enabled && (
        <EligibilityExceptionSettings policy={policy} disabled={disabled} onChange={update} />
      )}
    </Stack>
  );
}
