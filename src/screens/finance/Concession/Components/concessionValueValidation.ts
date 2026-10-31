import type {
  ConcessionPolicyOption,
  ConcessionRequestContext,
} from 'src/redux/finance/ConcessionManagement/types';

import { parseApiProblemDetail, isGenericApiProblemMessage } from 'src/utils/api-problem-details';

export function validateConcessionInstallments(
  selectedHeadIds: string[],
  entries: Record<string, number | string>,
  context?: ConcessionRequestContext,
  policy?: ConcessionPolicyOption
): Record<string, string> {
  if (policy?.valueSource !== 'RequestEnteredWithinLimits') return {};
  const percentage = policy.calculationMethod === 'Percentage';
  const errors: Record<string, string> = {};
  const lines = (context?.eligibleDueFees || []).filter(
    (line) => selectedHeadIds.includes(line.feeHeadId) && line.eligibleConcessionAmount > 0
  );
  let total = 0;
  lines.forEach((line) => {
    const raw = entries[line.dueFeeId];
    // An empty installment is deliberately omitted from the request.
    if (raw === undefined || raw === '') return;
    const value = Number(raw);
    total += Number.isFinite(value) ? value : 0;
    if (!Number.isFinite(value) || value <= 0) {
      errors[line.dueFeeId] = 'Enter a positive concession value or clear this installment.';
    } else if (!percentage && !Number.isInteger(value)) {
      errors[line.dueFeeId] = 'Concession amount must be a whole rupee. Enter ₹1 or more.';
    } else if (percentage && !/^\d+(?:\.\d{0,2})?$/.test(String(raw))) {
      errors[line.dueFeeId] = 'Concession percentage must have no more than two decimal places.';
    } else if (percentage && value > Math.min(100, policy.maximumPercentage ?? 100)) {
      errors[line.dueFeeId] =
        `Concession percentage must not exceed ${Math.min(100, policy.maximumPercentage ?? 100)}%.`;
    } else if (!percentage && value > line.eligibleConcessionAmount) {
      errors[line.dueFeeId] =
        'Concession amount must not exceed this installment’s eligible amount.';
    }
  });
  const maximum = percentage
    ? Math.min(100, policy.maximumPercentage ?? 100)
    : policy.maximumFixedAmount;
  if (maximum != null && Number(total.toFixed(2)) > maximum) {
    lines.forEach((line) => {
      if (Number(entries[line.dueFeeId]) > 0 && !errors[line.dueFeeId]) {
        errors[line.dueFeeId] = percentage
          ? `The total concession percentage exceeds the ${maximum}% request limit. Reduce an installment percentage.`
          : 'The total concession exceeds the policy limit. Reduce an installment amount.';
      }
    });
  }
  return errors;
}

export function concessionErrorMessage(error: any, fallback: string): string {
  const { detail, errorCode } = parseApiProblemDetail(error);
  const generic =
    isGenericApiProblemMessage(detail) ||
    /^(bad request|conflict|not found|invalid request|request failed|validation failed)$/i.test(
      detail
    );
  const message = generic ? fallback : detail;
  const data = error?.response?.data ?? error?.data ?? error;
  const traceId =
    data?.traceId ??
    data?.correlationId ??
    data?.error?.data?.traceId ??
    data?.error?.data?.correlationId;
  const reference = typeof traceId === 'string' && traceId.trim() ? traceId.trim() : undefined;
  const code = generic && typeof errorCode === 'string' ? `Code: ${errorCode}` : undefined;
  const support = [code, reference && `Reference: ${reference}`].filter(Boolean).join('; ');
  return support ? `${message} (${support})` : message;
}
