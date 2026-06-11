import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

export const StudentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFilterStudents: builder.query({
      query: ({
        academicYearId,
        academicMediumId,
        educationMediumStageId,
        standardId,
        divisionId,
      }) => {
        let queryString = '';
        if (academicYearId) {
          queryString += `AcademicYearId=${academicYearId}&`;
        }
        if (academicMediumId) {
          queryString += `AcademicMediumId=${academicMediumId}&`;
        }
        if (educationMediumStageId) {
          queryString += `EducationMediumStageId=${educationMediumStageId}&`;
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
      query: (
        args:
          | string
          | { divisionId: string; skipCount?: number; maxResultCount?: number; searchTerm?: string }
      ) => {
        const params = typeof args === 'string' ? { divisionId: args } : args;
        const queryParams = new URLSearchParams();

        if (params.skipCount !== undefined) queryParams.set('skipCount', String(params.skipCount));
        if (params.maxResultCount !== undefined) {
          queryParams.set('maxResultCount', String(params.maxResultCount));
        }
        if (params.searchTerm) queryParams.set('searchTerm', params.searchTerm);

        const queryString = queryParams.toString();

        return {
          url: `/students/records/list/${params.divisionId}${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      providesTags: [studentType.student],
    }),
    uploadStudentPhoto: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/records/${studentId}/photo`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentType.student],
    }),
    getStudentDashboardSummary: builder.query({
      query: () => ({
        url: '/students/records/dashboard-summary',
        method: 'GET',
      }),
      providesTags: [studentType.student],
    }),
    getStudentAttendanceDashboardSummary: builder.query({
      query: () => ({
        url: '/students/records/attendance-dashboard-summary',
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
  useUploadStudentPhotoMutation,
  useGetStudentDashboardSummaryQuery,
  useGetStudentAttendanceDashboardSummaryQuery,
} = StudentApi;
