import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';
import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { Stack } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { FormSectionCard } from 'src/components/form-section-card';

import { SavedStageFacts } from './saved-stage-facts';
import { SavedWorkflowStagePolicy } from './saved-workflow-stage-policy';

export function SavedWorkflowStageDetails({
  stage,
  metadata,
  forms,
}: {
  stage: AdmissionWorkflowStage;
  metadata?: AdmissionWorkflowStageTypeMetadata;
  forms: AdmissionForm[];
}) {
  const yesNo = (value: boolean) => (value ? 'Yes' : 'No');
  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <FormSectionCard
        title="Stage Details"
        icon={GlobalIcons.documentIcon}
        descriptionTooltip={
          metadata?.description || 'Saved identity and description for this workflow stage.'
        }
      >
        <SavedStageFacts
          items={[
            ['Stage name', stage.name],
            ['Stage code', stage.code],
            ['Stage type', metadata?.displayName ?? `Saved type ${stage.stageType}`],
            ['Description', stage.description],
            ['Display order', stage.displayOrder],
          ]}
        />
      </FormSectionCard>
      <SavedWorkflowStagePolicy stage={stage} forms={forms} />
      <FormSectionCard
        title="Stage Behavior"
        icon={GlobalIcons.academicFieldSettings}
        descriptionTooltip="These values belong to the saved workflow version. Admission finalization and Student Onboarding remain separate actions."
      >
        <SavedStageFacts
          items={[
            ['Required stage', yesNo(stage.isRequired)],
            ['Allow authorized skip', yesNo(stage.allowManualSkip)],
            ['Entry stage', yesNo(stage.isEntryStage)],
            ['End of journey', yesNo(stage.isTerminalStage)],
          ]}
        />
      </FormSectionCard>
    </Stack>
  );
}
