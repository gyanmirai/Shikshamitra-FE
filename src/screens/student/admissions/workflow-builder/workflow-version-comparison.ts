import type {
  AdmissionWorkflow,
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

export type WorkflowVersionChange = {
  kind: 'added' | 'removed' | 'changed';
  label: string;
  detail: string;
};

export type WorkflowVersionComparison = {
  stageChanges: WorkflowVersionChange[];
  routeChanges: WorkflowVersionChange[];
  hasChanges: boolean;
};

const normalizedJson = (value?: string) => {
  if (!value) return '';
  try {
    const sortValue = (input: unknown): unknown => {
      if (Array.isArray(input)) return input.map(sortValue);
      if (input && typeof input === 'object') {
        return Object.fromEntries(
          Object.entries(input as Record<string, unknown>)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([key, item]) => [key, sortValue(item)])
        );
      }
      return input;
    };
    return JSON.stringify(sortValue(JSON.parse(value)));
  } catch {
    return value.trim();
  }
};

const stageSignature = (stage: AdmissionWorkflowStage) =>
  JSON.stringify({
    name: stage.name,
    description: stage.description ?? '',
    stageType: stage.stageType,
    displayOrder: stage.displayOrder,
    isRequired: stage.isRequired,
    allowManualSkip: stage.allowManualSkip,
    isEntryStage: stage.isEntryStage,
    isTerminalStage: stage.isTerminalStage,
    configurationJson: normalizedJson(stage.configurationJson),
  });

const routeKey = (
  transition: AdmissionWorkflowTransition,
  stageCodeById: ReadonlyMap<string, string>
) =>
  [
    stageCodeById.get(transition.fromStageId) ?? transition.fromStageId,
    stageCodeById.get(transition.toStageId) ?? transition.toStageId,
    transition.isDefault ? 'default' : normalizedJson(transition.conditionRuleJson),
  ].join('|');

const routeLabel = (
  transition: AdmissionWorkflowTransition,
  stageNameById: ReadonlyMap<string, string>
) =>
  `${stageNameById.get(transition.fromStageId) ?? 'Unknown stage'} → ${stageNameById.get(transition.toStageId) ?? 'Unknown stage'}`;

export function compareWorkflowVersions(
  baseline: Pick<AdmissionWorkflow, 'stages' | 'transitions'>,
  candidate: Pick<AdmissionWorkflow, 'stages' | 'transitions'>
): WorkflowVersionComparison {
  const baselineStages = new Map(
    baseline.stages.map((stage) => [stage.code.trim().toUpperCase(), stage])
  );
  const candidateStages = new Map(
    candidate.stages.map((stage) => [stage.code.trim().toUpperCase(), stage])
  );
  const stageChanges: WorkflowVersionChange[] = [];

  candidateStages.forEach((stage, code) => {
    const previous = baselineStages.get(code);
    if (!previous) {
      stageChanges.push({ kind: 'added', label: stage.name, detail: `Stage ${stage.code} added` });
    } else if (stageSignature(previous) !== stageSignature(stage)) {
      stageChanges.push({
        kind: 'changed',
        label: stage.name,
        detail: `Stage ${stage.code} configuration changed`,
      });
    }
  });
  baselineStages.forEach((stage, code) => {
    if (!candidateStages.has(code)) {
      stageChanges.push({
        kind: 'removed',
        label: stage.name,
        detail: `Stage ${stage.code} removed`,
      });
    }
  });

  const makeRouteMap = (workflow: Pick<AdmissionWorkflow, 'stages' | 'transitions'>) => {
    const codeById = new Map(workflow.stages.map((stage) => [stage.id, stage.code]));
    const nameById = new Map(workflow.stages.map((stage) => [stage.id, stage.name]));
    return new Map(
      workflow.transitions.map((transition) => [
        routeKey(transition, codeById),
        { transition, label: routeLabel(transition, nameById) },
      ])
    );
  };
  const baselineRoutes = makeRouteMap(baseline);
  const candidateRoutes = makeRouteMap(candidate);
  const routeChanges: WorkflowVersionChange[] = [];

  candidateRoutes.forEach(({ transition, label }, key) => {
    const previous = baselineRoutes.get(key);
    if (!previous) {
      routeChanges.push({ kind: 'added', label, detail: 'Route added' });
    } else if (previous.transition.priority !== transition.priority) {
      routeChanges.push({
        kind: 'changed',
        label,
        detail: `Priority changed from ${previous.transition.priority} to ${transition.priority}`,
      });
    }
  });
  baselineRoutes.forEach(({ label }, key) => {
    if (!candidateRoutes.has(key)) {
      routeChanges.push({ kind: 'removed', label, detail: 'Route removed' });
    }
  });

  return {
    stageChanges,
    routeChanges,
    hasChanges: stageChanges.length > 0 || routeChanges.length > 0,
  };
}
