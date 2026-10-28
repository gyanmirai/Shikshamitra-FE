import { classManagementType } from 'src/redux/tagTypes';

import { classManagementApi } from '../classManagementApi';

export type ClassTeacherValidationIssue = {
  severity: 'Info' | 'Warning' | 'Critical' | string;
  code: string;
  message: string;
  classId?: string;
  divisionId?: string;
  teacherId?: string;
  suggestedFix?: string;
};

export type ClassTeacherSummary = {
  totalClasses: number;
  assigned: number;
  unassigned: number;
  conflicts: number;
  pendingChanges: number;
  pendingApproval: number;
  temporaryAssignments: number;
  acknowledgmentPending: number;
  status: string;
  reasons: string[];
};

export type AssignedTeacher = {
  teacherId: string;
  teacherName: string;
  employeeCode?: string;
  department?: string;
  isActive: boolean;
  currentClassTeacherCount: number;
  maximumClassTeacherCount: number;
  availabilityStatus: string;
  workloadStatus: string;
  conflictStatus: string;
  recommendationScore: number;
};

export type ClassTeacherAssignmentRowDto = {
  classId: string;
  className: string;
  divisionId: string;
  divisionName: string;
  studentCount: number;
  assignmentStatus: string;
  approvalStatus: string;
  acknowledgmentStatus: string;
  handoverStatus: string;
  assignmentType: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  lastUpdatedAt?: string;
  lastUpdatedBy?: string;
  conflictCount: number;
  issues: ClassTeacherValidationIssue[];
  assignedTeacher?: AssignedTeacher | null;
};

export type ClassTeacherEligibleTeacher = {
  teacherId: string;
  teacherName: string;
  employeeCode?: string;
  department?: string;
  currentWorkload: number;
  maximumWorkload: number;
  currentClassTeacherCount: number;
  maximumClassTeacherCount: number;
  isActive: boolean;
  isEligible: boolean;
  hasTimetableConflict: boolean;
  isOnLeave: boolean;
  availabilityStatus: string;
  workloadStatus: string;
  conflictStatus: string;
  recommendationScore: number;
  ineligibilityReasons: string[];
};

export type ClassTeacherAssignmentUpdate = {
  classId: string;
  divisionId: string;
  teacherId: string;
  assignmentType?: string;
  effectiveFrom?: string;
  effectiveTo?: string;
  changeReason?: string;
  notes?: string;
};

export type SaveClassTeacherAssignmentsPayload = {
  organizationId: string;
  saveAsDraft?: boolean;
  assignments: ClassTeacherAssignmentUpdate[];
};

export type ClassTeacherValidationResult = {
  canConfirm: boolean;
  summary: ClassTeacherSummary;
  issues: ClassTeacherValidationIssue[];
};

export type ClassTeacherAssignmentHistory = {
  classId: string;
  className: string;
  divisionId: string;
  divisionName: string;
  previousTeacherId?: string;
  previousTeacherName?: string;
  newTeacherId?: string;
  newTeacherName?: string;
  changedAt: string;
  changedBy: string;
  changeReason: string;
};

export const classTeacherAssignmentApi = classManagementApi.injectEndpoints({
  endpoints: (builder) => ({
    getClassTeacherWorkspace: builder.query<{
      items: ClassTeacherAssignmentRowDto[];
      summary: ClassTeacherSummary;
      eligibleTeachers: ClassTeacherEligibleTeacher[];
    }, { organizationId: string }>({
      query: (params) => ({ url: 'class-management/class-teacher-assignments/workspace', method: 'GET', params }),
      providesTags: [classManagementType.classTeacherAssignment],
    }),
    getClassTeacherAssignments: builder.query<
      ClassTeacherAssignmentRowDto[],
      { organizationId: string }
    >({
      query: (params) => ({
        url: 'class-management/class-teacher-assignments',
        method: 'GET',
        params,
      }),
      providesTags: [classManagementType.classTeacherAssignment],
    }),
    getClassTeacherAssignmentSummary: builder.query<ClassTeacherSummary, { organizationId: string }>({
      query: (params) => ({
        url: 'class-management/class-teacher-assignments/summary',
        method: 'GET',
        params,
      }),
      providesTags: [classManagementType.classTeacherAssignment],
    }),
    getClassTeacherEligibleTeachers: builder.query<
      ClassTeacherEligibleTeacher[],
      { organizationId: string; classId?: string; divisionId?: string; search?: string }
    >({
      query: (params) => ({
        url: 'class-management/class-teacher-assignments/eligible-teachers',
        method: 'GET',
        params,
      }),
      providesTags: [classManagementType.classTeacherAssignment],
    }),
    getClassTeacherAssignmentHistory: builder.query<
      ClassTeacherAssignmentHistory[],
      { organizationId: string }
    >({
      query: (params) => ({
        url: 'class-management/class-teacher-assignments/history',
        method: 'GET',
        params,
      }),
      providesTags: [classManagementType.classTeacherAssignment],
    }),
    validateClassTeacherAssignments: builder.mutation<
      ClassTeacherValidationResult,
      SaveClassTeacherAssignmentsPayload
    >({
      query: (body) => ({
        url: 'class-management/class-teacher-assignments/validate',
        method: 'POST',
        body,
      }),
    }),
    updateClassTeacherAssignments: builder.mutation<any, SaveClassTeacherAssignmentsPayload>({
      query: (body) => ({
        url: 'class-management/class-teacher-assignments',
        method: 'PUT',
        body,
      }),
      invalidatesTags: [classManagementType.classTeacherAssignment],
    }),
  }),
});

export const {
  useGetClassTeacherWorkspaceQuery,
  useGetClassTeacherAssignmentsQuery,
  useGetClassTeacherAssignmentSummaryQuery,
  useGetClassTeacherEligibleTeachersQuery,
  useGetClassTeacherAssignmentHistoryQuery,
  useValidateClassTeacherAssignmentsMutation,
  useUpdateClassTeacherAssignmentsMutation,
} = classTeacherAssignmentApi;
