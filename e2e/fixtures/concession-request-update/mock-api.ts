import type { ConcessionBenefitBlocker } from 'src/redux/finance/ConcessionManagement/types';
import { context, detail, preview } from './data';

export const scenarios = [
  'valid',
  'stale',
  'approved',
  'policy',
  'eligibility',
  'unknown',
  'approved-benefit',
  'pending-benefit',
  'partial-benefit',
  'self-request',
  'rejected-history',
  'cancelled-history',
  'reversed-history',
  'other-year',
  'other-type',
  'policy-bypass',
  'approval-duplicate',
  'approval-self',
  'reject-duplicate',
] as const;
export type Scenario = (typeof scenarios)[number];
export const isNewFormScenario = (value: Scenario) =>
  [
    'approved-benefit',
    'pending-benefit',
    'partial-benefit',
    'rejected-history',
    'cancelled-history',
    'reversed-history',
    'other-year',
    'other-type',
    'policy-bypass',
  ].includes(value);
export let scenario: Scenario = 'valid';
export const commands: { action: string; body: unknown }[] = [];
const contextCache = new Map<string, any>();
const approvalCache = new Map<string, any>();
export const configure = (value: Scenario) => {
  scenario = value;
  commands.length = 0;
  contextCache.clear();
  approvalCache.clear();
};
const notify = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('fixture-command'));
};
const errorCodes: Partial<Record<Scenario, string>> = {
  stale: 'Finance:Concession:030003',
  approved: 'Finance:Concession:010033',
  policy: 'Finance:ConcessionPolicy:010012',
  eligibility: 'Finance:Concession:020006',
  unknown: 'Finance:Concession:0030003',
};
const approvedMessage =
  'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.';
const pendingMessage =
  'A pending concession request already exists for this concession type in this academic year. Review the existing request.';
const getBlocker = (requestId?: string, typeId = 'type'): ConcessionBenefitBlocker | null => {
  const pending =
    scenario === 'pending-benefit' || scenario === 'self-request' || scenario === 'approval-self';
  const approved =
    [
      'approved-benefit',
      'partial-benefit',
      'approval-duplicate',
      'reject-duplicate',
      'policy-bypass',
    ].includes(scenario) ||
    (scenario === 'other-type' && typeId === 'other');
  if ((!pending && !approved) || (typeId !== 'type' && scenario !== 'other-type')) return null;
  const blockingRequestId =
    scenario === 'self-request'
      ? 'request'
      : scenario === 'approval-self'
        ? 'pending-1000'
        : pending
          ? 'pending-other'
          : 'approved-200';
  if (requestId === blockingRequestId) return null;
  return {
    code: pending ? 'Finance:Concession:010010' : 'Finance:Concession:010034',
    message: pending ? pendingMessage : approvedMessage,
    blockingRequestId,
    blockingStatus: pending
      ? 'Pending'
      : scenario === 'partial-benefit'
        ? 'PartiallyReversed'
        : 'Approved',
  };
};
const throwBlocker = (blocker: ConcessionBenefitBlocker) => {
  throw Object.assign(new Error(blocker.message), {
    status: 403,
    data: {
      errorCode: blocker.code,
      detail: blocker.message,
      traceId: `local-${scenario}-reference`,
    },
  });
};
const update = (body: any) => ({
  unwrap: async () => {
    commands.push({ action: 'update', body });
    notify();
    const blocker = getBlocker(body.concessionRequestId, body.concessionTypeId);
    if (blocker) throwBlocker(blocker);
    if (errorCodes[scenario])
      throw Object.assign(new Error('One or more business rules were violated.'), {
        status: 403,
        data: {
          errorCode: errorCodes[scenario],
          detail: 'One or more business rules were violated.',
          traceId: `local-${scenario}-reference`,
          data: scenario === 'approved' ? { Status: 'Approved' } : {},
        },
      });
    if (body.concurrencyStamp !== 'opened-stamp')
      throw new Error('The form did not send its reviewed stamp.');
    return { data: { ...detail, concurrencyStamp: 'saved-stamp' } };
  },
});
const submit = (body: any) => ({
  unwrap: async () => {
    commands.push({ action: 'submit', body });
    notify();
    const blocker = getBlocker(body.concessionRequestId);
    if (blocker) throwBlocker(blocker);
    if (body.concurrencyStamp !== 'saved-stamp')
      throw new Error('The form did not send the saved stamp.');
    return { data: { ...detail, status: 0, concurrencyStamp: 'submitted-stamp' } };
  },
});
const create = (action: string) => (body: any) => ({
  unwrap: async () => {
    commands.push({ action, body });
    notify();
    const blocker = getBlocker(undefined, body.concessionTypeId);
    if (blocker) throwBlocker(blocker);
    return {
      data: {
        ...detail,
        status: action === 'create-submit' ? 0 : 6,
        concurrencyStamp: 'created-stamp',
      },
    };
  },
});
const refetch = () => ({
  unwrap: async () => ({ data: { ...detail, concurrencyStamp: 'newest-unreviewed-stamp' } }),
});
const query = { data: { data: detail }, isLoading: false, isFetching: false, refetch };
const getClass = () => undefined;
const previewRequest = (body: any) => ({
  unwrap: async () => {
    const blocker = getBlocker(body.requestId, body.concessionTypeId);
    if (blocker) throwBlocker(blocker);
    return preview;
  },
});
const classes = [{ id: 'class', name: 'Class 10', divisions: [{ id: 'division', name: 'A' }] }];
const students = [{ id: 'student', studentId: 'student', studentName: 'Synthetic student' }];
export const useGetConcessionRequestByIdQuery = () => query;
export const useUpdateConcessionRequestMutation = () => [update, { isLoading: false }];
export const useSubmitConcessionRequestMutation = () => [submit, { isLoading: false }];
const createRequest = create('create-submit');
const createDraft = create('create-draft');
export const useCreateConcessionRequestMutation = () => [createRequest, { isLoading: false }];
export const useCreateConcessionDraftMutation = () => [createDraft, { isLoading: false }];
export const usePreviewConcessionRequestMutation = () => [previewRequest, { isLoading: false }];
export const useGetConcessionRequestContextQuery = (params: any) => {
  const key = `${scenario}:${params.requestId || ''}`;
  if (!contextCache.has(key))
    contextCache.set(key, {
      data: {
        ...context,
        concessionPolicies:
          scenario === 'policy-bypass'
            ? [
                context.concessionPolicies[0],
                {
                  ...context.concessionPolicies[0],
                  concessionPolicyId: 'alternative-policy',
                  concessionPolicyVersionId: 'alternative-version',
                  policyName: 'Alternative fixed concession',
                },
              ]
            : context.concessionPolicies,
        concessionTypes: [
          { ...context.concessionTypes[0], benefitBlocker: getBlocker(params.requestId, 'type') },
          {
            concessionTypeId: 'other',
            name: 'Other concession',
            documents: [],
            benefitBlocker: getBlocker(params.requestId, 'other'),
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      refetch: () => undefined,
    });
  return contextCache.get(key);
};

export const useGetConcessionApprovalContextQuery = (requestId: string) => {
  const key = `${scenario}:${requestId}`;
  if (!approvalCache.has(key))
    approvalCache.set(key, {
      data: {
        concessionRequestId: requestId,
        concessionPolicyName: 'Fixed concession',
        concessionPolicyVersion: 1,
        requestConcurrencyStamp: 'pending-stamp',
        previewFingerprint: 'approval-fingerprint',
        totalRequestedConcessionAmount: 1000,
        benefitBlocker: getBlocker(requestId),
        feeHeadGroups: detail.feeHeadConcessions.map((head, index) => ({
          feeHeadId: head.feeHeadId,
          feeHeadName: head.feeHeadName,
          requestedConcessionAmount: index === 0 ? 987.82 : 12.18,
          hasChangedSinceSubmission: false,
          dueFeeLines: [
            {
              ...context.eligibleDueFees[index],
              monthLabel: 'Annual',
              suggestedConcessionAmount: index === 0 ? 987.82 : 12.18,
            },
          ],
        })),
      },
      isLoading: false,
      isError: false,
      refetch: () => undefined,
    });
  return approvalCache.get(key);
};
const previewApproval = (body: any) => ({
  unwrap: async () => {
    commands.push({ action: 'approval-preview', body });
    notify();
    const blocker = getBlocker(body.concessionRequestId);
    if (blocker) throwBlocker(blocker);
    return { totalApprovedAmount: 1000, refundRequestAmount: 0, autoCreateRefund: false };
  },
});
const approve = (body: any) => ({
  unwrap: async () => {
    commands.push({ action: 'approve', body });
    notify();
    const blocker = getBlocker(body.studentConcessionTypeRequestId);
    if (blocker) throwBlocker(blocker);
    return { refundRequests: [] };
  },
});
const reject = (body: any) => ({
  unwrap: async () => {
    commands.push({ action: 'reject', body });
    notify();
    return {};
  },
});
export const usePreviewConcessionApprovalMutation = () => [previewApproval, { isLoading: false }];
export const useApproveConcessionRequestMutation = () => [approve, { isLoading: false }];
export const useRejectConcessionRequestMutation = () => [reject, { isLoading: false }];
export const useGetStudentsByScopeQuery = () => ({
  currentData: students,
  isLoading: false,
  isFetching: false,
});
export const useLazyGetClassByMediumQuery = () => [getClass, { data: classes, isLoading: false }];
export const useGetConcessionTypeByIdQuery = () => ({ isLoading: false });
export const useUploadConcessionDocumentFileMutation = () => [update, { isLoading: false }];
