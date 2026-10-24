export * from '../concession-card/mock-api';
const noop = () => undefined;
export const concessionManagementApi = {};
export const useGetConcessionApplicationsQuery = noop;
export const useCancelConcessionRequestMutation = noop;
export const useDeleteConcessionApplicationMutation = noop;
export const useGetConcessionApprovalContextQuery = () => ({});
export const useApproveConcessionRequestMutation = () => [noop, {}];
export const usePreviewConcessionApprovalMutation = () => [noop, {}];
const filters = {
  boards: [{ id: 'board', name: 'CBSE' }],
  mediums: [{ id: 'medium', name: 'English' }],
  selectedBoard: 'board', selectedMedium: 'medium',
  selectedStandardId: 'All Classes', selectedDivisionId: 'All Divisions',
  isReady: true,
  classOptions: [{ id: 'All Classes', name: 'All Classes' }],
  divisionOptions: [{ id: 'All Divisions', name: 'All Divisions' }],
  isDivisionDisabled: true,
  filterPayload: { academicYearId: 'year', boardId: 'board', educationMediumId: 'medium' },
  setSelectedBoard: noop, setSelectedMedium: noop,
  setSelectedStandardId: noop, setSelectedDivisionId: noop, classesLoading: false,
};
export const useFinanceAcademicFilters = () => filters;
export default function useQueryAndMutation(options: any): any {
  if (options.type === 'mutation') return [noop, {}];
  const status = options.params.tab === 'approved' ? 1 : options.params.tab === 'rejected' ? 2 : 6;
  return { isLoading: false, isFetching: false, refetch: noop, data: {
    draftCount: 1, pendingCount: 0, approvedCount: 1, rejectedCount: 1, totalCount: 1,
    items: [{ id: 'synthetic-request', studentId: 'synthetic-student',
      studentName: 'Aanya Example', grNumber: '10260', rollNo: '2',
      standardName: 'Class 1', divisionName: 'A', concessionTypeName: 'Sibling Tuition Concession',
      concessionAmount: 275, createdAt: '2026-10-15T11:13:33Z', status,
      requesterId: 'maker', availableActions: [],
    }],
  } };
}
