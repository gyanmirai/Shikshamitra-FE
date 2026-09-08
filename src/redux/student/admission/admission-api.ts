import { api } from 'src/redux/service';
import { financeModuleType, studentAdmissionType } from 'src/redux/tagTypes';

export interface StudentFeeAssignmentPreviewLine {
  feeHeadId: string;
  feeHeadName: string;
  installmentLabel: string;
  coverageStartDate?: string | null;
  coverageEndDate?: string | null;
  scheduledAmount: number;
  proratedAmount: number;
  reductionAmount: number;
  factor?: number | null;
  ruleType?: string | null;
  roundingMode?: string | null;
  explanation?: string | null;
}

export interface StudentFeeAssignmentPreview {
  prorationPolicyId?: string | null;
  prorationPolicyVersionId?: string | null;
  chargeStartDate: string;
  chargeEndDate: string;
  scheduledTotal: number;
  proratedTotal: number;
  reductionTotal: number;
  lines: StudentFeeAssignmentPreviewLine[];
}

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
    getStudentFeeStructure: builder.query({
		query: ({ studentId, academicYearId }) => ({
        url: `/student-fee-structure/student/${studentId}`,
        method: 'GET',
		params: { academicYearId },
      }),
      providesTags: [studentAdmissionType.studentAdmission],
    }),
    assignFeeStructure: builder.mutation({
      query: ({ body }) => ({
        url: `/student-fee-structure/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionType.studentAdmission, financeModuleType.feeCollection],
    }),
    previewFeeStructureAssignment: builder.mutation<
      StudentFeeAssignmentPreview,
      { body: Record<string, unknown> }
    >({
      query: ({ body }) => ({
        url: `/student-fee-structure/preview`,
        method: 'POST',
        body,
      }),
    }),
    assignBulkFeeStructure: builder.mutation({
      query: ({ body }) => ({
        url: `/student-fee-structure/assign-bulk`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [studentAdmissionType.studentAdmission, financeModuleType.feeCollection],
    }),
  }),
});

export const {
  useGetStudentAdmissionQuery,
  useChangeAdmissionStatusMutation,
  useAssignDivisionTOStudentMutation,
  useGetDivisionForStandardQuery,
  useAssignFeeStructureMutation,
  usePreviewFeeStructureAssignmentMutation,
  useAssignBulkFeeStructureMutation,
  useGetStudentFeeStructureQuery,
} = StudentAdmissionApi;
