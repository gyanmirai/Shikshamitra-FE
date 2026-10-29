import type {
  ConcessionRequestContext,
  ConcessionRequestPreview,
} from 'src/redux/finance/ConcessionManagement/types';

// Synthetic local evidence. No endpoint in this fixture writes to a financial backend.
export const detail = {
  id: 'request',
  concessionRequestId: 'request',
  concurrencyStamp: 'opened-stamp',
  status: 6,
  boardId: 'board',
  boardName: 'Synthetic board',
  educationMediumId: 'medium',
  educationMediumName: 'English',
  standardId: 'class',
  standardName: 'Class 10',
  divisionId: 'division',
  divisionName: 'A',
  studentId: 'student',
  studentName: 'Synthetic student',
  studentFeeStructureId: 'assignment',
  concessionPolicyId: 'policy',
  concessionPolicyVersionId: 'version',
  concessionTypeId: 'type',
  feeHeadConcessions: [
    {
      feeHeadId: 'large',
      feeHeadName: 'School fees',
      basedOn: 0,
      amount: 0,
      annualBaseAmount: 58166,
    },
    {
      feeHeadId: 'small',
      feeHeadName: 'Activity fees',
      basedOn: 0,
      amount: 0,
      annualBaseAmount: 717,
    },
  ],
};
export const policy = {
  concessionPolicyId: 'policy',
  concessionPolicyVersionId: 'version',
  policyName: 'Fixed concession',
  policyCode: 'FIXED',
  version: 1,
  valueSource: 'PolicyFixed',
  calculationMethod: 'FixedAmount',
  fixedAmount: 1000,
  applyOn: 'AllFees',
  feeHeadScope: 'AllFeeHeads',
};
export const context = {
  studentFeeStructureId: 'assignment',
  feeStructureName: 'Synthetic annual fees',
  concessionPolicies: [policy],
  concessionTypes: [{ concessionTypeId: 'type', name: 'School concession', documents: [] }],
  feeHeads: detail.feeHeadConcessions.map((head) => ({
    feeHeadId: head.feeHeadId,
    feeHeadName: head.feeHeadName,
    eligibleOutstanding: head.annualBaseAmount,
  })),
  eligibleDueFees: detail.feeHeadConcessions.map((head, index) => ({
    dueFeeId: `due-${index}`,
    feeHeadId: head.feeHeadId,
    feeHeadName: head.feeHeadName,
    installmentLabel: 'Annual',
    year: 2026,
    originalAmount: head.annualBaseAmount,
    paidAmount: index === 1 ? 717 : 0,
    outstandingAmount: index === 1 ? 0 : head.annualBaseAmount,
    eligibleConcessionAmount: head.annualBaseAmount,
  })),
} as unknown as ConcessionRequestContext;
export const preview = {
  concessionPolicyName: 'Fixed concession',
  concessionPolicyVersion: 1,
  totalEligibleBase: 58883,
  totalConcessionAmount: 1000,
  netPayable: 57883,
  previewFingerprint: 'local-preview',
  feeHeadConcessions: detail.feeHeadConcessions.map((head, index) => ({
    ...head,
    discountAmount: index === 0 ? 987.82 : 12.18,
    netAmount: head.annualBaseAmount - (index === 0 ? 987.82 : 12.18),
  })),
} as unknown as ConcessionRequestPreview;
