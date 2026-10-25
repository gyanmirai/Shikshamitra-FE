export const useGetReconciliationListQuery = () => {};
export const useRejectReconciliationMutation = () => {};
export const useApproveReconciliationMutation = () => {};
export const useDownloadReconciliationReceiptPdfMutation = () => {};
const common = {
  board: 'CBSE',
  medium: 'English',
  class: '8',
  division: 'A',
  amount: 2500,
  paymentMethod: 2,
  status: 0,
  receiptDate: '2026-10-24',
  remarks: 'Synthetic data',
};
const items = [
  {
    ...common,
    id: 'entered',
    studentName: 'Distinct entered dates',
    grNumber: 101,
    paymentDate: '2026-10-23T12:00:00+05:30',
    instrumentDetails: {
      ddNumber: '123456',
      issuingBankName: 'School bank',
      ddDate: '2026-10-10',
      paymentDate: '2026-10-15',
    },
  },
  {
    ...common,
    id: 'legacy',
    studentName: 'Missing issue date',
    grNumber: 102,
    paymentDate: '2026-10-20T12:00:00+05:30',
    instrumentDetails: {
      ddNumber: '123457',
      issuingBankName: 'School bank',
      ddDate: null,
    },
  },
  {
    ...common,
    id: 'missing',
    studentName: 'Missing both dates',
    grNumber: 103,
    paymentDate: null,
    instrumentDetails: { ddNumber: '123458', issuingBankName: 'School bank', ddDate: null },
  },
];
export default function useQueryAndMutation({ type }: { type: string }) {
  return type === 'query'
    ? { data: { items }, isLoading: false, isFetching: false }
    : [
        () => ({ unwrap: () => Promise.reject(new Error('Read-only fixture')) }),
        { isLoading: false },
      ];
}
