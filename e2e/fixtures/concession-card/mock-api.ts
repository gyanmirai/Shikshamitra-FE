const noop = () => ({ unwrap: async () => ({ refundRequests: [] }) });
export default function useQueryAndMutation() {
  return [noop, { isLoading: false }];
}
export const useCreateConcessionRefundRequestsMutation = () => [noop, { isLoading: false }];
export const useGetCurriculumFileByNameMutation = () => [noop, { isLoading: false }];
export const getCachedAuthSession = async () => null;
