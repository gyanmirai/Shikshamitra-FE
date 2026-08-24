import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const seatAllocationApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Seat Layout (Drag & Drop)
    // GET /api/academics/exams/{examId}/seat-layout
    getSeatLayout: builder.query({
      query: ({ examId, divisionId, roomId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seat-layout`,
        method: 'GET',
        params: {
          DivisionId: divisionId,
          RoomId: roomId,
          ...(seatingPlanId ? { SeatingPlanId: seatingPlanId } : {}),
        },
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Save Seating Plan (Bulk)
    // POST /api/academics/exams/{examId}/seat-allocation/save
    saveSeatAllocation: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seat-allocation/save`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Get Divisions for Exam
    // GET /api/academics/exams/{examId}/seat-allocation/students → SeatAllocationDivisionsResponseDto
    getExamDivisions: builder.query({
      query: ({ examId, standardId }) => ({
        url: `/academics/exams/${examId}/seat-allocation/students`,
        method: 'GET',
        params: standardId ? { StandardId: standardId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Get Rooms for Exam and Division
    getExamRooms: builder.query({
      query: ({ examId, divisionId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/divisions/${divisionId}/rooms`,
        method: 'GET',
        params: seatingPlanId ? { SeatingPlanId: seatingPlanId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Get Seating Plan Dashboard Table
    // GET /api/academics/exams/seat-allocation → SeatAllocationDashboardResponseDto
    getSeatAllocationTableData: builder.query({
      query: ({ standardId }) => ({
        url: `/academics/exams/seat-allocation`,
        method: 'GET',
        params: { StandardId: standardId },
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Get Students for Seating Plan (per division)
    // GET /api/academics/exams/{examId}/seat-allocation/divisions/{divisionId}/students → SeatStudentPagedResponseDto
    getSeatAllocationStudents: builder.query({
      query: ({ examId, divisionId, standardId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seat-allocation/divisions/${divisionId}/students`,
        method: 'GET',
        params: {
          ...(standardId ? { StandardId: standardId } : {}),
          ...(seatingPlanId ? { SeatingPlanId: seatingPlanId } : {}),
        },
      }),
      providesTags: [academicType.seatAllocation],
    }),

    getSeatingPlanScopes: builder.query({
      query: ({ examId }) => ({
        url: `/academics/exams/${examId}/seating-plan/scopes`,
        method: 'GET',
      }),
      providesTags: [academicType.seatAllocation],
    }),

    saveSeatingPlanScope: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/scopes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Get Seating Plan Draft (plan-level state: rooms in scope, rules, status, single-source-of-truth counts)
    // GET /api/academics/exams/{examId}/seating-plan → SeatingPlanDraftResponseDto
    getSeatingPlanDraft: builder.query({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan`,
        method: 'GET',
        params: seatingPlanId ? { seatingPlanId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Save Seating Plan Draft
    // PUT /api/academics/exams/{examId}/seating-plan → SeatingPlanDraftResponseDto
    saveSeatingPlanDraft: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),
    saveSeatingPlanBulk: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/bulk-save`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Validate Seating Plan (capacity/conflict blockers + warnings)
    // POST /api/academics/exams/{examId}/seating-plan/validate → SeatingValidationResponseDto
    validateSeatingPlan: builder.mutation({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/validate`,
        method: 'POST',
        params: seatingPlanId ? { seatingPlanId } : undefined,
      }),
    }),

    // Multi-room utilization summary
    // GET /api/academics/exams/{examId}/seating-plan/room-summary → SeatingRoomSummaryResponseDto
    getSeatingRoomSummary: builder.query({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/room-summary`,
        method: 'GET',
        params: seatingPlanId ? { seatingPlanId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Finalize (lock) the seating plan
    // POST /api/academics/exams/{examId}/seating-plan/finalize → SeatingPlanDraftResponseDto
    finalizeSeatingPlan: builder.mutation({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/finalize`,
        method: 'POST',
        params: seatingPlanId ? { seatingPlanId } : undefined,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Publish a finalized seating plan
    // POST /api/academics/exams/{examId}/seating-plan/publish → SeatingPlanDraftResponseDto
    publishSeatingPlan: builder.mutation({
      query: ({ examId, body, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/publish`,
        method: 'POST',
        params: seatingPlanId ? { seatingPlanId } : undefined,
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Unlock a finalized seating plan (requires a reason)
    // POST /api/academics/exams/{examId}/seating-plan/unlock → SeatingPlanDraftResponseDto
    unlockSeatingPlan: builder.mutation({
      query: ({ examId, body, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/unlock`,
        method: 'POST',
        params: seatingPlanId ? { seatingPlanId } : undefined,
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Plan lifecycle audit history
    // GET /api/academics/exams/{examId}/seating-plan/audit-log → SeatingPlanAuditLogResponseDto
    getSeatingPlanAuditLog: builder.query({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/audit-log`,
        method: 'GET',
        params: seatingPlanId ? { seatingPlanId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Flat print rows (on-screen print view)
    // GET /api/academics/exams/{examId}/seating-plan/print-data → SeatingPrintDataResponseDto
    getSeatingPrintData: builder.query({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/print-data`,
        method: 'GET',
        params: seatingPlanId ? { seatingPlanId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Downloadable master seating list — PDF
    downloadSeatingPrintPdf: builder.query({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/print-data/pdf`,
        method: 'GET',
        params: seatingPlanId ? { seatingPlanId } : undefined,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // Downloadable master seating list — Excel
    downloadSeatingPrintExcel: builder.query({
      query: ({ examId, seatingPlanId }) => ({
        url: `/academics/exams/${examId}/seating-plan/print-data/excel`,
        method: 'GET',
        params: seatingPlanId ? { seatingPlanId } : undefined,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),

    // Auto-allocate preview (server-computed proposal, not persisted until applied)
    // POST /api/academics/exams/{examId}/seating-plan/auto-allocate → AutoAllocateResponseDto
    autoAllocatePreview: builder.mutation({
      query: ({ examId, body }) => ({
        url: `/academics/exams/${examId}/seating-plan/auto-allocate`,
        method: 'POST',
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSeatLayoutQuery,
  useSaveSeatAllocationMutation,
  useGetExamDivisionsQuery,
  useGetExamRoomsQuery,
  useGetSeatAllocationTableDataQuery,
  useGetSeatAllocationStudentsQuery,
  useGetSeatingPlanScopesQuery,
  useSaveSeatingPlanScopeMutation,
  useGetSeatingPlanDraftQuery,
  useSaveSeatingPlanDraftMutation,
  useSaveSeatingPlanBulkMutation,
  useValidateSeatingPlanMutation,
  useGetSeatingRoomSummaryQuery,
  useFinalizeSeatingPlanMutation,
  usePublishSeatingPlanMutation,
  useUnlockSeatingPlanMutation,
  useGetSeatingPlanAuditLogQuery,
  useGetSeatingPrintDataQuery,
  useLazyDownloadSeatingPrintPdfQuery,
  useLazyDownloadSeatingPrintExcelQuery,
  useAutoAllocatePreviewMutation,
} = seatAllocationApi;
