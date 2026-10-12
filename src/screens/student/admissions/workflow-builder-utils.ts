import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { ROUTE_OPERATOR_LABELS } from './workflow-builder/workflow-condition-catalog';
import { normalizeStageConfiguration } from './workflow-builder/workflow-stage-configuration';

export type SimpleTransitionCondition = {
  field: string;
  operator:
    | 'Equals'
    | 'NotEquals'
    | 'GreaterThan'
    | 'GreaterThanOrEqual'
    | 'LessThan'
    | 'LessThanOrEqual'
    | 'Contains'
    | 'IsEmpty'
    | 'IsNotEmpty'
    | 'In'
    | 'NotIn';
  value?: string;
};

export const createStage = (
  metadata: AdmissionWorkflowStageTypeMetadata,
  displayOrder: number,
  isEntryStage: boolean,
  existingStages: AdmissionWorkflowStage[] = []
): AdmissionWorkflowStage => {
  const existingCodes = new Set(existingStages.map((stage) => stage.code.trim().toUpperCase()));
  let number = displayOrder + 1;
  while (existingCodes.has(`STAGE_${number}`)) number += 1;
  return normalizeStageConfiguration({
    id: crypto.randomUUID(),
    code: `STAGE_${number}`,
    name: metadata.displayName,
    description: metadata.description,
    stageType: metadata.type,
    displayOrder,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage,
    isTerminalStage: false,
  });
};

export const normalizeAdmissionWorkflowStages = (
  stages: AdmissionWorkflowStage[]
): AdmissionWorkflowStage[] => stages.map(normalizeStageConfiguration);

export const duplicateStage = (
  stages: AdmissionWorkflowStage[],
  sourceId: string
): AdmissionWorkflowStage[] => {
  const sourceIndex = stages.findIndex((stage) => stage.id === sourceId);
  if (sourceIndex < 0) return stages;
  const source = stages[sourceIndex];
  const existingCodes = new Set(stages.map((stage) => stage.code.trim().toUpperCase()));
  const copyCode = (suffix: string) => `${source.code.slice(0, 64 - suffix.length)}${suffix}`;
  let code = copyCode('_COPY');
  let suffix = 2;
  while (existingCodes.has(code.toUpperCase())) {
    code = copyCode(`_COPY_${suffix}`);
    suffix += 1;
  }
  const copy: AdmissionWorkflowStage = {
    ...source,
    id: crypto.randomUUID(),
    name: `Copy of ${source.name}`.slice(0, 128),
    code,
    isEntryStage: false,
    isTerminalStage: false,
  };
  const result = [...stages];
  result.splice(sourceIndex + 1, 0, copy);
  return result.map((stage, index) => ({ ...stage, displayOrder: index }));
};

export const serializeSimpleCondition = (
  condition: SimpleTransitionCondition | null
): string | undefined => {
  if (!condition) return undefined;
  const valueRequired = !['IsEmpty', 'IsNotEmpty'].includes(condition.operator);
  return JSON.stringify({
    operator: condition.operator,
    field: condition.field.trim(),
    ...(valueRequired ? { value: condition.value ?? '' } : {}),
  });
};

export const parseSimpleCondition = (value?: string): SimpleTransitionCondition | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SimpleTransitionCondition;
    if (!parsed.field || !parsed.operator) return null;
    return parsed;
  } catch {
    return null;
  }
};

export const getTransitionLabel = (
  transition: AdmissionWorkflowTransition,
  stages: AdmissionWorkflowStage[]
) => {
  const from = stages.find((stage) => stage.id === transition.fromStageId)?.name ?? 'Unknown';
  const to = stages.find((stage) => stage.id === transition.toStageId)?.name ?? 'Unknown';
  return `${from} → ${to}`;
};

export const orderTransitionsByJourney = (
  transitions: AdmissionWorkflowTransition[],
  stages: AdmissionWorkflowStage[]
) => {
  const displayOrderByStage = new Map(stages.map((stage) => [stage.id, stage.displayOrder]));
  return [...transitions].sort(
    (left, right) =>
      (displayOrderByStage.get(left.fromStageId) ?? Number.MAX_SAFE_INTEGER) -
        (displayOrderByStage.get(right.fromStageId) ?? Number.MAX_SAFE_INTEGER) ||
      left.priority - right.priority ||
      (displayOrderByStage.get(left.toStageId) ?? Number.MAX_SAFE_INTEGER) -
        (displayOrderByStage.get(right.toStageId) ?? Number.MAX_SAFE_INTEGER)
  );
};

export const getTransitionStepLabel = (
  transition: AdmissionWorkflowTransition,
  stages: AdmissionWorkflowStage[]
) => {
  const from = stages.find((stage) => stage.id === transition.fromStageId)?.displayOrder;
  const to = stages.find((stage) => stage.id === transition.toStageId)?.displayOrder;
  return from === undefined || to === undefined ? 'Unmapped' : `Step ${from + 1} → ${to + 1}`;
};

export const getTransitionSummary = (transition: AdmissionWorkflowTransition) => {
  if (transition.isDefault) return 'Usual path';
  const condition = parseSimpleCondition(transition.conditionRuleJson);
  if (!condition) return 'Advanced path';
  const field = condition.field
    .split('.')
    .at(-1)
    ?.replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ');
  const value = condition.value?.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]/g, ' ');
  return `${field} ${ROUTE_OPERATOR_LABELS[condition.operator] ?? condition.operator}${value ? ` ${value}` : ''}`;
};
