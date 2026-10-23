import type { FormikProps } from 'formik';
import type { AdmissionReviewPolicy } from 'src/redux/student/admissions/admission-review-policy';
import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { Stack } from '@mui/material';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { getReviewConfigurationError } from 'src/redux/student/admissions/admission-review-validation';
import {
  DEFAULT_REVIEW_POLICY,
  readAdmissionReviewPolicy,
  writeAdmissionReviewPolicy,
} from 'src/redux/student/admissions/admission-review-policy';

import { ReviewPrerequisites } from './review-prerequisites';
import { ReviewTimingSettings } from './review-timing-settings';
import { WorkflowProcessChoice } from './workflow-process-choice';
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
    <Stack spacing={2}>
      <FormSectionCard
        icon="mdi:account-check-outline"
        title="Review responsibility"
        descriptionTooltip="Staff submit a recommendation with a reason. An authorized approver makes the admission decision using the existing permissions. Changed evidence requires another review. Changing the reviewer role clears the default reviewer so you can choose a matching person."
      >
        <Stack spacing={2}>
          {!available && (
            <StudentFeedback notificationKey="STU-0572" presentation="inline" severity="info">
              Managed review is not available in this environment yet.
            </StudentFeedback>
          )}
          {unreadable && (
            <StudentFeedback notificationKey="STU-0573" presentation="persistent" severity="error">
              {error}
            </StudentFeedback>
          )}
          <WorkflowProcessChoice
            label="Review process"
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
                title: 'Collect a staff review and recommendation',
                description:
                  'Collect evidence and a staff recommendation before an authorized approver records the admission decision.',
                icon: 'mdi:account-check-outline',
              },
            ]}
          />
          {policy?.enabled && (
            <>
              <ReviewResponsibilitySettings
                policy={policy}
                disabled={disabled}
                available={available}
                onChange={update}
              />
              {error && (
                <StudentFeedback
                  notificationKey="STU-0573"
                  presentation="persistent"
                  severity="error"
                >
                  {error}
                </StudentFeedback>
              )}
            </>
          )}
        </Stack>
      </FormSectionCard>
      {policy?.enabled && (
        <>
          <FormSectionCard
            icon="mdi:folder-check-outline"
            title="Evidence to review"
            descriptionTooltip="Choose earlier checks that must be current before a decision. Approval requires the selected checks to pass."
          >
            <ReviewPrerequisites
              value={policy.prerequisites}
              stages={stages}
              stageOrder={formik.values.displayOrder}
              disabled={disabled}
              onChange={(prerequisites) => update({ prerequisites })}
            />
          </FormSectionCard>
          <FormSectionCard
            icon="mdi:format-list-checks"
            title="Reviewer checklist"
            descriptionTooltip="Add confirmations staff should complete, or use a recommendation with notes only."
          >
            <ReviewChecklistSettings
              value={policy.checklist}
              disabled={disabled}
              onChange={(checklist) => update({ checklist })}
            />
          </FormSectionCard>
          <ReviewTimingSettings
            value={policy.dueInDays}
            disabled={disabled}
            onChange={(dueInDays) => update({ dueInDays })}
          />
        </>
      )}
    </Stack>
  );
}
