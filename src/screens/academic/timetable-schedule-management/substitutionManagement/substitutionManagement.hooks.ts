'use client';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import {
  useGetDailySheetQuery,
  useGetSubstitutionsQuery,
  useAssignSubstituteMutation,
  useGetAffectedLecturesQuery,
  useGetSuggestedTeachersQuery,
  useLazyGetDailySheetPdfQuery,
  useCreateSubstitutionMutation,
  useCancelSubstitutionMutation,
  useGetTeacherAvailabilityQuery,
  useLazyGetDailySheetExcelQuery,
  useLazyGetAffectedLecturesQuery,
  useGetMySubstitutionDutiesQuery,
  useGetSubstitutionSettingsQuery,
  useGetSubstitutionLecturesQuery,
  useCompleteSubstitutionMutation,
  useGetSubstitutionDashboardQuery,
  useRejectSubstitutionDutyMutation,
  useAcknowledgeSubstitutionMutation,
  useSendSubstitutionReminderMutation,
  useCreateTeacherAvailabilityMutation,
  useRequestSubstitutionChangeMutation,
  useGetSubstitutionCreateMetadataQuery,
  useGetSuggestedTeachersByContextQuery,
  useUpdateSubstitutionSettingsMutation,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

type QueryParams = Record<string, string | number | boolean | undefined>;
type QueryOptions = {
  skip?: boolean;
};

const silentQueryPopup = {
  error: true,
  success: false,
};

const mutationPopup = {
  error: true,
  success: false,
};

// My-Duties teacher actions (acknowledge / request-change / reject-duty) all
// render their own success and error toasts inside the screen handler, so the
// wrapper's automatic error toast would duplicate it. Silence the wrapper here.
const silentMutationPopup = {
  error: false,
  success: false,
};

export const useSubstitutionsDataQuery = (
  params: QueryParams
): ReturnType<typeof useGetSubstitutionsQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubstitutionsQuery,
    params,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetSubstitutionsQuery>;

export const useSubstitutionDashboardDataQuery = (
  params: QueryParams
): ReturnType<typeof useGetSubstitutionDashboardQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubstitutionDashboardQuery,
    params,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetSubstitutionDashboardQuery>;

export const useMySubstitutionDutiesDataQuery = (
  params: QueryParams
): ReturnType<typeof useGetMySubstitutionDutiesQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMySubstitutionDutiesQuery,
    params,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetMySubstitutionDutiesQuery>;

export const useTeacherAvailabilityDataQuery = (
  params: QueryParams
): ReturnType<typeof useGetTeacherAvailabilityQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetTeacherAvailabilityQuery,
    params,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetTeacherAvailabilityQuery>;

export const useSubstitutionCreateMetadataDataQuery = (
  params: QueryParams,
  options?: QueryOptions
): ReturnType<typeof useGetSubstitutionCreateMetadataQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubstitutionCreateMetadataQuery,
    popupConfig: silentQueryPopup,
    params,
    options,
  }) as ReturnType<typeof useGetSubstitutionCreateMetadataQuery>;

export const useSubstitutionLecturesDataQuery = (
  params: QueryParams,
  options?: QueryOptions
): ReturnType<typeof useGetSubstitutionLecturesQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubstitutionLecturesQuery,
    params,
    options,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetSubstitutionLecturesQuery>;

export const useSuggestedTeachersDataQuery = (
  id: string,
  options?: QueryOptions
): ReturnType<typeof useGetSuggestedTeachersQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSuggestedTeachersQuery,
    params: id,
    options,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetSuggestedTeachersQuery>;

export const useSuggestedTeachersByContextDataQuery = (
  params: QueryParams,
  options?: QueryOptions
): ReturnType<typeof useGetSuggestedTeachersByContextQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSuggestedTeachersByContextQuery,
    params,
    options,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetSuggestedTeachersByContextQuery>;

export const useAffectedLecturesDataQuery = (
  params: QueryParams,
  options?: QueryOptions
): ReturnType<typeof useGetAffectedLecturesQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAffectedLecturesQuery,
    params,
    options,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetAffectedLecturesQuery>;

export const useDailySheetDataQuery = (
  params: QueryParams
): ReturnType<typeof useGetDailySheetQuery> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDailySheetQuery,
    params,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetDailySheetQuery>;

export const useSubstitutionSettingsDataQuery = (): ReturnType<
  typeof useGetSubstitutionSettingsQuery
> =>
  useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubstitutionSettingsQuery,
    popupConfig: silentQueryPopup,
  }) as ReturnType<typeof useGetSubstitutionSettingsQuery>;

export const useCreateSubstitutionAction = (): ReturnType<typeof useCreateSubstitutionMutation> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateSubstitutionMutation,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useCreateSubstitutionMutation>;

export const useAssignSubstituteAction = (): ReturnType<typeof useAssignSubstituteMutation> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignSubstituteMutation,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useAssignSubstituteMutation>;

export const useSendSubstitutionReminderAction = (): ReturnType<
  typeof useSendSubstitutionReminderMutation
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSendSubstitutionReminderMutation,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useSendSubstitutionReminderMutation>;

export const useCompleteSubstitutionAction = (): ReturnType<
  typeof useCompleteSubstitutionMutation
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCompleteSubstitutionMutation,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useCompleteSubstitutionMutation>;

export const useCancelSubstitutionAction = (): ReturnType<typeof useCancelSubstitutionMutation> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelSubstitutionMutation,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useCancelSubstitutionMutation>;

export const useAcknowledgeSubstitutionAction = (): ReturnType<
  typeof useAcknowledgeSubstitutionMutation
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAcknowledgeSubstitutionMutation,
    popupConfig: silentMutationPopup,
  }) as ReturnType<typeof useAcknowledgeSubstitutionMutation>;

export const useRequestSubstitutionChangeAction = (): ReturnType<
  typeof useRequestSubstitutionChangeMutation
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRequestSubstitutionChangeMutation,
    popupConfig: silentMutationPopup,
  }) as ReturnType<typeof useRequestSubstitutionChangeMutation>;

export const useRejectSubstitutionDutyAction = (): ReturnType<
  typeof useRejectSubstitutionDutyMutation
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectSubstitutionDutyMutation,
    popupConfig: silentMutationPopup,
  }) as ReturnType<typeof useRejectSubstitutionDutyMutation>;

export const useCreateTeacherAvailabilityAction = (): ReturnType<
  typeof useCreateTeacherAvailabilityMutation
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateTeacherAvailabilityMutation,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useCreateTeacherAvailabilityMutation>;

export const useUpdateSubstitutionSettingsAction = (): ReturnType<
  typeof useUpdateSubstitutionSettingsMutation
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubstitutionSettingsMutation,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useUpdateSubstitutionSettingsMutation>;

export const useDailySheetPdfLazyQuery = (): ReturnType<typeof useLazyGetDailySheetPdfQuery> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetDailySheetPdfQuery,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useLazyGetDailySheetPdfQuery>;

export const useDailySheetExcelLazyQuery = (): ReturnType<typeof useLazyGetDailySheetExcelQuery> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetDailySheetExcelQuery,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useLazyGetDailySheetExcelQuery>;

export const useAffectedLecturesLazyQuery = (): ReturnType<
  typeof useLazyGetAffectedLecturesQuery
> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetAffectedLecturesQuery,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useLazyGetAffectedLecturesQuery>;

export const useEmployeeOptionsLazyQuery = (): ReturnType<typeof useLazyGetEmployeeQuery> =>
  useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
    popupConfig: mutationPopup,
  }) as ReturnType<typeof useLazyGetEmployeeQuery>;
