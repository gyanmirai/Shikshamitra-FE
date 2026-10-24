import type {
  ConcessionPolicyOption,
  ConcessionRequestContext,
} from 'src/redux/finance/ConcessionManagement/types';

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
  if (!percentage && policy.maximumFixedAmount != null && total > policy.maximumFixedAmount) {
    lines.forEach((line) => {
      if (Number(entries[line.dueFeeId]) > 0 && !errors[line.dueFeeId]) {
        errors[line.dueFeeId] =
          'The total concession exceeds the policy limit. Reduce an installment amount.';
      }
    });
  }
  return errors;
}

export function concessionErrorMessage(error: any, fallback: string): string {
  const data = error?.data;
  const code = data?.errorCode ?? data?.error?.code;
  if (code === 'Finance:Concession:010020') {
    return 'The selected installments or balances changed after the preview. Review the refreshed amounts and submit again.';
  }
  if (code === 'Finance:Concession:010032') {
    return 'Concession amount must be a whole rupee. Enter ₹1 or more for the affected installment.';
  }
  return data?.detail || data?.error?.message || data?.message || error?.message || fallback;
}
