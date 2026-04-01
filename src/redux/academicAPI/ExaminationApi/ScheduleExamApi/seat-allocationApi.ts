import { academicApi } from '../../academicApi';
import { academicType } from 'src/redux/tagTypes';


export const seatAllocationApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Seat Layout (Drag & Drop)
    getSeatLayout: builder.query({
      query: ({ examId, divisionId, roomId }) => ({
        url: `exams/${examId}/seat-layout`,
        method: 'GET',
        params: { divisionId, roomId },
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Save Seat Allocation (Bulk)
    saveSeatAllocation: builder.mutation({
      query: ({ examId, academicMediumId, body }) => ({
        url: `exams/${examId}/seat-allocation/save`,
        method: 'POST',
        params: { academicMediumId },
        data: body,
      }),
      invalidatesTags: [academicType.seatAllocation],
    }),

    // Get Division for Exam
    getExamDivisions: builder.query({
      query: ({ examId, academicMediumId, classId }) => ({
        url: `exams/${examId}/seat-allocation/students`,
        method: 'GET',
        params: { academicMediumId, classId },
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

    // Get Seat Allocation Table (Dashboard)
    getSeatAllocationTableData: builder.query({
      query: ({ academicMediumId, classId, page = 1, pageSize = 10 }) => ({
        url: `exams/seat-allocation`,
        method: 'GET',
        params: { academicMediumId, classId, page, pageSize },
      }),
      providesTags: [academicType.seatAllocation],
    }),

    // Get Students for Seat Allocation (Details/Drag & Drop)
    getSeatAllocationStudents: builder.query({
      query: ({ examId, divisionId, academicMediumId, classNameId }) => ({
        url: `exams/${examId}/seat-allocation/divisions/${divisionId}/students`,
        method: 'GET',
        params: { academicMediumId, classNameId },
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
