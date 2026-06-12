import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const seatAllocationApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Seat Layout (Drag & Drop)
    // GET /api/academics/exams/{examId}/seat-layout
    getSeatLayout: builder.query({
      query: ({ examId, divisionId, roomId }) => ({
        url: `/academics/exams/${examId}/seat-layout`,
        method: 'GET',
        params: { DivisionId: divisionId, RoomId: roomId },
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
      query: ({ examId, divisionId }) => ({
        url: `/academics/exams/${examId}/divisions/${divisionId}/rooms`,
        method: 'GET',
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
      query: ({ examId, divisionId, standardId }) => ({
        url: `/academics/exams/${examId}/seat-allocation/divisions/${divisionId}/students`,
        method: 'GET',
        params: standardId ? { StandardId: standardId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
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
} = seatAllocationApi;
