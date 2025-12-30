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
      query: (academicMediumId) => ({
        url: `/students/records/academic-mediums/${academicMediumId}/house-settings`,
        method: 'GET',
      }),
      providesTags: ['studentGroup'],
    }),
    getGroupById: builder.query({
      query: (houseSettingId) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
        method: 'GET',
      }),
      providesTags: ['studentGroup'],
    }),
    addStudentGroup: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/students/records/academic-mediums/${academicMediumId}/house-settings`,
        method: 'POST',
        data: body,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['studentGroup'],
    }),
    updateStudentGroup: builder.mutation({
      query: ({ body, houseSettingId }) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
        method: 'PUT',
        data: body,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
      invalidatesTags: ['studentGroup'],
    }),
    deleteStudentGroup: builder.mutation({
      query: (houseSettingId) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    getAllStudentGroup: builder.query({
      query: (divisionId) => ({
        url: `/students/records/${divisionId}`,
        method: 'GET',
      }),
      providesTags: ['studentGroup'],
    }),
    assignStudentGroup: builder.mutation({
      query: ({ houseId, studentId }) => ({
        url: `/students/records/${studentId}/houses?houseId=${houseId}`,
        method: 'POST',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    setGroupLeader: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-global-leader`,
        method: 'POST',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    setGroupLeaderAsDivision: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-division-leader`,
        method: 'POST',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    removeDivisionLeader: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-division-leader`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    removeGroupLeader: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-global-leader`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    removeStudentFromGroup: builder.mutation({
      query: ({ studentId }) => ({
        url: `/students/records/${studentId}/houses`,
        method: 'DELETE',
      }),
      invalidatesTags: ['studentGroup'],
    }),
    deleteGroup: builder.mutation({
      query: (houseSettingId) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
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
  useGetGroupByIdQuery,
  useUpdateStudentGroupMutation,
  useAssignStudentGroupMutation,
  useSetGroupLeaderMutation,
  useSetGroupLeaderAsDivisionMutation,
  useRemoveDivisionLeaderMutation,
  useRemoveGroupLeaderMutation,
  useRemoveStudentFromGroupMutation,
  useDeleteGroupMutation,
  useGetAllStudentGroupQuery,
} = studentGroupApi;
