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
      query: (divisionId: string) => ({
        url: `/students/records/list/${divisionId}`,
        method: 'GET',
      }),
      providesTags: [studentType.student],
    }),
    getStudentsByScope: builder.query<
      StudentLookupItem[],
      {
        academicYearId: string;
        boardId: string;
        educationMediumId: string;
        classIds: string[];
        divisionIds?: string[];
      }
    >({
      query: ({ academicYearId, boardId, educationMediumId, classIds, divisionIds }) => {
        const params = new URLSearchParams();
        params.append('academicYearId', academicYearId);
        params.append('boardId', boardId);
        params.append('educationMediumId', educationMediumId);
        classIds.forEach((id) => params.append('classIds', id));
        divisionIds?.forEach((id) => params.append('divisionIds', id));
        return {
          url: `/students/records/list/by-scope?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: [studentType.student],
    }),
  }),
});

export type StudentLookupItem = {
  studentId: string;
  studentName: string;
  grNo?: number;
  rollNo?: number;
  standardId?: string;
  standardName?: string;
  divisionId?: string;
  divisionName?: string;
};

export const {
  useGetFilterStudentsQuery,
  useLazyGetFilterStudentsQuery,
  useChangeDivisionMutation,
  useGetAllStudentsQuery,
  useGetStudentByIdQuery,
  useGetStudentsByDivisionQuery,
  useLazyGetStudentsByDivisionQuery,
  useGetStudentsByScopeQuery,
  useLazyGetStudentsByScopeQuery,
} = StudentApi;
