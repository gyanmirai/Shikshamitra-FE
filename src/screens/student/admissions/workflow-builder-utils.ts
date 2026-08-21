import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

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
  isEntryStage: boolean
): AdmissionWorkflowStage => ({
  id: crypto.randomUUID(),
  code: `STAGE_${displayOrder + 1}`,
  name: metadata.displayName,
  description: metadata.description,
  stageType: metadata.type,
  displayOrder,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage,
  isTerminalStage: false,
});

export const reorderStages = (
  stages: AdmissionWorkflowStage[],
  activeId: string,
  overId: string
): AdmissionWorkflowStage[] => {
  const oldIndex = stages.findIndex((stage) => stage.id === activeId);
  const newIndex = stages.findIndex((stage) => stage.id === overId);
  if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return stages;
  const reordered = [...stages];
  const [moved] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, moved);
  return reordered.map((stage, index) => ({ ...stage, displayOrder: index }));
};

export const duplicateStage = (
  stages: AdmissionWorkflowStage[],
  sourceId: string
): AdmissionWorkflowStage[] => {
  const sourceIndex = stages.findIndex((stage) => stage.id === sourceId);
  if (sourceIndex < 0) return stages;
  const source = stages[sourceIndex];
  const existingCodes = new Set(stages.map((stage) => stage.code.toUpperCase()));
  const baseCode = `${source.code}_COPY`;
  let code = baseCode;
  let suffix = 2;
  while (existingCodes.has(code.toUpperCase())) {
    code = `${baseCode}_${suffix}`;
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
