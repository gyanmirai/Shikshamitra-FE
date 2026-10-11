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
    addStudentGroup: builder.mutation({
      query: ({ academicMediumId, body }) => ({
        url: `/students/records/academic-mediums/${academicMediumId}/house-settings`,
        method: 'POST',
        body,
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
        body,
        headers: {
          'Content-Type': 'application/json',
        },
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
  useGetAllGroupQuery,
  useUpdateStudentGroupMutation,
  useDeleteGroupMutation,
} = studentGroupApi;
