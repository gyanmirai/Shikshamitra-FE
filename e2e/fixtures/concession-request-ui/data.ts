import type {
  ConcessionRequestContext,
  ConcessionPolicyOption,
  ConcessionRequestPreview,
} from 'src/redux/finance/ConcessionManagement/types';

// Synthetic balances only. The fixture never calls a financial backend.
export const policy = {
  concessionPolicyId: 'policy',
  concessionPolicyVersionId: 'version',
  policyName: 'Sibling policy',
  version: 1,
  valueSource: 'RequestEnteredWithinLimits',
  calculationMethod: 'Percentage',
  maximumPercentage: 25,
  maximumFixedAmount: 1000,
} as ConcessionPolicyOption;
export const context = {
  feeHeads: [{ feeHeadId: 'tuition', feeHeadName: 'School tuition', eligibleOutstanding: 5000 }],
  eligibleDueFees: [1, 2].map((n) => ({
    dueFeeId: `due-${n}`,
    feeHeadId: 'tuition',
    feeHeadName: 'School tuition',
    installmentLabel: `Half-Yearly ${n}`,
    year: 2026,
    originalAmount: 2500,
    paidAmount: 0,
    outstandingAmount: 2500,
    eligibleConcessionAmount: 2500,
  })),
} as ConcessionRequestContext;
export const preview = {
  totalEligibleBase: 5000,
  totalConcessionAmount: 400,
  netPayable: 4600,
  feeHeadConcessions: [{ feeHeadId: 'tuition', discountAmount: 400, netAmount: 4600 }],
} as ConcessionRequestPreview;
export const approvalContext = {
  concessionPolicyName: 'Sibling policy',
  concessionPolicyVersion: 1,
  requestConcurrencyStamp: 'stamp',
  previewFingerprint: 'fingerprint',
  totalRequestedConcessionAmount: 400,
  feeHeadGroups: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'School tuition',
      requestedConcessionAmount: 400,
      hasChangedSinceSubmission: false,
      dueFeeLines: context.eligibleDueFees.map((line) => ({
        ...line,
        monthLabel: line.installmentLabel,
        suggestedConcessionAmount: 200,
      })),
    },
  ],
};
