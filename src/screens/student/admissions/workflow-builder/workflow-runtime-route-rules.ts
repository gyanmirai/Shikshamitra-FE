import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { readAdmissionSeatPolicy } from 'src/redux/student/admissions/admission-seat-policy';
import { readAdmissionOfferPolicy } from 'src/redux/student/admissions/admission-offer-policy';
import { readStageConfiguration } from 'src/redux/student/admissions/admission-assessment-policy';

type OutcomeRule = { field: string; allowed: string[]; explicitExcept?: string[] };
type Node = { field?: string; operator?: string; value?: unknown; conditions?: Node[] };

export function getStageOutcomeRule(stage: AdmissionWorkflowStage): OutcomeRule | undefined {
  const config = readStageConfiguration(stage.configurationJson);
  const key = (
    {
      2: 'assessment',
      3: 'eligibility',
      4: 'payment',
      5: 'documentVerification',
      6: 'review',
      8: 'offer',
      9: 'seat',
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
    case 3:
      return {
        field: 'eligibility.status',
        allowed: ['eligible', 'exceptionApproved', 'ineligible', 'needsInformation'],
        explicitExcept: ['eligible', 'exceptionApproved'],
      };
    case 4:
      return { field: 'payment.status', allowed: ['settled', 'waived'] };
    case 5:
      return { field: 'documents.status', allowed: ['verified'] };
    case 6:
      return {
        field: 'review.decision',
        allowed: ['approve', 'waitlist', 'reject'],
        explicitExcept: ['approve'],
      };
    case 8:
      return {
        field: 'offer.status',
        allowed: readAdmissionOfferPolicy(stage.configurationJson)?.allowedCompletionOutcomes ?? [],
        explicitExcept: ['accepted'],
      };
    case 9:
      return {
        field: 'seat.status',
        allowed: readAdmissionSeatPolicy(stage.configurationJson)?.allowedCompletionOutcomes ?? [],
        explicitExcept: ['confirmed'],
      };
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
