import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

type QueryParams = Record<string, string | number | boolean | undefined>;

export type ApiSubstitutionRow = {
  id: string;
  date: string;
  day: string;
  period: string;
  startTime: string;
  endTime: string;
  time: string;
  className: string;
  divisionName: string;
  departmentName: string;
  subjectName: string;
  originalTeacherName: string;
  substituteTeacherName?: string | null;
  roomName: string;
  assignedRoomName?: string | null;
  reason: string;
  status: string | number;
  priority: string | number;
  acknowledgementStatus: string | number;
  notificationStatus: string;
  source: string | number;
  conflictStatus: string | number;
  conflictReason?: string | null;
  aiScore?: number | null;
  isAiSuggested: boolean;
  workloadStatus: string;
  acknowledgementRequired: boolean;
  isResponseWindowOpen?: boolean;
  createdAt: string;
  acknowledgedAt?: string | null;
  completedAt?: string | null;
  remarks?: string | null;
  auditLog: {
    id: string;
    at: string;
    actor: string;
    action: string;
    details?: string | null;
  }[];
};

export type ApiPagedResult<T> = {
  totalCount: number;
  items: T[];
};

export type ApiTeacherAvailabilityRow = {
  id: string;
  teacherId?: string | null;
  teacherName: string;
  departmentName: string;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  availabilityStatus: string | number;
  sourceType: string | number;
  reason: string;
  isFullDay: boolean;
  affectedLectureCount: number;
  coveredLectureCount?: number;
  uncoveredLectureCount?: number;
  canCreateSubstitution?: boolean;
  notifyLeadership: boolean;
  attachmentName?: string | null;
  remarks?: string | null;
  activeSubstitutionStatuses?: Array<string | number>;
  activeSubstitutionIds?: string[];
  pendingSubstitutionIds?: string[];
};

export type ApiSuggestedTeacher = {
  teacherId?: string | null;
  teacherName: string;
  departmentName: string;
  canTeachSubject: boolean;
  hasConflict: boolean;
  conflictSeverity: string;
  conflictReason?: string | null;
  todaySubstitutionCount: number;
  weekSubstitutionCount: number;
  monthSubstitutionCount: number;
  todayTeachingLoad: number;
  freePeriods: number;
  lastDutyDate?: string | null;
  loadStatus: string;
  score: number;
  coverageStartTime: string;
  coverageEndTime: string;
  coverageMinutes: number;
  isFullSlotCoverage: boolean;
  isPartialCoverage: boolean;
  recommendationReason: string;
};

export type ApiSubstitutionDashboard = {
  pending: number;
  assigned: number;
  waitingAck: number;
  acknowledged: number;
  completed: number;
  conflict: number;
  teacherUnavailable: number;
  uncovered: number;
  changeRequested: number;
  nextRisk?: ApiSubstitutionRow | null;
  riskAlerts: string[];
  workloadSnapshot: ApiSuggestedTeacher[];
};

export type ApiAffectedLecture = {
  timetableId?: string | null;
  timetableSlotId?: string | null;
  slotSubjectId?: string | null;
  period: string;
  time: string;
  startTime: string;
  endTime: string;
  standardId?: string | null;
  className: string;
  divisionId?: string | null;
  divisionName: string;
  subjectId?: string | null;
  subjectName: string;
  roomId?: string | null;
  roomName: string;
  teacherId?: string | null;
  teacherName: string;
  existingSubstitutionId?: string | null;
  existingSubstitutionStatus?: string | number | null;
  canCreateSubstitution: boolean;
};

export type ApiAffectedLectureResult = {
  items: ApiAffectedLecture[];
};

export type ApiDailySheet = {
  date: string;
  generatedAt: string;
  items: ApiSubstitutionRow[];
};

export type ApiAnalyticsBreakdown = {
  label: string;
  count: number;
};

export type ApiSubstitutionAnalytics = {
  total: number;
  covered: number;
  uncovered: number;
  completed: number;
  rejected: number;
  conflicts: number;
  coverageRate: number;
  averageAcknowledgementMinutes: number;
  topSubstituteTeacher: string;
  frequentSubstitutes: ApiAnalyticsBreakdown[];
  repeatedOriginalTeacherAbsences: ApiAnalyticsBreakdown[];
  subjectCoverageLoss: ApiAnalyticsBreakdown[];
  workloadPatterns: ApiAnalyticsBreakdown[];
};

export type ApiLookupOption = {
  id: string;
  name: string;
};

export type ApiDivisionOption = ApiLookupOption & {
  standardId: string;
};

export type ApiSubjectOption = ApiLookupOption & {
  standardId: string;
  assignedSubjectId: string;
  primaryTeacherId?: string | null;
  primaryTeacherName?: string | null;
};

export type ApiTeacherOption = ApiLookupOption & {
  departmentName: string;
};

export type ApiSubstitutionCreateMetadata = {
  standards: ApiLookupOption[];
  divisions: ApiDivisionOption[];
  subjects: ApiSubjectOption[];
  teachers: ApiTeacherOption[];
  rooms: ApiLookupOption[];
};

export type ApiSubstitutionLecture = {
  timetableId: string;
  timetableSlotId: string;
  slotSubjectId: string;
  period: string;
  startTime: string;
  endTime: string;
  standardId: string;
  className: string;
  divisionId: string;
  divisionName: string;
  subjectId: string;
  subjectName: string;
  originalTeacherId?: string | null;
  originalTeacherName: string;
  originalRoomId?: string | null;
  roomName: string;
};

export type CreateSubstitutionPayload = {
  academicYearId?: string | null;
  academicMediumId?: string | null;
  date: string;
  standardId?: string | null;
  className: string;
  divisionId?: string | null;
  divisionName: string;
  timetableId?: string | null;
  timetableSlotId?: string | null;
  timetableSlotSubjectId?: string | null;
  subjectId?: string | null;
  period: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  originalTeacherId?: string | null;
  originalTeacherName: string;
  originalRoomId?: string | null;
  roomName: string;
  reason: string;
  priority: number;
  source: number;
  acknowledgementRequired: boolean;
  sendNotification: boolean;
  substituteTeacherId?: string | null;
  substituteTeacherName?: string;
  assignedRoomId?: string | null;
  assignedRoomName?: string;
  remarks?: string;
};

export type AssignSubstitutePayload = {
  id: string;
  substituteTeacherId?: string | null;
  substituteTeacherName: string;
  assignedRoomName?: string;
  remarks?: string;
  sendNotification: boolean;
};

export type CreateTeacherAvailabilityPayload = {
  academicYearId?: string;
  teacherId?: string;
  teacherName: string;
  departmentName?: string;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  availabilityStatus: number;
  sourceType: number;
  reason: string;
  isFullDay: boolean;
  notifyLeadership: boolean;
  attachmentName?: string;
  remarks?: string;
};

export const substitutionCreateInvalidationTags = [
  academicType.substitutionList,
  academicType.substitutionDashboard,
  academicType.substitutionDuties,
  academicType.substitutionAvailability,
  academicType.substitutionDailySheet,
  academicType.substitutionAnalytics,
] as const;

export const substitutionStatusInvalidationTags = substitutionCreateInvalidationTags;

export const substitutionManagementApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubstitutions: builder.query<ApiPagedResult<ApiSubstitutionRow>, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionList],
    }),
    getMySubstitutionDuties: builder.query<ApiPagedResult<ApiSubstitutionRow>, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/my-duties',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionDuties],
    }),
    getSubstitutionDashboard: builder.query<ApiSubstitutionDashboard, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/dashboard',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionDashboard],
    }),
    getSubstitutionCreateMetadata: builder.query<ApiSubstitutionCreateMetadata, QueryParams | void>(
      {
        query: (params) => ({
          url: 'academics/timetable/substitutions/create-form-metadata',
          method: 'GET',
          params: params ?? undefined,
        }),
        providesTags: [academicType.substitutionCreateMetadata],
      }
    ),
    getSubstitutionLectures: builder.query<ApiSubstitutionLecture[], QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/lectures',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionLectures],
    }),
    createSubstitution: builder.mutation<ApiSubstitutionRow, CreateSubstitutionPayload>({
      query: (body) => ({
        url: 'academics/timetable/substitutions',
        method: 'POST',
        body,
      }),
      invalidatesTags: substitutionCreateInvalidationTags,
    }),
    assignSubstitute: builder.mutation<ApiSubstitutionRow, AssignSubstitutePayload>({
      query: ({ id, ...body }) => ({
        url: `academics/timetable/substitutions/${id}/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: substitutionStatusInvalidationTags,
    }),
    sendSubstitutionReminder: builder.mutation<ApiSubstitutionRow, string>({
      query: (id) => ({
        url: `academics/timetable/substitutions/${id}/send-reminder`,
        method: 'POST',
      }),
      invalidatesTags: [academicType.substitutionList, academicType.substitutionDuties],
    }),
    completeSubstitution: builder.mutation<ApiSubstitutionRow, string>({
      query: (id) => ({
        url: `academics/timetable/substitutions/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: substitutionStatusInvalidationTags,
    }),
    cancelSubstitution: builder.mutation<ApiSubstitutionRow, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `academics/timetable/substitutions/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: substitutionStatusInvalidationTags,
    }),
    // Teacher duty mutations are invalidated deliberately by the owning dialog after it
    // closes. Endpoint-level invalidation would refetch subscribed tables while the dialog
    // is still showing its submit loader, producing two competing loading states.
    acknowledgeSubstitution: builder.mutation<ApiSubstitutionRow, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `academics/timetable/substitutions/${id}/acknowledge`,
        method: 'POST',
        body: { reason },
      }),
    }),
    requestSubstitutionChange: builder.mutation<ApiSubstitutionRow, { id: string; reason: string }>(
      {
        query: ({ id, reason }) => ({
          url: `academics/timetable/substitutions/${id}/request-change`,
          method: 'POST',
          body: { reason },
        }),
      }
    ),
    rejectSubstitutionDuty: builder.mutation<ApiSubstitutionRow, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `academics/timetable/substitutions/${id}/reject-duty`,
        method: 'POST',
        body: { reason },
      }),
    }),
    getSuggestedTeachers: builder.query<ApiSuggestedTeacher[], string>({
      query: (id) => ({
        url: `academics/timetable/substitutions/${id}/suggested-teachers`,
        method: 'GET',
      }),
      providesTags: [academicType.substitutionSuggestions],
    }),
    getSuggestedTeachersByContext: builder.query<ApiSuggestedTeacher[], QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/suggested-teachers',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionSuggestions],
    }),
    getTeacherAvailability: builder.query<ApiPagedResult<ApiTeacherAvailabilityRow>, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/teacher-availability',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionAvailability],
    }),
    createTeacherAvailability: builder.mutation<
      ApiTeacherAvailabilityRow,
      CreateTeacherAvailabilityPayload
    >({
      query: (body) => ({
        url: 'academics/timetable/teacher-availability',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        academicType.substitutionAvailability,
        academicType.substitutionDashboard,
        academicType.substitutionAffectedLectures,
      ],
    }),
    getAffectedLectures: builder.query<ApiAffectedLectureResult, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/teacher-availability/affected-lectures',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionAffectedLectures],
    }),
    getDailySheet: builder.query<ApiDailySheet, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/daily-sheet',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionDailySheet],
    }),
    getDailySheetPdf: builder.query<Blob, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/daily-sheet/pdf',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getDailySheetExcel: builder.query<Blob, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/daily-sheet/excel',
        method: 'GET',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
    getSubstitutionAnalytics: builder.query<ApiSubstitutionAnalytics, QueryParams>({
      query: (params) => ({
        url: 'academics/timetable/substitutions/analytics',
        method: 'GET',
        params,
      }),
      providesTags: [academicType.substitutionAnalytics],
    }),
  }),
});

export const {
  useGetSubstitutionsQuery,
  useGetMySubstitutionDutiesQuery,
  useGetSubstitutionDashboardQuery,
  useGetSubstitutionCreateMetadataQuery,
  useGetSubstitutionLecturesQuery,
  useCreateSubstitutionMutation,
  useAssignSubstituteMutation,
  useSendSubstitutionReminderMutation,
  useCompleteSubstitutionMutation,
  useCancelSubstitutionMutation,
  useAcknowledgeSubstitutionMutation,
  useRequestSubstitutionChangeMutation,
  useRejectSubstitutionDutyMutation,
  useGetSuggestedTeachersQuery,
  useGetSuggestedTeachersByContextQuery,
  useGetTeacherAvailabilityQuery,
  useCreateTeacherAvailabilityMutation,
  useGetAffectedLecturesQuery,
  useLazyGetAffectedLecturesQuery,
  useGetDailySheetQuery,
  useLazyGetDailySheetPdfQuery,
  useLazyGetDailySheetExcelQuery,
  useGetSubstitutionAnalyticsQuery,
} = substitutionManagementApi;
