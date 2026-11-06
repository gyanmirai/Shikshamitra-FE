import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { GlobalIcons } from 'src/utils/icons';
import { Stack, Divider, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { readAdmissionDocumentPolicy } from 'src/redux/student/admissions/admission-document-policy';

import { SavedStageFacts } from './saved-stage-facts';

const enabled = (value: boolean) => (value ? 'Enabled' : 'Disabled');

export function SavedDocumentStagePolicy({ stage }: { stage: AdmissionWorkflowStage }) {
  const policy = readAdmissionDocumentPolicy(stage.configurationJson);
  return (
    <FormSectionCard
      title="Document Requirements"
      icon={GlobalIcons.documentIcon}
      descriptionTooltip="Saved evidence, collection and review rules. Restricted or unavailable values are not inferred."
    >
      {policy ? (
        <Stack spacing={2} divider={<Divider />}>
          <SavedStageFacts
            items={[
              ['Document verification', enabled(policy.enabled)],
              ['Waivers', enabled(policy.allowWaivers)],
              ['Independent review', enabled(policy.requireIndependentReview)],
              ['Collection stage code', policy.collectionFormStageCode],
            ]}
          />
          {policy.requirements.map((requirement) => (
            <SavedStageFacts
              key={requirement.code}
              items={[
                ['Document name', requirement.name],
                ['Reference', requirement.code],
                ['Description', requirement.description],
                ['Requirement', requirement.requirement],
                ['Collection mode', requirement.collectionMode],
                ['File formats', requirement.allowedExtensions.join(', ')],
                ['Maximum file size (MB)', requirement.maxFileSizeMb],
                [
                  'Class applicability',
                  requirement.standardIds?.length
                    ? `${requirement.standardIds.length} configured classes`
                    : 'All classes',
                ],
              ]}
            />
          ))}
          {!policy.requirements.length && (
            <Typography variant="body2">No document requirements saved.</Typography>
          )}
        </Stack>
      ) : (
        <Typography variant="body2">
          No readable document policy is saved for this stage.
        </Typography>
      )}
    </FormSectionCard>
  );
}
