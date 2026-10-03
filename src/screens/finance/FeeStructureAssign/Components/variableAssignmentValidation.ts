import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { amountError } from 'src/screens/finance/settings/FeeStructure/feeStructureModel';

export function variableAssignmentError(
  candidate: AssignmentCandidate,
  request: AssignmentRequest
): string | undefined {
  return candidate.heads
    .filter(
      (head) =>
        head.isVariable &&
        (!head.isOptional || request.selectedOptionalFeeHeadIds.includes(head.feeHeadId))
    )
    .map((head) => {
      const input = request.variableFeeHeads?.find((h) => h.feeHeadId === head.feeHeadId);
      const problem = amountError(input?.amount);
      if (problem) return `${head.feeHeadName}: ${problem}`;
      if (input?.amount === 0 && !input.zeroAmountReason?.trim())
        return `${head.feeHeadName}: Enter a reason for the zero amount.`;
      return undefined;
    })
    .find(Boolean);
}
