const mutation = () => [() => ({ unwrap: async () => ({}) }), { isLoading: false }];
export const useCreateCollectionPolicyMutation = mutation;
export const useUpdateCollectionPolicyMutation = mutation;
export const useGetCollectionPoliciesQuery = () => ({ data: { items: [] } });
export const useGetActiveFeeHeadsQuery = () => ({ data: [{ id: 'tuition', name: 'Tuition', feeHeadName: 'Tuition' }] });
export const useGetFinanceRoutingOptionsQuery = () => ({ data: { incomeCategories: [{ id: 'late-income', label: 'Late fee income' }] }, isFetching: false, isError: false });
