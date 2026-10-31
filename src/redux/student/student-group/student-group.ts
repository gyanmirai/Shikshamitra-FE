import { api } from 'src/redux/service';
import { studentGroupType } from 'src/redux/tagTypes';

import { houseCatalogueTag } from './house-catalogue-tags';

const catalogueTags = [studentGroupType.studentGroup, houseCatalogueTag];

export const studentGroupApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllGroup: builder.query({
      query: (academicMediumId) => ({
        url: `/students/records/academic-mediums/${academicMediumId}/house-settings`,
        method: 'GET',
      }),
      providesTags: catalogueTags,
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
      invalidatesTags: (_result, error) => (error ? [] : catalogueTags),
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
      invalidatesTags: (_result, error) => (error ? [] : catalogueTags),
    }),
    deleteGroup: builder.mutation({
      query: (houseSettingId) => ({
        url: `/students/records/house-settings/${houseSettingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error) => (error ? [] : catalogueTags),
    }),
  }),
});

export const {
  useAddStudentGroupMutation,
  useGetAllGroupQuery,
  useUpdateStudentGroupMutation,
  useDeleteGroupMutation,
} = studentGroupApi;
