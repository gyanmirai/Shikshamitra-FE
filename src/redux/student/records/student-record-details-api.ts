import type {
  AdmissionForm,
  AdmissionFormOption,
} from 'src/redux/student/admissions/admission-forms-api';

import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from './student-records-api';

import type { RecordChange, RecordSnapshot } from './student-record-changes-api';

export type ProfileSectionKey =
  'general' | 'family' | 'communication' | 'additional' | 'medical' | 'bank' | 'previous-school';
export type RecordStructuredSection = {
  section: ProfileSectionKey;
  hasData: boolean;
  isMasked: boolean;
  canEdit: boolean;
  data?: Record<string, unknown> | null;
};
export type RecordRegistrationSource = {
  applicationId: string;
  applicationNumber: string;
  academicYearId: string;
  formInstanceId: string;
  submissionId: string;
  submittedAt: string;
  finalizedAt: string;
  onboardingCaseId: string;
  activatedAt?: string | null;
  onboardingStatus: string;
  formDefinitionId: string;
  formFamilyId: string;
  formVersion: number;
  formName: string;
  definition?: AdmissionForm | null;
  originalValues: Record<string, unknown>;
  currentValues: Record<string, unknown>;
  isBaseline: boolean;
  editableFieldCodes: string[];
  formEditableFieldCodes?: string[];
  formMaskedFieldCodes?: string[];
  capturedFieldCodes?: string[];
  differences: {
    fieldCode: string;
    label: string;
    currentValue: unknown;
    submittedValue: unknown;
    canReview: boolean;
  }[];
  optionsByField?: Record<string, AdmissionFormOption[]>;
  optionsByFieldPath?: Record<string, AdmissionFormOption[]>;
};
export type RecordFieldOptionsInput = {
  studentId: string;
  submissionId: string;
  fieldCode: string;
  parentId?: string;
  searchTerm?: string;
  skipCount?: number;
  maxResultCount?: number;
  selectedIds?: string[];
  selectedOnly?: boolean;
};
export type StudentRecordDetails = {
  studentId: string;
  recordsAccess: 'Full' | 'Summary';
  structuredSections: RecordStructuredSection[];
  customDetailsMasked: boolean;
  customDetailsEditable: boolean;
  registrationSources: RecordRegistrationSource[];
  formSources?: RecordRegistrationSource[];
};
export type CustomRecordPayload = {
  sources: {
    applicationId: string;
    formInstanceId: string;
    submissionId: string;
    values: Record<string, unknown>;
  }[];
};

export const studentRecordDetailsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRecordFormSnapshot: builder.query<RecordSnapshot, string>({
      query: (studentId) =>
        `/students/records/${encodeURIComponent(studentId)}/details/form-snapshot`,
      transformResponse: (response: RecordSnapshot | { data?: RecordSnapshot }) =>
        'section' in response ? response : unwrapRecordsResult<RecordSnapshot>(response),
      providesTags: (_result, _error, studentId) => [
        { type: studentType.student, id: `RECORDS-FORM-SNAPSHOT-${studentId}` },
      ],
    }),
    updateStudentRecordForm: builder.mutation<
      RecordChange,
      {
        studentId: string;
        clientKey: string;
        reason: string;
        expectedSnapshot: string;
        payload: CustomRecordPayload;
      }
    >({
      query: ({ studentId, ...body }) => ({
        url: `/students/records/${encodeURIComponent(studentId)}/details/form`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: RecordChange | { data?: RecordChange }) =>
        unwrapRecordsResult(response),
      invalidatesTags: (_result, error, { studentId }) =>
        error
          ? []
          : [
              { type: studentType.student, id: `RECORDS-DETAILS-${studentId}` },
              { type: studentType.student, id: `RECORDS-PROFILE-${studentId}` },
              { type: studentType.student, id: `RECORDS-FORM-SNAPSHOT-${studentId}` },
              { type: studentType.student, id: 'RECORDS-CHANGES' },
              { type: studentType.student, id: 'RECORDS-DIRECTORY' },
              { type: studentType.student, id: 'LIST' },
            ],
    }),
    getStudentRecordFieldOptions: builder.query<AdmissionFormOption[], RecordFieldOptionsInput>({
      query: ({ studentId, selectedIds, ...input }) => {
        const params = new URLSearchParams();
        Object.entries(input).forEach(([key, value]) => {
          if (value !== undefined && value !== '') params.set(key, String(value));
        });
        selectedIds?.forEach((id) => params.append('selectedIds', id));
        return `/students/records/${encodeURIComponent(studentId)}/details/options?${params}`;
      },
      transformResponse: (response: AdmissionFormOption[] | { data?: AdmissionFormOption[] }) =>
        unwrapRecordsResult(response),
      providesTags: (_result, _error, { studentId }) => [
        { type: studentType.student, id: `RECORDS-DETAILS-${studentId}` },
      ],
    }),
    getStudentRecordDetails: builder.query<
      StudentRecordDetails,
      { studentId: string; academicYearId?: string }
    >({
      query: ({ studentId, ...params }) => ({
        url: `/students/records/${encodeURIComponent(studentId)}/details`,
        params,
      }),
      transformResponse: (response: StudentRecordDetails | { data?: StudentRecordDetails }) =>
        unwrapRecordsResult(response),
      providesTags: (_result, _error, { studentId }) => [
        { type: studentType.student, id: `RECORDS-DETAILS-${studentId}` },
        studentType.student,
      ],
    }),
  }),
});

export const {
  useGetStudentRecordFormSnapshotQuery,
  useUpdateStudentRecordFormMutation,
  useGetStudentRecordDetailsQuery,
  useGetStudentRecordFieldOptionsQuery,
  useLazyGetStudentRecordFieldOptionsQuery,
} = studentRecordDetailsApi;
