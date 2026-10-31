import { api } from 'src/redux/service';
import { studentType } from 'src/redux/tagTypes';

import { unwrapRecordsResult } from '../records/student-records-api';
import { houseCatalogueTag } from '../student-group/house-catalogue-tags';

import type {
  House,
  SaveHouse,
  HousePage,
  HouseQuery,
  HouseStudent,
  HouseDivision,
  HouseAssignment,
  HouseLeaderCommand,
  HouseCataloguePage,
  HouseAssignmentPreview,
} from './house-management-types';

const root = '/students/records/house-management';
const tags = [{ type: studentType.student, id: 'HOUSE-MANAGEMENT' }];
const catalogueTags = [...tags, houseCatalogueTag];
const unwrap = <T>(response: T | { data?: T }) => unwrapRecordsResult(response);
export const houseManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getManagedHouses: builder.query<HouseCataloguePage, HouseQuery>({
      query: (params) => ({ url: `${root}/houses`, params }),
      transformResponse: unwrap<HouseCataloguePage>,
      providesTags: catalogueTags,
    }),
    getHouseStudents: builder.query<HousePage<HouseStudent>, HouseQuery>({
      query: (params) => ({ url: `${root}/students`, params }),
      transformResponse: unwrap<HousePage<HouseStudent>>,
      providesTags: catalogueTags,
    }),
    getHouseDivisions: builder.query<HousePage<HouseDivision>, HouseQuery>({
      query: (params) => ({ url: `${root}/divisions`, params }),
      transformResponse: unwrap<HousePage<HouseDivision>>,
      providesTags: catalogueTags,
    }),
    createManagedHouse: builder.mutation<House, SaveHouse>({
      query: (body) => ({ url: `${root}/houses`, method: 'POST', body }),
      transformResponse: unwrap<House>,
      invalidatesTags: (_result, error) => (error ? [] : catalogueTags),
    }),
    updateManagedHouse: builder.mutation<
      House,
      SaveHouse & { id: string; concurrencyStamp: string }
    >({
      query: ({ id, ...body }) => ({ url: `${root}/houses/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<House>,
      invalidatesTags: (_result, error) => (error ? [] : catalogueTags),
    }),
    deleteManagedHouse: builder.mutation<
      void,
      { id: string; academicMediumId: string; concurrencyStamp: string }
    >({
      query: ({ id, ...params }) => ({ url: `${root}/houses/${id}`, method: 'DELETE', params }),
      invalidatesTags: (_result, error) => (error ? [] : catalogueTags),
    }),
    previewHouseAssignment: builder.mutation<HouseAssignmentPreview, HouseAssignment>({
      query: (body) => ({ url: `${root}/assignments/preview`, method: 'POST', body }),
      transformResponse: unwrap<HouseAssignmentPreview>,
    }),
    commitHouseAssignment: builder.mutation<void, HouseAssignment & { previewToken: string }>({
      query: (body) => ({ url: `${root}/assignments/commit`, method: 'POST', body }),
      invalidatesTags: (_result, error) => (error ? [] : tags),
    }),
    setHouseLeader: builder.mutation<void, HouseLeaderCommand>({
      query: ({ id, ...body }) => ({ url: `${root}/houses/${id}/leader`, method: 'PUT', body }),
      invalidatesTags: (_result, error) => (error ? [] : tags),
    }),
    setDivisionLeader: builder.mutation<void, HouseLeaderCommand>({
      query: ({ id, ...body }) => ({ url: `${root}/divisions/${id}/leader`, method: 'PUT', body }),
      invalidatesTags: (_result, error) => (error ? [] : tags),
    }),
  }),
});
export const {
  useGetManagedHousesQuery,
  useLazyGetManagedHousesQuery,
  useGetHouseStudentsQuery,
  useLazyGetHouseStudentsQuery,
  useGetHouseDivisionsQuery,
  useCreateManagedHouseMutation,
  useUpdateManagedHouseMutation,
  useDeleteManagedHouseMutation,
  usePreviewHouseAssignmentMutation,
  useCommitHouseAssignmentMutation,
  useSetHouseLeaderMutation,
  useSetDivisionLeaderMutation,
} = houseManagementApi;
