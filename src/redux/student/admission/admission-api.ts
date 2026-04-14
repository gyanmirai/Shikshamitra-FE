import { api } from 'src/redux/service';
import { studentAdmissionType } from 'src/redux/tagTypes';

export const StudentAdmissionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentAdmission: builder.query({
      query: ({ AcademicMediumId, approvalStatus, sorting, skipCount, maxResultCount }) => ({
        url: `/students/admissions`,
        method: 'GET',
        params: {
          AcademicMediumId,
          approvalStatus,
          Sorting: sorting,
          SkipCount: skipCount,
          MaxResultCount: maxResultCount,
        },
      }),
      providesTags: [studentAdmissionType.studentAdmission],
    }),
    changeAdmissionStatus: builder.mutation({
      query: ({ body }) => ({
        url: `/students/admissions/status`,
        method: 'POST',
        data: { items: body },
      }),
      invalidatesTags: [studentAdmissionType.studentAdmission],
    }),
    assignDivisionTOStudent: builder.mutation({
      query: ({ studentId, body }) => ({
        url: `/students/admissions/${studentId}/division`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [studentAdmissionType.studentAdmission],
    }),

    getDivisionForStandard: builder.query({
      query: (standardId) => ({
        url: `/app/standard/${standardId}`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionType.studentAdmission],
    }),
    getStandardFeeStructure: builder.query({
      query: ({ studentId }) => ({
        url: `/student-fee-structure/student/${studentId}`,
        method: 'GET',
      }),
      providesTags: [studentAdmissionType.studentAdmission],
    }),
    assignFeeStructure: builder.mutation({
      query: ({ body }) => ({
        url: `/student-fee-structure/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionType.studentAdmission],
    }),
  }),
});

export const {
  useGetStudentAdmissionQuery,
  useChangeAdmissionStatusMutation,
  useAssignDivisionTOStudentMutation,
  useGetDivisionForStandardQuery,
  useAssignFeeStructureMutation,
  useGetStandardFeeStructureQuery,
} = StudentAdmissionApi;
