import { approvalContext } from './data';

export const useGetConcessionApprovalContextQuery = () => ({
  data: approvalContext,
  isLoading: false,
  isError: false,
  refetch: () => undefined,
});
const preview = () => ({
  unwrap: async () => ({
    totalApprovedAmount: 400,
    refundRequestAmount: 0,
    autoCreateRefund: true,
  }),
});
const approve = () => ({ unwrap: async () => ({ refundRequests: [] }) });
export const usePreviewConcessionApprovalMutation = () => [preview, { isLoading: false }];
export const useApproveConcessionRequestMutation = () => [approve, { isLoading: false }];
