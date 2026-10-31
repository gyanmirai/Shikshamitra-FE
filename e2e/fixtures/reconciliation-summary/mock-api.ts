const counts = {
  chequePending: 0, chequeApproved: 0, chequeRejected: 0,
  demandDraftPending: 0, demandDraftApproved: 0, demandDraftRejected: 0,
  bankTransferPending: 0, bankTransferApproved: 0, bankTransferRejected: 0,
  creditCardPending: 2, creditCardApproved: 3, creditCardRejected: 1,
  debitCardPending: 2, debitCardApproved: 3, debitCardRejected: 1,
  upiPending: 4, upiApproved: 1, upiRejected: 2,
};

const common = {
  board: 'CBSE', medium: 'English', class: '8', division: 'A', amount: 1250,
  receiptDate: '2026-10-26', remarks: 'Synthetic read-only evidence',
};

function cardRows(method: number) {
  return [0, 0, 1, 1, 1, 2].map((status, index) => ({
    ...common,
    id: `card-${method}-${index}`, studentName: index === 5 ? 'Historical missing evidence' : `Synthetic card ${index + 1}`,
    grNumber: 101 + index, status, paymentMethod: method,
    paymentMethodLabel: method === 4 ? 'Credit Card' : 'Debit Card',
    statusLabel: ['Pending', 'Approved', 'Rejected'][status],
    receiptNumber: `QA-CARD-${index + 1}`,
    instrumentDetails: index === 5 ? {} : {
      cardHolderName: 'Synthetic Card Holder', cardLast4: '0123',
      transactionId: `SYNTHETIC-CARD-${index + 1}`, transactionDate: '2026-10-25',
    },
  }));
}

const upiRows = [0, 0, 0, 0, 1, 2, 2].map((status, index) => ({
  ...common, id: `upi-${index}`, studentName: `Synthetic UPI ${index + 1}`, grNumber: 201 + index,
  status, paymentMethod: 6, paymentMethodLabel: 'UPI',
  statusLabel: ['Pending', 'Approved', 'Rejected'][status], receiptNumber: `QA-UPI-${index + 1}`,
  instrumentDetails: { upiTransactionId: `SYNTHETIC-UPI-${index + 1}`, upiId: 'synthetic@example', appName: 'UPI' },
}));

export function useGetReconciliationTabCountsQuery() {
  return { data: counts, isLoading: false, isFetching: false };
}

export function useGetReconciliationListQuery(params?: { paymentMethod?: number | string }) {
  const method = Number(params?.paymentMethod);
  const items = method === 4 || method === 5 ? cardRows(method) : method === 6 ? upiRows : [];
  return { data: { items, totalCount: items.length }, isLoading: false, isFetching: false };
}

function readOnlyMutation() {
  return [() => ({ unwrap: () => Promise.reject(new Error('Read-only fixture')) }), { isLoading: false }];
}
export const useRejectReconciliationMutation = readOnlyMutation;
export const useApproveReconciliationMutation = readOnlyMutation;
export const useDownloadReconciliationReceiptPdfMutation = readOnlyMutation;

export default function useQueryAndMutation({ currentQueryAndMutation, params, options }: {
  currentQueryAndMutation: (params?: unknown, options?: unknown) => unknown;
  params?: unknown; options?: unknown;
}) {
  return currentQueryAndMutation(params, options);
}
