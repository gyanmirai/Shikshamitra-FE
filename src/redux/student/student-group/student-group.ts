import { createApi } from '@reduxjs/toolkit/query/react';

import { axiosBaseQuery } from 'src/services/axiosBaseQuery';

export const studentGroupApi = createApi({
  reducerPath: 'studentGroupApi',
  baseQuery: axiosBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  }),
  tagTypes: ['studentGroup'],
  endpoints: (builder) => ({
    getAllGroup: builder.query({
      query: (params) =>
        // const { page, limit, ...rest } = params;
        ({
          url: `/app/student-group`,
          method: 'GET',
        }),
      providesTags: ['studentGroup'],
    }),
    addStudentGroup: builder.mutation({
      query: (body) => ({
        url: `/app/student-group`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['studentGroup'],
    }),
    updateStudentGroup: builder.mutation({
      query: ({ body, id }) => ({
        url: `/app/student-group/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['studentGroup'],
    }),
    deleteStudentGroup: builder.mutation({
      query: (id) => ({
        url: `/app/student-group/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    assignStudentGroup: builder.mutation({
      query: (body) => ({
        url: `/app/student-group-member/assign-student-to-group`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['studentGroup'],
    }),
    setGroupLeader: builder.mutation({
      query: (body) => ({
        url: `/app/student-group-member/set-group-leader`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['studentGroup'],
    }),
    setGroupLeaderAsDivision: builder.mutation({
      query: (body) => ({
        url: `/app/student-group-member/set-division-leader`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['studentGroup'],
    }),
    removeDivisionLeader: builder.mutation({
      query: (groupId) => ({
        url: `/app/student-group-member/division-leader/${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    removeGroupLeader: builder.mutation({
      query: (groupId) => ({
        url: `/app/student-group-member/group-leader/${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    removeStudentFromGroup: builder.mutation({
      query: ({ studentId, groupId }) => ({
        url: `/app/student-group-member/student-from-group?studentId=${studentId}&groupId=${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    deleteGroup: builder.mutation({
      query: (groupId) => ({
        url: `/app/student-group/${groupId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
  }),
});

export const {
  useAddStudentGroupMutation,
  useDeleteStudentGroupMutation,
  useGetAllGroupQuery,
  useUpdateStudentGroupMutation,
  useAssignStudentGroupMutation,
  useSetGroupLeaderMutation,
  useSetGroupLeaderAsDivisionMutation,
  useRemoveDivisionLeaderMutation,
  useRemoveGroupLeaderMutation,
  useRemoveStudentFromGroupMutation,
  useDeleteGroupMutation,
} = studentGroupApi;
