import { useState } from 'react';
import { request, context } from './detail-data';

const noop = () => ({ unwrap: async () => ({ refundRequests: [] }) });
export default function useQueryAndMutation() {
  return [noop, { isLoading: false }];
}
export const useCreateConcessionRefundRequestsMutation = () => [noop, { isLoading: false }];
export const useGetCurriculumFileByNameMutation = () => [noop, { isLoading: false }];
export const getCachedAuthSession = async () => null;
export const getAuthSessionCacheRevision = () => 0;
export const isAuthSessionCacheCurrent = () => true;

function response(kind: 'details' | 'breakdown', data: unknown) {
  const [retried, setRetried] = useState(false);
  const params = new URLSearchParams(window.location.search);
  const isError = !retried && params.get('fail') === kind;
  const isLoading = params.get('loading') === 'true';
  return {
    currentData: isError || isLoading ? undefined : data,
    isError,
    isLoading,
    isFetching: isLoading,
    refetch: () => setRetried(true),
  };
}
export function useGetConcessionRequestByIdQuery({
  concessionRequestId,
}: {
  concessionRequestId: string;
}) {
  const status = Number(new URLSearchParams(window.location.search).get('status') ?? 6);
  const data = {
    ...request,
    concessionRequestId,
    status,
    statusName: [
      'Pending',
      'Approved',
      'Rejected',
      'Cancelled',
      'PartiallyReversed',
      'Reversed',
      'Draft',
    ][status],
    totalApprovedConcessionAmount: [1, 4, 5].includes(status) ? 14500 : 0,
    totalReversedConcessionAmount: status === 5 ? 14500 : status === 4 ? 5000 : 0,
    netApprovedConcessionAmount:
      status === 5 ? 0 : status === 4 ? 9500 : [1].includes(status) ? 14500 : 0,
    requiredDocuments: request.requiredDocuments.map((doc) => ({
      ...doc,
      url: '/certificate.svg',
    })),
    submittedDocuments: request.submittedDocuments.map((doc) => ({
      ...doc,
      url: '/certificate.svg',
    })),
  };
  return response('details', { success: true, data });
}
export function useGetConcessionApprovalContextQuery(concessionRequestId: string) {
  const status = Number(new URLSearchParams(window.location.search).get('status') ?? 6);
  const data = structuredClone(context);
  data.concessionRequestId = concessionRequestId;
  data.feeHeadGroups.forEach((group) =>
    group.dueFeeLines.forEach((line) => {
      line.suggestedConcessionAmount = line.appliedConcessionAmount;
      if (![1, 4, 5].includes(status)) line.appliedConcessionAmount = 0;
      line.reversedConcessionAmount =
        status === 5
          ? line.appliedConcessionAmount
          : status === 4 && line.dueFeeId === 'nov'
            ? 5000
            : 0;
      line.reversibleConcessionAmount =
        line.appliedConcessionAmount - line.reversedConcessionAmount;
    })
  );
  return response('breakdown', data);
}
