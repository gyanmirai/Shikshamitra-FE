// Synthetic activity for browser smoke checks; never contacts a live API.
export const useGetBankAccountActivityQuery = ({ bankAccountId, query }: any) => ({
  currentData: {
    account: { id: bankAccountId, bankName: 'QA Bank 10 बैंक & Co', maskedAccountNumber: '**0001', isActive: true },
    academicYearId: query.academicYearId, academicYearName: '2026–2027',
    coverage: { income: true, expense: true, cash: true, scopeLimited: false, message: 'Synthetic activity' },
    capabilities: { canAddIncome: false, canAddExpense: false, canDepositCash: false },
    summary: { incoming: 100, outgoing: 0, net: 100, pendingIncoming: 0, inTransit: 0 },
    methodBreakdown: [], categories: [], items: [], totalCount: 0,
  },
  isFetching: false, isError: false, refetch: () => {},
});
export const useGetBankAccountDepositsQuery = useGetBankAccountActivityQuery;
export const useGetBankAccountActivityDetailQuery = () => ({ isFetching: false, isError: false });
export const useExportBankAccountActivityMutation = () => [() => ({ unwrap: async () => new Blob() }), { isLoading: false }];
