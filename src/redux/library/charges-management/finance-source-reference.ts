import type { FinanceExternalSource } from './finance-external.types';

type AssessmentReference = { id?: unknown; sourceVersion?: unknown };

export function financeSourceFromAssessment(
  detail: AssessmentReference
): FinanceExternalSource | null {
  if (
    typeof detail.id !== 'string' ||
    !detail.id.trim() ||
    typeof detail.sourceVersion !== 'string' ||
    !detail.sourceVersion.trim()
  )
    return null;
  return { kind: 1, sourceId: detail.id, sourceVersion: detail.sourceVersion };
}
