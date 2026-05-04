import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

export const seatAllocationApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Seat Layout (Drag & Drop)
    // GET /api/academics/exams/{examId}/seat-layout
    getSeatLayout: builder.query({
      query: ({ examId, divisionId, roomId }) => ({
        url: `exams/${examId}/seat-layout`,
        method: 'GET',
        params: { DivisionId: divisionId, RoomId: roomId },
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Save Seat Allocation (Bulk)
    // POST /api/academics/exams/{examId}/seat-allocation/save
    saveSeatAllocation: builder.mutation({
      query: ({ examId, body }) => ({
        url: `exams/${examId}/seat-allocation/save`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Get Divisions for Exam
    // GET /api/academics/exams/{examId}/seat-allocation/students → SeatAllocationDivisionsResponseDto
    getExamDivisions: builder.query({
      query: ({ examId, standardId }) => ({
        url: `exams/${examId}/seat-allocation/students`,
        method: 'GET',
        params: standardId ? { StandardId: standardId } : undefined,
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Get Rooms for Exam and Division
    getExamRooms: builder.query({
      query: ({ examId, divisionId }) => ({
        url: `exams/${examId}/divisions/${divisionId}/rooms`,
        method: 'GET',
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Get Seat Allocation Dashboard Table
    // GET /api/academics/exams/seat-allocation → SeatAllocationDashboardResponseDto
    getSeatAllocationTableData: builder.query({
      query: ({ standardId, page = 1, pageSize = 10 }) => ({
        url: `exams/seat-allocation`,
        method: 'GET',
        params: { StandardId: standardId, Page: page, PageSize: pageSize },
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Get Students for Seat Allocation (per division)
    // GET /api/academics/exams/{examId}/seat-allocation/divisions/{divisionId}/students → SeatStudentPagedResponseDto
    getSeatAllocationStudents: builder.query({
      query: ({ examId, divisionId, standardId }) => ({
        url: `exams/${examId}/seat-allocation/divisions/${divisionId}/students`,
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
