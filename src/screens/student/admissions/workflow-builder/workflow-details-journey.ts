import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';
import { writeAdmissionFormDefinitionId } from 'src/redux/student/admissions/admission-form-stage-policy';
import type { WorkflowDetails } from '../admission-workflow-dialog';

import { getAdmissionWorkflowTemplate } from '../workflow-template';

// Only an explicitly selected starter replaces the graph. Ordinary edits retain IDs and routes.
export function getWorkflowDetailsJourney(
  details: WorkflowDetails,
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[]
) {
  if (details.starterJourney === 'empty') return { stages: [], transitions: [] };
  if (details.starterJourney) {
    return getAdmissionWorkflowTemplate(
      details.starterJourney,
      details.registrationFormDefinitionId ?? undefined
    );
  }
  const registrationStage = [...stages]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .find((stage) => stage.stageType === 1);
  return {
    stages:
      details.registrationFormDefinitionId && registrationStage
        ? stages.map((stage) =>
            stage.id === registrationStage.id
              ? {
                  ...stage,
                  configurationJson: writeAdmissionFormDefinitionId(
                    stage.configurationJson,
                    details.registrationFormDefinitionId!
                  ),
                }
              : stage
          )
        : stages,
    transitions,
  };
}
