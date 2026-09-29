import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { getStageOutcomeRule } from './workflow-runtime-route-rules';

export function simpleRouteKey(json?: string): string | undefined {
  if (!json) return undefined;
  try {
    const node = JSON.parse(json);
    if (
      !node ||
      typeof node.field !== 'string' ||
      typeof node.operator !== 'string' ||
      node.conditions ||
      (node.value !== null && typeof node.value === 'object') ||
      Object.keys(node).some((key) => !['field', 'operator', 'value'].includes(key))
    )
      return undefined;
    return JSON.stringify([
      node.field.toLowerCase(),
      node.operator.toLowerCase(),
      node.operator.toLowerCase().includes('empty') ? '' : String(node.value ?? '').toLowerCase(),
    ]);
  } catch {
    return undefined;
  }
}

export function getRouteSaveError(
  route: AdmissionWorkflowTransition,
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[]
): string | undefined {
  const key = simpleRouteKey(route.conditionRuleJson);
  if (
    !route.isDefault &&
    key &&
    transitions.some(
      (item) =>
        item.id !== route.id &&
        item.fromStageId === route.fromStageId &&
        !item.isDefault &&
        simpleRouteKey(item.conditionRuleJson) === key
    )
  )
    return 'This condition already leads to another next step. Edit that path or choose a different condition.';
  const source = stages.find((item) => item.id === route.fromStageId);
  const outcome = source && getStageOutcomeRule(source);
  if (
    route.isDefault &&
    outcome?.explicitExcept &&
    !outcome.allowed.some((value) => outcome.explicitExcept!.includes(value))
  )
    return 'This stage has no outcome that can use the usual next step. Add a special outcome path or update its completion settings.';
  if (!outcome || !key) return undefined;
  const node = JSON.parse(route.conditionRuleJson!);
  if (
    node.field.toLowerCase() === outcome.field.toLowerCase() &&
    node.operator.toLowerCase() === 'equals' &&
    !outcome.allowed.some((item) => item.toLowerCase() === String(node.value).toLowerCase())
  )
    return 'This outcome cannot complete the source stage. Choose a supported outcome or update its completion settings.';
  return undefined;
}

export function getSequentialAppendRoute(
  stages: AdmissionWorkflowStage[],
  transitions: AdmissionWorkflowTransition[],
  added: AdmissionWorkflowStage
): AdmissionWorkflowTransition | undefined {
  if (stages.some((stage) => stage.id === added.id) || added.isEntryStage) return undefined;
  const ordered = [...stages].sort((a, b) => a.displayOrder - b.displayOrder);
  const last = ordered.at(-1);
  if (
    !last ||
    last.isTerminalStage ||
    ordered[0]?.isEntryStage !== true ||
    transitions.length !== Math.max(0, ordered.length - 1) ||
    ordered
      .slice(0, -1)
      .some(
        (stage, index) =>
          !transitions.some(
            (route) =>
              route.fromStageId === stage.id &&
              route.toStageId === ordered[index + 1].id &&
              route.isDefault &&
              !route.conditionRuleJson
          )
      )
  )
    return undefined;
  return {
    id: crypto.randomUUID(),
    fromStageId: last.id,
    toStageId: added.id,
    priority: 0,
    isDefault: true,
  };
}
