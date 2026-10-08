import { useCallback } from 'react';

export const usage = { paymentTermId: 'monthly', feeHeadCount: 2, feeStructureCount: 2, classCount: 2, assignments: [
  { classId: 'class3', className: 'Class 3', feeStructureId: 'fs1', feeStructureName: 'FS 1', feeHeadId: 'school', feeHeadName: 'School Fees', versionId: 'v1', versionNumber: 1 },
  { classId: 'class5', className: 'Class 5', feeStructureId: 'fs2', feeStructureName: 'FS 2', feeHeadId: 'transport', feeHeadName: 'Transport Fees', versionId: 'v2', versionNumber: 2 },
] };
export const impact = { currentDefaultId: 'half-yearly', currentDefaultName: 'Half-Yearly', currentDefaultVersionNumber: 2, currentDefaultUsage: usage, replacesExistingDefault: true, assignmentNote: 'Existing fee structures keep their assigned term. The new default applies only to new fee head assignments.' };
export const detail = { id: 'monthly', academicYearId: 'year', boardId: 'board', name: 'monthly', code: 'PT-MONTHLY', status: 'Active', isDefault: false, isUsedInFeeStructures: true, canDirectEdit: false, currentVersionId: 'v1', holidayShiftingMethod: 'None', demandGenerationRule: 'OnDueDate', initialDemandStatus: 'Published', versions: [{ id: 'v1', versionNumber: 1, status: 'Published', holidayShiftingMethod: 'None', demandGenerationRule: 'OnDueDate', installments: [{ id: 'inst', sequence: 1, name: 'Annual', coverageStartDate: '2026-06-01', coverageEndDate: '2027-05-31', dueDate: '2027-05-31', demandDate: '2027-05-31', allocationPercentage: 100, demandEnabled: true }] }] };
const boardsResult = { data: { items: [{ id: 'board', name: 'CBSE', academicYearId: 'year', startDate: '2026-06-01', endDate: '2027-05-31' }] } };
export const useGetBoardsQuery = () => boardsResult;
export const useGetPaymentTermUsageQuery = () => ({ currentData: usage });
export const useGetPaymentTermDefaultImpactQuery = () => ({ currentData: impact, isFetching: false, isError: false });
export const useLazyGetPaymentTermDefaultImpactQuery = () => [useCallback(() => ({ unwrap: async () => impact }), [])];
export const useLazyGetPaymentTermByIdQuery = () => [useCallback(() => ({ unwrap: async () => detail }), []), { isFetching: false }];
const mutation = () => [useCallback((input: unknown) => ({ unwrap: async () => { (window as any).paymentTermWrites = [...((window as any).paymentTermWrites ?? []), input]; return detail; } }), []), { isLoading: false, isError: false }];
export const useCreateRevisionMutation = mutation;
export const useCreatePaymentTermMutation = mutation;
export const useUpdatePaymentTermDraftMutation = mutation;
export const usePreviewPaymentTermTemplateMutation = mutation;
