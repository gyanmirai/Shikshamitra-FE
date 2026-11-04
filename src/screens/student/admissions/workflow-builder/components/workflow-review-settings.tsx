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
        title="Review Responsibility"
        descriptionTooltip="Staff Submit a Recommendation with a Reason. An Authorized Approver Makes the Admission Decision Using the Existing Permissions. Changed Evidence Requires Another Review. Changing the Reviewer Role Clears the Default Reviewer So You Can Choose a Matching Person."
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
            label="Review Process"
            value={policy?.enabled ? 'managed' : 'basic'}
            disabled={disabled}
            onChange={(value) => update({ enabled: value === 'managed' })}
            options={[
              {
                value: 'basic',
                title: 'Complete Manually',
                description: 'Staff complete this stage using the existing workflow controls.',
                icon: 'mdi:check-circle-outline',
              },
              {
                value: 'managed',
                title: 'Collect a Staff Review and Recommendation',
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
            title="Evidence to Review"
            descriptionTooltip="Choose Earlier Checks That Must Be Current Before a Decision. Approval Requires the Selected Checks to Pass."
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
            title="Reviewer Checklist"
            descriptionTooltip="Add Confirmations Staff Should Complete, or Use a Recommendation with Notes Only."
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
