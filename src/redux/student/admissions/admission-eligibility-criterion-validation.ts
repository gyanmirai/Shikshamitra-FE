import { readAdmissionCondition, getAdmissionConditionError } from './admission-condition-rule';

import type { AdmissionConditionRule } from './admission-condition-rule';
import type { AdmissionEligibilityCriterion } from './admission-eligibility-policy';

function sameSource(rule: AdmissionConditionRule, source: string): boolean {
  return 'conditions' in rule
    ? rule.conditions.every((child) => sameSource(child, source))
    : rule.field.startsWith(`${source}.`);
}

export function getEligibilityCriterionError(
  value: AdmissionEligibilityCriterion
): string | undefined {
  if (!/^[A-Z][A-Z0-9_]{0,63}$/.test(value.code))
    return 'Use a code starting with a letter and containing only uppercase letters, numbers, and underscores (up to 64 characters).';
  if (typeof value.name !== 'string' || !value.name.trim() || value.name.length > 128)
    return 'Enter a criterion name with up to 128 characters.';
  if ((value.failureMessage?.length ?? 0) > 1024)
    return 'Keep the explanation within 1,024 characters.';
  if (value.kind === 'age') {
    const { minAgeMonths: min, maxAgeMonths: max, cutoffDate } = value;
    if (min == null && max == null) return 'Set a minimum age, a maximum age, or both.';
    if ([min, max].some((age) => age != null && (!Number.isInteger(age) || age < 0 || age > 1200)))
      return 'Use whole months between 0 and 1,200 for age limits.';
    if (min != null && max != null && min > max)
      return 'The maximum age must be at least the minimum age.';
    if (!cutoffDate || !/^\d{4}-\d{2}-\d{2}$/.test(cutoffDate))
      return 'Choose the fixed date on which age is checked.';
    const date = new Date(`${cutoffDate}T00:00:00Z`);
    if (
      !Number.isFinite(date.getTime()) ||
      date.getUTCFullYear() < 1 ||
      date.toISOString().slice(0, 10) !== cutoffDate
    )
      return 'Choose a valid age cutoff date.';
  } else if (value.kind === 'application' || value.kind === 'inquiry') {
    if (
      !value.formDefinitionId ||
      !/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value.formDefinitionId)
    )
      return 'Choose the published form that collects these answers.';
    const error = getAdmissionConditionError(value.conditionJson);
    if (error)
      return error
        .replace('when this document is required', 'whether this criterion passes')
        .replace('for one document', 'for one criterion');
    const rule = readAdmissionCondition(value.conditionJson);
    if (!rule || !sameSource(rule, value.kind))
      return `Choose only ${value.kind} answers for this criterion.`;
  } else if (value.kind === 'assessment' || value.kind === 'documents') {
    if (!value.sourceStageCode?.trim()) return 'Choose the earlier workflow stage to check.';
    if (value.kind === 'documents' && value.requiredOutcome !== 'verified')
      return 'Choose verified documents as the required outcome.';
    if (value.kind === 'assessment' && !['passed', 'waived'].includes(value.requiredOutcome ?? ''))
      return 'Choose the required assessment outcome.';
    if (
      value.minimumPercentage != null &&
      (!Number.isFinite(value.minimumPercentage) ||
        value.minimumPercentage < 0 ||
        value.minimumPercentage > 100)
    )
      return 'Enter a minimum percentage between 0 and 100.';
    if (value.minimumPercentage != null && value.requiredOutcome === 'waived')
      return 'A waived assessment cannot require a score.';
  } else return 'Choose a supported eligibility check.';
  return undefined;
}
