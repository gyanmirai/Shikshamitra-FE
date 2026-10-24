const eligibility = {
  totalPaid: 6000,
  totalRefundable: 6000,
  allowedPayoutMethods: ['Cash'],
  feeHeads: ['FH1', 'FH2'].map((feeHeadId) => ({
    feeHeadId,
    feeHeadName: feeHeadId,
    months: [6, 7, 8].map((month) => ({
      month,
      year: 2026,
      dueFeeId: `${feeHeadId}-${month}`,
      sourceAllocationId: `${feeHeadId}-allocation-${month}`,
      sourceReceiptId: 'receipt-1',
      receiptNumber: 'SYNTHETIC-001',
      total: 1000,
      paid: 1000,
      refunded: 0,
      refundable: 1000,
    })),
  })),
};
const query = {
  currentData: eligibility,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: () => undefined,
};
export const useGetRefundEligibilityQuery = () => query;
export const useGetAdjustmentEligibilityQuery = () => query;
export const refundDetail = {
  id: 'refund-1',
  studentId: 'student',
  studentName: 'Synthetic Student',
  studentGrNo: 1001,
  studentRollNo: 5,
  standardName: 'VIII',
  divisionName: 'A',
  boardName: 'Synthetic Board',
  educationMediumName: 'English',
  totalPaidAmount: 15000,
  status: 7,
  workflowVersion: 1,
  voucherNumber: 'SYNTHETIC-REFUND-001',
  originalReceiptNumber: 'SYNTHETIC-RECEIPT-001',
  refundPolicyName: 'Synthetic fee refund policy',
  calculatedAmount: 10829,
  approvedAmount: 10829,
  processedAmount: 10829,
  reversedAmount: 0,
  refundMethod: 'Bank Transfer (NEFT/RTGS/IMPS)',
  allowedPayoutMethods: [
    'Cash',
    'Cheque',
    'Demand Draft (DD)',
    'Bank Transfer (NEFT/RTGS/IMPS)',
    'UPI',
  ],
  lines: [{ amount: 10829 }],
  availableActions: [],
  settlements: [],
  submittedAt: '2026-10-24T10:00:00+05:30',
  creationTime: '2026-10-24T10:00:00+05:30',
  feeHeads: [
    {
      feeHeadId: 'FH1',
      feeHeadName: 'FH1',
      totalPaid: 15000,
      totalRefunded: 10829,
      items: [{ month: 'June 2026', total: 15000, paid: 15000, refundAmount: 10829, status: 1 }],
    },
  ],
};
const detailQuery = {
  currentData: refundDetail,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: () => undefined,
};
export const useGetFeeRefundByIdQuery = (id: string) => (id ? detailQuery : {});
const mutation = (body: any) => ({
  unwrap: async () => ({
    isAllowed: true,
    maximumAllowedAmount:
      body?.lines?.reduce((sum: number, line: any) => sum + line.amount, 0) ?? 0,
    requestedAmount: body?.lines?.reduce((sum: number, line: any) => sum + line.amount, 0) ?? 0,
    deductionAmount: 0,
    capAdjustment: 0,
    refundPolicyName: 'Synthetic refund policy',
    status: 2,
  }),
});
const hook = () => [mutation, { isLoading: false }];
export const useCreateFeeRefundMutation = hook;
export const useSubmitFeeRefundMutation = hook;
export const useUpdateFeeRefundMutation = hook;
export const usePreviewFeeRefundMutation = hook;
export const useLazyGetRefundEligibilityQuery = hook;
