import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { GlobalIcons } from 'src/utils/icons';
import { Stack, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { readAdmissionAssessmentPolicy } from 'src/redux/student/admissions/admission-assessment-policy';

import { SavedStageFacts } from './saved-stage-facts';

const enabled = (value: boolean) => (value ? 'Enabled' : 'Disabled');

export function SavedAssessmentStagePolicy({ stage }: { stage: AdmissionWorkflowStage }) {
  const policy = readAdmissionAssessmentPolicy(stage.configurationJson);
  return (
    <FormSectionCard
      title="Assessment Settings"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Saved scheduling, attendance and assessment scoring requirements for this version."
    >
      {policy ? (
        <>
          <SavedStageFacts
            items={[
              ['Assessment', enabled(policy.enabled)],
              ['Scheduling', enabled(policy.schedulingEnabled)],
              ['Attendance required', enabled(policy.attendanceRequired)],
              ['Scoring', enabled(policy.scoringEnabled)],
              ['Total marks', policy.totalMarks],
              ['Passing marks', policy.passingMarks],
              ['Review required', enabled(policy.reviewRequired)],
              ['Maximum attempts', policy.maxAttempts],
              ['Scoring mode', policy.scoringMode ?? 'Total'],
            ]}
          />
          {policy.classProfiles?.map((profile) => (
            <Stack key={profile.id} spacing={1}>
              <Typography variant="subtitle2">{profile.name}</Typography>
              <SavedStageFacts
                items={[
                  ['Pass rule', profile.passRule],
                  ['Passing marks', profile.passingMarks],
                  ['Configured classes', profile.standardIds.length],
                  [
                    'Subjects',
                    profile.subjects
                      .map(
                        (subject) =>
                          `${subject.name} (${subject.code}): ${subject.totalMarks} marks${subject.passingMarks == null ? '' : `, pass ${subject.passingMarks}`}`
                      )
                      .join('\n'),
                  ],
                ]}
              />
            </Stack>
          ))}
        </>
      ) : (
        <Typography variant="body2">
          No readable assessment policy is saved for this stage.
        </Typography>
      )}
    </FormSectionCard>
  );
}
