import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

export const StudentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFilterStudents: builder.query({
      query: ({ academicYearId, academicMediumId, standardId, divisionId }) => {
        let queryString = '';
        if (academicYearId) {
          queryString += `AcademicYearId=${academicYearId}&`;
        }
        if (academicMediumId) {
          queryString += `AcademicMediumId=${academicMediumId}&`;
        }
        if (standardId) {
          queryString += `StandardId=${standardId}&`;
        }
        if (divisionId) {
          queryString += `DivisionId=${divisionId}&`;
        }
        queryString = queryString ? `?${queryString.slice(0, -1)}` : '';

        return {
          url: `/students/admissions${queryString}`,
          method: 'GET',
        };
      },
      providesTags: [studentType.student],
    }),
    changeDivision: builder.mutation({
      query: (body) => ({
        url: `/students/records/divisions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentType.student],
    }),
    getAllStudents: builder.query({
      query: () => ({
        url: `/app/student`,
        method: 'GET',
      }),
      providesTags: [studentType.student],
    }),
    getStudentById: builder.query({
      query: (id) => ({
        url: `/app/student/${id}`,
        method: 'GET',
      }),
      providesTags: [studentType.student],
    }),
    getStudentsByDivision: builder.query({
      query: ({ divisionId }: { divisionId: string }) => ({
        url: `/students/records/list/${divisionId}`,
        method: 'GET',
      }),
      providesTags: [studentType.student],
    }),
  }),
});

export const {
  useGetFilterStudentsQuery,
  useLazyGetFilterStudentsQuery,
  useChangeDivisionMutation,
  useGetAllStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentsByDivisionQuery,
  useLazyGetStudentsByDivisionQuery,
} = StudentApi;
