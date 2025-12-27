import { academicApi } from '../../academicApi';

export const seatAllocationApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Students for Seat Allocation
    getStudentsForSeatAllocation: builder.query({
      query: ({ examId, academicMediumId, classId, divisionId }) => ({
        url: `exams/${examId}/seat-allocation/students`,
        method: 'GET',
        params: { academicMediumId, classId, divisionId },
      }),
      providesTags: ['Exam'],
    }),

    // Allocate Seats to Students
    allocateSeats: builder.mutation({
      query: ({ examId, academicMediumId, body }) => ({
        url: `exams/${examId}/seat-allocation`,
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    // Update Student Seat Allocation
    updateStudentSeatAllocation: builder.mutation({
      query: ({ examId, studentId, academicMediumId, body }) => ({
        url: `exams/${examId}/seat-allocation/${studentId}`,
        method: 'PATCH',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: ['Exam'],
    }),

    // Get Allocated Students for a Room
    getAllocatedStudentsForRoom: builder.query({
      query: ({ examId, roomId, academicMediumId }) => ({
        url: `exams/${examId}/rooms/${roomId}/allocated`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: ['Exam'],
    }),

    // Get Exams Allocation Summary
    getExamsAllocationSummary: builder.query({
      query: ({ academicMediumId, classId }) => ({
        url: `exams/seat-allocation`,
        method: 'GET',
        params: { academicMediumId, classId },
      }),
      providesTags: ['Exam'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentsForSeatAllocationQuery,
  useAllocateSeatsMutation,
  useUpdateStudentSeatAllocationMutation,
  useGetAllocatedStudentsForRoomQuery,
  useGetExamsAllocationSummaryQuery,
} = seatAllocationApi;
