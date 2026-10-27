import { api } from 'src/redux/service';
import { studentAdmissionsCrmType } from 'src/redux/tagTypes';
import { studentAcademicFilterParams } from 'src/utils/student-academic-filter-query';

export type AdmissionOfferingAvailabilityStatus = 0 | 1 | 2 | 3 | 4;
export type AdmissionOfferingConfigurationStatus = 0 | 1;
export type AdmissionTrack = 0 | 1 | 2 | 3;
export type AdmissionEntryMode = 0 | 1 | 2;

export type AdmissionOfferingListItem = {
  id: string;
  name: string;
  admissionCycleId: string;
  admissionCycleName: string;
  campusId?: string | null;
  campusName?: string | null;
  boardId: string;
  boardName: string;
  mediumId: string;
  mediumName: string;
  stageId: string;
  stageName: string;
  standardId: string;
  standardName: string;
  track: AdmissionTrack;
  entryMode: AdmissionEntryMode;
  code: string;
  effectiveOpenDate: string;
  effectiveCloseDate: string;
  workflowName?: string | null;
  workflowVersion?: number | null;
  isActive: boolean;
  availabilityStatus: AdmissionOfferingAvailabilityStatus;
  configurationStatus: AdmissionOfferingConfigurationStatus;
  canActivate: boolean;
  applicationCount: number;
  canEditIdentity: boolean;
  canDelete: boolean;
};

export type AdmissionOfferingValidationError = { code: string; message: string };

export type AdmissionOfferingValidation = {
  isValid: boolean;
  status: AdmissionOfferingConfigurationStatus;
  errors: AdmissionOfferingValidationError[];
};

export type AdmissionOfferingAvailability = {
  classCapacity?: AdmissionClassCapacity | null;
  isAvailable: boolean;
  status: AdmissionOfferingAvailabilityStatus;
  canCreateInquiry: boolean;
  canStartApplication: boolean;
  reasonCode?: string | null;
  reasonMessage?: string | null;
};

export type AdmissionClassCapacity = {
  admissionCycleId: string;
  academicYearId: string;
  standardId: string;
  rooms: Array<{ roomId: string; roomName: string; capacity: number }>;
  capacity?: number | null;
  occupiedCount: number;
  remainingSeats?: number | null;
  isFull: boolean;
  isOverCapacity: boolean;
  warning?: string | null;
};

export type AdmissionRoomChoice = AdmissionClassCapacity['rooms'][number] & {
  isAllocatedToAnotherClass: boolean;
};

export type AdmissionOffering = AdmissionOfferingListItem & {
  classCapacity?: AdmissionClassCapacity | null;
  useCycleDates: boolean;
  openDate?: string | null;
  closeDate?: string | null;
  workflowDefinitionId?: string | null;
  inquiryFormDefinitionId?: string | null;
  applicationFormDefinitionId?: string | null;
  inquiryIntakeProfileId?: string | null;
  counsellorAssignmentProfileId?: string | null;
  inquiryFormName?: string | null;
  inquiryFormVersion?: number | null;
  applicationFormName?: string | null;
  applicationFormVersion?: number | null;
  configuration: AdmissionOfferingValidation;
  concurrencyStamp: string;
  creationTime: string;
  creatorId?: string | null;
  lastModificationTime?: string | null;
  lastModifierId?: string | null;
};

export type AdmissionOfferingWriteInput = {
  name: string;
  track: AdmissionTrack;
  entryMode: AdmissionEntryMode;
  campusId?: string | null;
  boardId: string;
  mediumId: string;
  stageId: string;
  standardId: string;
  code: string;
  useCycleDates: boolean;
  openDate?: string | null;
  closeDate?: string | null;
  workflowDefinitionId?: string | null;
  inquiryFormDefinitionId?: string | null;
  applicationFormDefinitionId?: string | null;
  inquiryIntakeProfileId?: string | null;
  counsellorAssignmentProfileId?: string | null;
  isActive: boolean;
};

export type AdmissionOfferingListInput = {
  forSpecialRegistration?: boolean;
  admissionCycleId?: string;
  track?: AdmissionTrack;
  entryMode?: AdmissionEntryMode;
  campusId?: string;
  boardId?: string;
  mediumId?: string;
  stageId?: string;
  standardId?: string;
  standardIds?: string[];
  isActive?: boolean;
  availabilityStatus?: AdmissionOfferingAvailabilityStatus;
  configurationStatus?: AdmissionOfferingConfigurationStatus;
  search?: string;
  columnFilters?: string;
  sorting?: string;
  skipCount?: number;
  maxResultCount?: number;
};

export type AdmissionOfferingClassScope = {
  admissionCycleId: string;
  boardId: string;
  mediumId: string;
  campusId: string | null;
  track: AdmissionTrack;
};

export type AdmissionOfferingClassIdentity = Pick<
  AdmissionOfferingListItem,
  'standardId' | 'stageId'
>;

export type ValidateAdmissionOfferingInput = AdmissionOfferingWriteInput & {
  admissionCycleId: string;
  excludingOfferingId?: string | null;
};

export type BulkAdmissionOfferingInput = Omit<
  AdmissionOfferingWriteInput,
  'standardId' | 'code' | 'name' | 'stageId'
> & {
  stageId?: string | null;
  previewOnly: boolean;
  items: { standardId: string; code: string; name?: string }[];
};

export type BulkAdmissionOfferingResult = {
  isPreview: boolean;
  canCommit: boolean;
  createdCount: number;
  items: Array<{
    standardId: string;
    code: string;
    offeringId?: string | null;
    isValid: boolean;
    canSaveInactive: boolean;
    canActivate: boolean;
    errors: AdmissionOfferingValidationError[];
  }>;
};

type PagedResult<T> = { totalCount: number; items: T[] };
type ResultEnvelope<T> = { data?: T };

const unwrapResult = <T>(response: ResultEnvelope<T> | T): T => {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    const envelope = response as ResultEnvelope<T>;
    if (envelope.data !== undefined) return envelope.data;
  }
  return response as T;
};

const cycleDependentOfferingTags = [
  studentAdmissionsCrmType.admissionOffering,
  studentAdmissionsCrmType.admissionCycle,
];

export const admissionOfferingsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAdmissionOfferings: builder.query<
      PagedResult<AdmissionOfferingListItem>,
      AdmissionOfferingListInput
    >({
      query: (params) => ({
        url: '/student/enrollment/admissions/offerings',
        params: studentAcademicFilterParams(params),
      }),
      transformResponse: (
        response:
          | ResultEnvelope<PagedResult<AdmissionOfferingListItem>>
          | PagedResult<AdmissionOfferingListItem>
      ) => unwrapResult(response),
      providesTags: cycleDependentOfferingTags,
    }),
    getAdmissionOfferingClassIdentities: builder.query<
      AdmissionOfferingClassIdentity[],
      AdmissionOfferingClassScope
    >({
      async queryFn(scope, _queryApi, _options, baseQuery) {
        const identities: AdmissionOfferingClassIdentity[] = [];
        let skipCount = 0;
        // Read every page, including inactive offerings; table filters are not a uniqueness check.
        while (true) {
          // The next offset depends on the previous page's actual size.
          // eslint-disable-next-line no-await-in-loop
          const result = await baseQuery({
            url: '/student/enrollment/admissions/offerings',
            params: studentAcademicFilterParams({
              ...scope,
              sorting: 'code asc',
              skipCount,
              maxResultCount: 100,
            }),
          });
          if (result.error) return { error: result.error };
          const page = unwrapResult(
            result.data as ResultEnvelope<PagedResult<AdmissionOfferingListItem>>
          );
          if (
            !page ||
            !Array.isArray(page.items) ||
            !Number.isFinite(page.totalCount) ||
            (!page.items.length && skipCount < page.totalCount)
          ) {
            return {
              error: { status: 'CUSTOM_ERROR', error: 'Offering classes could not be loaded.' },
            };
          }
          identities.push(
            ...page.items
              .filter(
                (offering) =>
                  offering.admissionCycleId === scope.admissionCycleId &&
                  offering.boardId === scope.boardId &&
                  offering.mediumId === scope.mediumId &&
                  (offering.campusId ?? null) === scope.campusId &&
                  offering.track === scope.track
              )
              .map(({ standardId, stageId }) => ({ standardId, stageId }))
          );
          skipCount += page.items.length;
          if (skipCount >= page.totalCount) return { data: identities };
        }
      },
      providesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    getAdmissionOffering: builder.query<AdmissionOffering, string>({
      query: (id) => `/student/enrollment/admissions/offerings/${id}`,
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      providesTags: cycleDependentOfferingTags,
    }),
    createAdmissionOffering: builder.mutation<
      AdmissionOffering,
      { admissionCycleId: string; body: AdmissionOfferingWriteInput }
    >({
      query: ({ admissionCycleId, body }) => ({
        url: `/student/enrollment/admissions/offerings/cycles/${admissionCycleId}`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    updateAdmissionOffering: builder.mutation<
      AdmissionOffering,
      { id: string; body: AdmissionOfferingWriteInput & { concurrencyStamp: string } }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/offerings/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    activateAdmissionOffering: builder.mutation<
      AdmissionOffering,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/offerings/${id}/activate`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    deactivateAdmissionOffering: builder.mutation<
      AdmissionOffering,
      { id: string; concurrencyStamp: string }
    >({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/offerings/${id}/deactivate`,
        method: 'POST',
        params: { concurrencyStamp },
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    deleteAdmissionOffering: builder.mutation<void, { id: string; concurrencyStamp: string }>({
      query: ({ id, concurrencyStamp }) => ({
        url: `/student/enrollment/admissions/offerings/${id}`,
        method: 'DELETE',
        params: { concurrencyStamp },
      }),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    cloneAdmissionOffering: builder.mutation<
      AdmissionOffering,
      {
        id: string;
        body: Pick<
          AdmissionOfferingWriteInput,
          | 'name'
          | 'track'
          | 'entryMode'
          | 'campusId'
          | 'boardId'
          | 'mediumId'
          | 'stageId'
          | 'standardId'
          | 'code'
        > & { admissionCycleId: string; isActive?: boolean };
      }
    >({
      query: ({ id, body }) => ({
        url: `/student/enrollment/admissions/offerings/${id}/clone`,
        method: 'POST',
        body,
      }),
      transformResponse: (response: ResultEnvelope<AdmissionOffering> | AdmissionOffering) =>
        unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    validateAdmissionOffering: builder.mutation<
      AdmissionOfferingValidation,
      ValidateAdmissionOfferingInput
    >({
      query: (body) => ({
        url: '/student/enrollment/admissions/offerings/validate',
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: ResultEnvelope<AdmissionOfferingValidation> | AdmissionOfferingValidation
      ) => unwrapResult(response),
    }),
    getAdmissionOfferingAvailability: builder.query<AdmissionOfferingAvailability, string>({
      query: (id) => `/student/enrollment/admissions/offerings/${id}/availability`,
      transformResponse: (
        response: ResultEnvelope<AdmissionOfferingAvailability> | AdmissionOfferingAvailability
      ) => unwrapResult(response),
      providesTags: cycleDependentOfferingTags,
    }),
    getAdmissionClassCapacity: builder.query<AdmissionClassCapacity, string>({
      query: (id) => `/student/enrollment/admissions/offerings/${id}/class-capacity`,
      transformResponse: (
        response: ResultEnvelope<AdmissionClassCapacity> | AdmissionClassCapacity
      ) => unwrapResult(response),
      providesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    getAdmissionRoomChoices: builder.query<AdmissionRoomChoice[], { id: string; search?: string }>({
      query: ({ id, search }) => ({
        url: `/student/enrollment/admissions/offerings/${id}/class-capacity/rooms`,
        params: search ? { search } : undefined,
      }),
      transformResponse: (
        response: ResultEnvelope<AdmissionRoomChoice[]> | AdmissionRoomChoice[]
      ) => unwrapResult(response),
    }),
    updateAdmissionClassRooms: builder.mutation<
      AdmissionClassCapacity,
      { id: string; roomIds: string[] }
    >({
      query: ({ id, roomIds }) => ({
        url: `/student/enrollment/admissions/offerings/${id}/class-capacity`,
        method: 'PUT',
        body: { roomIds },
      }),
      transformResponse: (
        response: ResultEnvelope<AdmissionClassCapacity> | AdmissionClassCapacity
      ) => unwrapResult(response),
      invalidatesTags: [studentAdmissionsCrmType.admissionOffering],
    }),
    bulkCreateAdmissionOfferings: builder.mutation<
      BulkAdmissionOfferingResult,
      { admissionCycleId: string; body: BulkAdmissionOfferingInput }
    >({
      query: ({ admissionCycleId, body }) => ({
        url: `/student/enrollment/admissions/offerings/cycles/${admissionCycleId}/bulk`,
        method: 'POST',
        body,
      }),
      transformResponse: (
        response: ResultEnvelope<BulkAdmissionOfferingResult> | BulkAdmissionOfferingResult
      ) => unwrapResult(response),
      invalidatesTags: (_result, _error, input) =>
        input.body.previewOnly ? [] : [studentAdmissionsCrmType.admissionOffering],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetAdmissionOfferingsQuery,
  useLazyGetAdmissionOfferingsQuery,
  useGetAdmissionOfferingClassIdentitiesQuery,
  useGetAdmissionOfferingQuery,
  useLazyGetAdmissionOfferingQuery,
  useCreateAdmissionOfferingMutation,
  useUpdateAdmissionOfferingMutation,
  useActivateAdmissionOfferingMutation,
  useDeactivateAdmissionOfferingMutation,
  useDeleteAdmissionOfferingMutation,
  useCloneAdmissionOfferingMutation,
  useValidateAdmissionOfferingMutation,
  useGetAdmissionOfferingAvailabilityQuery,
  useGetAdmissionClassCapacityQuery,
  useGetAdmissionRoomChoicesQuery,
  useUpdateAdmissionClassRoomsMutation,
  useBulkCreateAdmissionOfferingsMutation,
} = admissionOfferingsApi;
