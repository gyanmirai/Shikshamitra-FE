import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

import type {
  SeatingValidationDto,
  GuidedSeatingDraftDto,
  SeatingPlanWorkspaceDto,
  GuidedAllocationPreviewDto,
  ExaminationSeatingReadinessDto,
} from './seat-allocation-v2.types';

export const guidedSeatAllocationApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getSeatingPlanWorkspace: builder.query<
      SeatingPlanWorkspaceDto,
      { examId: string; seatingPlanId?: string }
    >({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/v2/workspace`,
        method: 'GET',
        params: seatingPlanId ? { seatingPlanId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),
    prepareSeatingPlan: builder.mutation<
      SeatingPlanWorkspaceDto,
      { examId: string; body: { name?: string; examSubjectIds: string[] } }
    >({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/v2/plans`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
    updateSeatingPlanSubjects: builder.mutation<
      unknown,
      {
        examId: string;
        body: {
          seatingPlanId: string;
          name: string;
          scopeType: 1 | 2;
          examSubjectIds: string[];
          resetAllocationsWhenSubjectsChange: boolean;
        };
      }
    >({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/scopes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
    deleteGuidedSeatingPlan: builder.mutation<void, { examId: string; seatingPlanId: string }>({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/scopes/${seatingPlanId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
    resetExaminationSeatingDraft: builder.mutation<
      SeatingPlanWorkspaceDto,
      { examId: string; reason: string }
    >({
      query: ({ examId, reason }) => ({
        url: `/academics/exams/${examId}/seating-plan/v2/reset-draft`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
    saveGuidedSeatingDraft: builder.mutation<
      GuidedSeatingDraftDto,
      { examId: string; body: Record<string, unknown> }
    >({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
    previewGuidedSeatAllocation: builder.mutation<
      GuidedAllocationPreviewDto,
      { examId: string; body: Record<string, unknown> }
    >({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/auto-allocate`,
        method: 'POST',
        body,
      }),
    }),
    applyGuidedSeatAllocation: builder.mutation<
      GuidedSeatingDraftDto,
      { examId: string; body: Record<string, unknown> }
    >({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/v2/apply-preview`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
    validateGuidedSeatingPlan: builder.mutation<
      SeatingValidationDto,
      { examId: string; seatingPlanId: string }
    >({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/validate`,
        method: 'POST',
        params: { seatingPlanId },
      }),
    }),
    validateExaminationSeating: builder.mutation<
      ExaminationSeatingReadinessDto,
      { examId: string }
    >({
      query: ({ examId }) => ({
        url: `/academics/exams/${examId}/seating-plan/v2/validate-examination`,
        method: 'POST',
      }),
    }),
    publishExaminationSeating: builder.mutation<
      SeatingPlanWorkspaceDto,
      { examId: string; body: Record<string, unknown> }
    >({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/v2/publish`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSeatingPlanWorkspaceQuery,
  usePrepareSeatingPlanMutation,
  useUpdateSeatingPlanSubjectsMutation,
  useDeleteGuidedSeatingPlanMutation,
  useResetExaminationSeatingDraftMutation,
  useSaveGuidedSeatingDraftMutation,
  usePreviewGuidedSeatAllocationMutation,
  useApplyGuidedSeatAllocationMutation,
  useValidateGuidedSeatingPlanMutation,
  useValidateExaminationSeatingMutation,
  usePublishExaminationSeatingMutation,
} = guidedSeatAllocationApi;
