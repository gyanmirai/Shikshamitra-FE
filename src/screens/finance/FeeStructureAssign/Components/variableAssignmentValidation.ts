import type {
  AssignmentRequest,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { amountError } from 'src/screens/finance/settings/FeeStructure/feeStructureModel';

export function assignmentFeeSelectionError(
  candidate: AssignmentCandidate,
  request: AssignmentRequest
): string | undefined {
  return candidate.heads.some(
    (head) => !head.isOptional || request.selectedOptionalFeeHeadIds.includes(head.feeHeadId)
  )
    ? undefined
    : 'Select at least one fee before assigning.';
}

export function assignmentInputError(
  candidate: AssignmentCandidate,
  request: AssignmentRequest
): string | undefined {
  return (
    assignmentFeeSelectionError(candidate, request) || variableAssignmentError(candidate, request)
  );
}

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

export function assignmentPolicyError(
  candidate: AssignmentCandidate,
  request: AssignmentRequest
): string | undefined {
  const collectionVersion =
    request.policies?.find((p) => p.family === 'collection')?.versionId ??
    candidate.policies?.find((p) => p.family === 'collection')?.versionId;
  const refundVersion =
    request.policies?.find((p) => p.family === 'refund')?.versionId ??
    candidate.policies?.find((p) => p.family === 'refund')?.versionId;

  if (!collectionVersion?.trim() && !refundVersion?.trim()) {
    return 'Select a Collection Policy and a Refund Policy before continuing.';
  }
  if (!collectionVersion?.trim()) {
    return 'Select a Collection Policy before continuing.';
  }
  if (!refundVersion?.trim()) {
    return 'Select a Refund Policy before continuing.';
  }
  return undefined;
}
