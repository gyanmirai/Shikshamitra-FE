const liveApi =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('liveApi');
const liveApiRoot = 'http://127.0.0.1:4237';
async function callLiveApi(path: string, body?: unknown) {
  const response = await fetch(`${liveApiRoot}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const result = await response.json();
  if (!response.ok)
    throw Object.assign(new Error('Local refund API request failed'), {
      status: response.status,
      data: result,
    });
  return result;
}
let liveContext: any;
export const getLiveContext = () => liveContext;
const eligibility = {
  totalPaid: 6000,
  totalRefundable: 6000,
  allowPartialRefund: false,
  allowedPayoutMethods: ['Cash'],
  defaultExpenseCategoryId: 'synthetic-expense',
  defaultPayingBankAccountId: 'synthetic-bank',
  feeHeads: ['FH1', 'FH2'].map((feeHeadId) => ({
    feeHeadId,
    feeHeadName: feeHeadId,
    months: [6, 7, 8].map((month) => ({
      month,
      year: 2026,
      dueFeeId: `${feeHeadId}-${month}`,
      sourceAllocationId: `${feeHeadId}-allocation-${month}`,
      sourceReceiptId: `receipt-${month}`,
      receiptNumber: `SYNTHETIC-00${month}`,
      total: 1000,
      paid: 1000,
      refunded: 0,
      refundable: 1000,
    })),
  })),
};
// Exercise the production refund form's three source types independently of API tests.
if (
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('paidSources')
) {
  const mixedPayers = new URLSearchParams(window.location.search).has('mixedPayers');
  const paidSource = (source: Record<string, unknown>, amount: number) => ({
    month: 6,
    year: 2026,
    dueFeeId: null,
    sourceReceiptId: 'receipt-paid-sources',
    receiptNumber: 'SYNTHETIC-PAID-SOURCES',
    total: amount,
    paid: amount,
    refunded: 0,
    refundable: amount,
    ...source,
  });
  Object.assign(eligibility, {
    totalPaid: 1750,
    totalRefundable: 1750,
    refundPolicyName: 'Paid source refund policy',
    receipts: mixedPayers
      ? [
          { receiptId: 'receipt-legacy', financeFeeAccountId: null },
          { receiptId: 'receipt-account-charge', financeFeeAccountId: 'student-account' },
          { receiptId: 'receipt-account-late', financeFeeAccountId: 'student-account' },
        ]
      : [{ receiptId: 'receipt-paid-sources', financeFeeAccountId: 'student-account' }],
    feeHeads: [
      {
        feeHeadId: 'tuition',
        feeHeadName: 'Tuition',
        months: [
          paidSource(
            {
              dueFeeId: 'tuition-due',
              sourceAllocationId: 'tuition-allocation',
              ...(mixedPayers ? { sourceReceiptId: 'receipt-legacy' } : {}),
            },
            1000
          ),
        ],
      },
      {
        feeHeadId: null,
        feeHeadName: 'Paid charges',
        months: [
          paidSource(
            {
              chargeId: 'paid-charge',
              chargeName: 'Activity charge',
              sourceAllocationId: 'charge-allocation',
              ...(mixedPayers ? { sourceReceiptId: 'receipt-account-charge' } : {}),
            },
            500
          ),
        ],
      },
      {
        feeHeadId: null,
        feeHeadName: 'Paid late fees',
        months: [
          paidSource(
            {
              lateFeeDueFeeId: 'late-fee-due',
              sourceAllocationId: 'late-fee-allocation',
              ...(mixedPayers ? { sourceReceiptId: 'receipt-account-late' } : {}),
            },
            250
          ),
        ],
      },
    ],
  });
}
const query = {
  currentData: eligibility,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: () => undefined,
};
export const useGetRefundEligibilityQuery = () => query;
const routingQuery = {
  currentData: {
    expenseCategories: [
      {
        id: liveContext?.expenseCategoryId ?? 'synthetic-expense',
        label: 'Synthetic refund expense',
      },
    ],
    bankAccounts: [{ id: 'synthetic-bank', label: 'Synthetic school cash routing account' }],
  },
  isLoading: false,
  isFetching: false,
  isError: false,
  isUninitialized: false,
  refetch: () => undefined,
};
export const useGetFinanceRoutingOptionsQuery = () => routingQuery;
export async function initializeLiveContext() {
  if (!liveApi) return;
  liveContext = await callLiveApi('/seed', {});
  Object.assign(eligibility, liveContext.eligibility, {
    defaultExpenseCategoryId: liveContext.expenseCategoryId,
  });
  routingQuery.currentData.expenseCategories = [
    {
      id: liveContext.expenseCategoryId,
      label: 'Synthetic refund expense',
    },
  ];
}
if (
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).has('missingRoutingDefaults')
) {
  eligibility.defaultExpenseCategoryId = '';
  eligibility.defaultPayingBankAccountId = '';
}
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
  sourceReceipts: [
    { receiptId: 'receipt-6', receiptNumber: 'SYNTHETIC-006' },
    { receiptId: 'receipt-7', receiptNumber: 'SYNTHETIC-007' },
  ],
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
if (
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('view') === 'approved'
) {
  Object.assign(refundDetail, {
    status: 2,
    totalAmount: 3750,
    calculatedAmount: 3750,
    approvedAmount: 3750,
    processedAmount: 0,
    reversedAmount: 0,
    totalRefundedAmount: 50000,
    refundMethod: 'Cash',
    availableActions: ['reject', 'recordPayout'],
    lines: [{ amount: 3750, calculatedAmount: 3750, approvedAmount: 3750 }],
    feeHeads: [
      {
        feeHeadId: 'tuition',
        feeHeadName: 'General Tuition Fee',
        totalPaid: 25000,
        totalRefunded: 20000,
        items: [{ month: 'July', total: 10000, paid: 12500, refundAmount: 0, status: 2 }],
      },
      {
        feeHeadId: 'school',
        feeHeadName: 'General School Fees',
        totalPaid: 37500,
        totalRefunded: 30000,
        items: [
          { month: 'July', total: 15000, paid: 18750, refundAmount: 0, status: 2 },
          { month: 'December', total: 15000, paid: 18750, refundAmount: 3750, status: 2 },
        ],
      },
    ],
  });
}
const detailQuery = {
  currentData: refundDetail,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: () => undefined,
};
export const useGetFeeRefundByIdQuery = (id: string) => (id ? detailQuery : {});
export const useGetFeeRefundsQuery = ({ status = 0 }: { status?: number }) => {
  const result = {
    totalCount: 1,
    items: [
      {
        ...refundDetail,
        status,
        availableActions: ['edit', 'approve', 'reject', 'recordPayout', 'createReplacement'],
      },
    ],
  };
  return { data: result, currentData: result, isLoading: false, isFetching: false, isError: false };
};
const mutation = (body: any) => ({
  unwrap: async () => ({
    isAllowed: true,
    maximumAllowedAmount:
      body?.lines?.reduce((sum: number, line: any) => sum + line.amount, 0) ?? 0,
    requestedAmount: body?.lines?.reduce((sum: number, line: any) => sum + line.amount, 0) ?? 0,
    deductionAmount: 0,
    capAdjustment: 0,
    refundPolicyName: 'Synthetic refund policy',
    status: body?.refundMethod === 'Cash' ? 7 : 2,
  }),
});
const hook = () => [mutation, { isLoading: false }];
let submittedRefund: unknown;
let savedRefund: unknown;
export const getSubmittedRefund = () => submittedRefund;
export const getSavedRefund = () => savedRefund;
export const useCreateFeeRefundMutation = () => [
  (body: unknown) => {
    submittedRefund = body;
    if (liveApi)
      return {
        unwrap: async () => {
          const created = await callLiveApi('/api/fee-refunds', body);
          savedRefund = await callLiveApi(`/api/fee-refunds/${created.id}`);
          return created;
        },
      };
    return mutation(body);
  },
  { isLoading: false },
];
export const useSubmitFeeRefundMutation = hook;
export const useUpdateFeeRefundMutation = hook;
export const usePreviewFeeRefundMutation = () => [
  (body: unknown) =>
    liveApi ? { unwrap: () => callLiveApi('/api/fee-refunds/preview', body) } : mutation(body),
  { isLoading: false },
];
export const useLazyGetRefundEligibilityQuery = hook;
export const useDownloadRefundReceiptPdfMutation = () => [
  () => ({
    unwrap: async () => {
      throw new Error('No synthetic receipt PDF');
    },
  }),
  { isLoading: false },
];
