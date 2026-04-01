import { api } from 'src/redux/service';
import { studentGroupType } from 'src/redux/tagTypes';

export const studentGroupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllGroup: builder.query({
      query: (academicMediumId) => ({
        url: `/students/records/academic-mediums/${academicMediumId}/house-settings`,
        method: 'GET',
      }),
      providesTags: [studentGroupType.studentGroup],
    }),
    getGroupById: builder.query({
      query: (houseSettingId) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
        method: 'GET',
      }),
      providesTags: [studentGroupType.studentGroup],
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
      invalidatesTags: [studentGroupType.studentGroup],
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
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    deleteStudentGroup: builder.mutation({
      query: (houseSettingId) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    getAllStudentGroup: builder.query({
      query: ({
        division,
        sorting,
        skipCount,
        maxResultCount,
      }: {
        division: string;
        sorting?: string;
        skipCount?: number;
        maxResultCount?: number;
      }) => ({
        url: `/students/records/${division}`,
        method: 'GET',
        params: { sorting, skipCount, maxResultCount },
      }),
      providesTags: [studentGroupType.studentGroup],
    }),
    assignStudentGroup: builder.mutation({
      query: ({ houseId, studentId }) => ({
        url: `/students/records/${studentId}/houses?houseId=${houseId}`,
        method: 'POST',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    setGroupLeader: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-global-leader`,
        method: 'POST',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    setGroupLeaderAsDivision: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-division-leader`,
        method: 'POST',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    removeDivisionLeader: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-division-leader`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    removeGroupLeader: builder.mutation({
      query: (studentId) => ({
        url: `/students/records/${studentId}/house-global-leader`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    removeStudentFromGroup: builder.mutation({
      query: ({ studentId }) => ({
        url: `/students/records/${studentId}/houses`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
    }),
    deleteGroup: builder.mutation({
      query: (houseSettingId) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: [studentGroupType.studentGroup],
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
