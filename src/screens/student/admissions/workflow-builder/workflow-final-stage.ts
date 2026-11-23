import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

export const FINAL_DECISION_REQUIRED =
  'End of Journey must be on for the last Admission decision stage only.';
export const FINAL_DECISION_HAS_ROUTES = 'Remove the next steps from the final Admission decision.';
export const FINAL_DECISION_REPLACEMENT =
  'Insert another Admission decision directly before the final stage so it can take over.';

function lastWorkflowStage(stages: AdmissionWorkflowStage[]) {
  return stages.reduce<AdmissionWorkflowStage | undefined>(
    (last, stage) => (!last || stage.displayOrder > last.displayOrder ? stage : last),
    undefined
  );
}

export function isLastWorkflowStage(
  stages: AdmissionWorkflowStage[],
  stageId: string,
  insertionSourceId?: string | null
) {
  const last = lastWorkflowStage(stages);
  if (!last) return true;
  if (stages.some((stage) => stage.id === stageId)) return last.id === stageId;
  return last.id === insertionSourceId && !last.isTerminalStage;
}

export function getWorkflowFinalStageError(
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[]
) {
  const last = lastWorkflowStage(stages);
  if (
    last?.stageType !== 7 ||
    !last.isTerminalStage ||
    stages.some(
      (stage) =>
        stage.id !== last.id && (stage.isTerminalStage || stage.displayOrder === last.displayOrder)
    )
  ) {
    return FINAL_DECISION_REQUIRED;
  }
  return transitions.some((route) => route.fromStageId === last.id)
    ? FINAL_DECISION_HAS_ROUTES
    : undefined;
}
