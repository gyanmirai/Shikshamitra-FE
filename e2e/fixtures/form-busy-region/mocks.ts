// Synthetic responses for the real concession form. Financial writes never reach a backend.
export const classes = [
  { id: 'class', name: 'Class 1', divisions: [{ id: 'division', name: 'A' }] },
];
const policy = {
  concessionPolicyId: 'policy',
  concessionPolicyVersionId: 'version',
  policyName: 'Sample policy',
  version: 1,
  valueSource: 'PolicyFixed',
  calculationMethod: 'Percentage',
  percentageValue: 10,
};
export const context = {
  studentFeeStructureId: 'assignment',
  concessionPolicies: [policy],
  concessionTypes: [{ concessionTypeId: 'type', name: 'Sibling discount', documents: [] }],
  feeHeads: [{ feeHeadId: 'tuition', feeHeadName: 'Tuition fee', eligibleOutstanding: 5000 }],
  eligibleDueFees: [],
};
export const detail = {
  data: {
    id: 'draft',
    studentId: 'student',
    studentName: 'Sample Student',
    boardId: 'board',
    boardName: 'CBSE',
    educationMediumId: 'medium',
    educationMediumName: 'English',
    standardId: 'class',
    standardName: 'Class 1',
    divisionId: 'division',
    divisionName: 'A',
    concessionPolicyId: 'policy',
    concessionPolicyVersionId: 'version',
    concessionTypeId: 'type',
    feeHeadConcessions: [{ feeHeadId: 'tuition', amount: 10, basedOn: 1, netAmount: 4500 }],
    submittedDocuments: [],
  },
};
const preview = {
  previewFingerprint: 'preview',
  concessionPolicyName: 'Sample policy',
  totalEligibleBase: 5000,
  totalConcessionAmount: 500,
  netPayable: 4500,
  feeHeadConcessions: [{ feeHeadId: 'tuition', discountAmount: 500, netAmount: 4500 }],
};
const trigger = () => ({ unwrap: async () => preview });
const blocked = () => {
  throw new Error('Financial writes forbidden in this fixture');
};
const query = {
  data: detail,
  isLoading: false,
  isFetching: false,
  refetch: () => ({ unwrap: async () => detail }),
};
export const useGetConcessionRequestByIdQuery = () => query;
export const useGetConcessionRequestContextQuery = () => ({
  data: context,
  isLoading: false,
  isFetching: false,
  isError: false,
  refetch: () => {},
});
export const usePreviewConcessionRequestMutation = () => [trigger, {}];
export const useCreateConcessionDraftMutation = () => [blocked, {}];
export const useSubmitConcessionRequestMutation = () => [blocked, {}];
export const useUpdateConcessionRequestMutation = () => [blocked, {}];
export const useCreateConcessionRequestMutation = () => [blocked, {}];
export const useGetConcessionTypeByIdQuery = () => ({ data: { documents: [] } });
export const useUploadConcessionDocumentsMutation = () => [blocked, {}];
export const useUploadConcessionDocumentFileMutation = () => [blocked, {}];
const classTrigger = () => ({ unwrap: async () => classes });
export const useLazyGetClassByMediumQuery = () => [classTrigger, { data: classes }];
export const useGetStudentsByScopeQuery = () => ({ data: [] });
const session = { data: { profile: { role: 'admin' } }, status: 'authenticated' };
export const useSession = () => session;
export const useRouter = () => ({ push: () => {} });
export default function useQueryAndMutation(opts: any) {
  return opts.currentQueryAndMutation();
}

export const getSession = async () => session.data;
export const signIn = () => {};
export const signOut = () => {};
