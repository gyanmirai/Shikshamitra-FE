import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';

import { isApplicationStageType } from './workflow-stage-configuration';

type OutcomeRule = { field: string; allowed: string[]; explicitExcept?: string[] };
type Node = { field?: string; operator?: string; value?: unknown; conditions?: Node[] };

export function getStageOutcomeRule(stage: AdmissionWorkflowStage): OutcomeRule | undefined {
  if (stage.stageType === 4) return { field: 'payment.status', allowed: ['feeStructureConfirmed'] };
  const config = readStageConfiguration(stage.configurationJson);
  const key = (
    {
      2: 'assessment',
      5: 'documentVerification',
    } as Record<number, string>
  )[stage.stageType];
  const policy = config?.[key] as
    { enabled?: boolean; allowedCompletionOutcomes?: string[] } | undefined;
  if (!policy?.enabled) return undefined;
  switch (stage.stageType) {
    case 2:
      return {
        field: 'assessment.outcome',
        allowed: ['passed', 'waived', 'failed', 'absent', 'retake'],
        explicitExcept: ['passed', 'waived'],
      };
    case 5:
      return { field: 'documents.status', allowed: ['verified'] };
    default:
      return undefined;
  }
}

export function getStageRouteBlocker(
  stage: AdmissionWorkflowStage,
  facts: Readonly<Record<string, string>>,
  route?: AdmissionWorkflowTransition,
  evaluate?: (json: string, values: Readonly<Record<string, string>>) => boolean
): string | undefined {
  if (!isApplicationStageType(stage.stageType))
    return `${stage.name}: replace this retired stage type before testing the journey.`;
  const rule = getStageOutcomeRule(stage);
  if (!rule) return undefined;
  const value = facts[rule.field];
  if (!value || !rule.allowed.some((item) => item.toLowerCase() === value.toLowerCase()))
    return `${stage.name} cannot finish with ${value || 'a missing outcome'}. Complete its requirements or choose an outcome allowed in stage settings.`;
  if (
    rule.explicitExcept &&
    !rule.explicitExcept.some((item) => item.toLowerCase() === value.toLowerCase())
  ) {
    const matching = (node: Node): boolean =>
      node.conditions
        ? node.conditions.some(matching)
        : node.field?.toLowerCase() === rule.field.toLowerCase() &&
          ((node.operator?.toLowerCase() === 'equals' &&
            String(node.value).toLowerCase() === value.toLowerCase()) ||
            (node.operator?.toLowerCase() === 'in' &&
              Array.isArray(node.value) &&
              node.value.some((item) => String(item).toLowerCase() === value.toLowerCase())));
    try {
      if (
        route &&
        !route.isDefault &&
        route.conditionRuleJson &&
        matching(JSON.parse(route.conditionRuleJson)) &&
        (stage.stageType === 2 ||
          !evaluate?.(route.conditionRuleJson, { ...facts, [rule.field]: '__unavailable__' }))
      )
        return undefined;
    } catch {
      /* Validation reports malformed rules. */
    }
    return `${stage.name}: ${value} needs an explicit outcome path. The usual next step cannot handle this outcome.`;
  }
  return undefined;
}
