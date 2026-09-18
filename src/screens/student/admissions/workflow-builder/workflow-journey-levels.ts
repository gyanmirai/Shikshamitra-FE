import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

export type WorkflowJourneyLevel = {
  depth: number | null;
  stages: AdmissionWorkflowStage[];
};

export function buildWorkflowJourneyLevels(
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[]
): WorkflowJourneyLevel[] {
  const entry = stages.find((stage) => stage.isEntryStage);
  if (!entry) return [{ depth: null, stages: [...stages].sort(byDisplayOrder) }];

  const depthByStage = new Map<string, number>([[entry.id, 0]]);
  const queue = [entry.id];
  while (queue.length > 0) {
    const stageId = queue.shift()!;
    const nextDepth = (depthByStage.get(stageId) ?? 0) + 1;
    transitions
      .filter((transition) => transition.fromStageId === stageId)
      .forEach((transition) => {
        const currentDepth = depthByStage.get(transition.toStageId);
        if (currentDepth === undefined || nextDepth < currentDepth) {
          depthByStage.set(transition.toStageId, nextDepth);
          queue.push(transition.toStageId);
        }
      });
  }

  const grouped = new Map<number, AdmissionWorkflowStage[]>();
  const unreachable: AdmissionWorkflowStage[] = [];
  stages.forEach((stage) => {
    const depth = depthByStage.get(stage.id);
    if (depth === undefined) {
      unreachable.push(stage);
      return;
    }
    grouped.set(depth, [...(grouped.get(depth) ?? []), stage]);
  });

  const levels: WorkflowJourneyLevel[] = [...grouped.entries()]
    .sort(([left], [right]) => left - right)
    .map(([depth, levelStages]) => ({ depth, stages: levelStages.sort(byDisplayOrder) }));
  if (unreachable.length > 0) {
    levels.push({ depth: null, stages: unreachable.sort(byDisplayOrder) });
  }
  return levels;
}

const byDisplayOrder = (left: AdmissionWorkflowStage, right: AdmissionWorkflowStage) =>
  left.displayOrder - right.displayOrder || left.name.localeCompare(right.name);
