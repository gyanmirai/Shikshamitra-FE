import { calendarModuleApi } from '../calendarApi';
import { calendarModuleType } from 'src/redux/tagTypes';


export const groupManagementApi = calendarModuleApi.injectEndpoints({
  endpoints: (builder) => ({
    getStudentRuleFields: builder.query({
      query: () => ({
        url: '/groups/rules/student-fields',
        method: 'GET',
      }),
    }),
    getEmployeeRuleFields: builder.query({
      query: () => ({
        url: '/groups/rules/employee-fields',
        method: 'GET',
      }),
    }),
    getAudienceGroupDetails: builder.query({
      query: (groupId) => ({
        url: `/calendar/audience-groups/${groupId}`,
        method: 'GET',
      }),
    }),
    getGroups: builder.query({
      query: (params) => ({
        url: '/groups',
        method: 'GET',
        params,
      }),
      providesTags: [calendarModuleType.groups],
    }),
    createGroup: builder.mutation({
      query: ({ academicYearId, body }) => ({
        url: '/groups',
        method: 'POST',
        params: { academicYearId },
        data: body,
      }),
      invalidatesTags: [calendarModuleType.groups],
    }),
    updateGroup: builder.mutation({
      query: ({ groupId, body }) => ({
        url: `/groups/${groupId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [calendarModuleType.groups, calendarModuleType.groupDetails],
    }),
    deleteGroup: builder.mutation({
      query: (groupId) => ({
        url: `/groups/${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [calendarModuleType.groups],
    }),
    previewGroupAudience: builder.query({
      query: (groupId) => ({
        url: `/groups/preview/${groupId}`,
        method: 'GET',
      }),
    }),
    getGroupUsers: builder.query({
      query: (params) => ({
        url: '/groups/users',
        method: 'GET',
        params,
      }),
    }),
    getGroupById: builder.query({
      query: ({ id }) => ({
        url: `/groups/${id}`,
        method: 'GET',
      }),
      providesTags: [calendarModuleType.groupDetails],
    }),
    getUsersForSelection: builder.mutation({
      query: (body) => ({
        url: '/groups/users-for-selection',
        method: 'POST',
        data: body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentRuleFieldsQuery,
  useGetEmployeeRuleFieldsQuery,
  useGetAudienceGroupDetailsQuery,
  useGetGroupsQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  usePreviewGroupAudienceQuery,
  useGetGroupUsersQuery,
  useGetGroupByIdQuery,
  useGetUsersForSelectionMutation,
} = groupManagementApi;
