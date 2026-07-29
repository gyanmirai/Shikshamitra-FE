import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../../academicApi';

import type {
  MessageResponse,
  AssignmentTypeDto,
  AssignmentTypeResponse,
  AssignmentTypeUpsertDto,
  AssignmentTypeListResponse,
  AssignmentTypeCreateResponse,
} from '../contracts';

const ASSIGNMENT_TYPE_LIST_ID = 'LIST';

export const assignmentTypesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignmentTypes: builder.query<AssignmentTypeListResponse, { academicMediumId: string }>({
      query: ({ academicMediumId }) => ({
        url: '/assignment-type',
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: (result) => [
        academicType.assignmentType,
        { type: academicType.assignmentTypeList, id: ASSIGNMENT_TYPE_LIST_ID },
        ...(result?.data.map(({ id }) => ({ type: academicType.assignmentTypeDetail, id })) ?? []),
      ],
    }),

    getAssignmentTypeById: builder.query<
      AssignmentTypeResponse,
      { id: string; academicMediumId: string }
    >({
      query: ({ id, academicMediumId }) => ({
        url: `/assignment-type/${id}`,
        method: 'GET',
        params: { academicMediumId },
      }),
      providesTags: (_result, _error, { id }) => [
        academicType.assignmentType,
        { type: academicType.assignmentTypeDetail, id },
      ],
    }),

    addAssignmentType: builder.mutation<
      AssignmentTypeCreateResponse,
      { academicMediumId: string; data: AssignmentTypeUpsertDto }
    >({
      query: ({ academicMediumId, data }) => ({
        url: '/assignment-type',
        method: 'POST',
        body: data,
        params: { academicMediumId },
      }),
      invalidatesTags: [
        academicType.assignmentType,
        { type: academicType.assignmentTypeList, id: ASSIGNMENT_TYPE_LIST_ID },
        academicType.assignmentList,
      ],
    }),

    updateAssignmentType: builder.mutation<
      MessageResponse,
      { assignmentTypeId: string; academicMediumId: string; data: AssignmentTypeUpsertDto }
    >({
      query: ({ assignmentTypeId, academicMediumId, data }) => ({
        url: `/assignment-type/${assignmentTypeId}`,
        method: 'PUT',
        body: data,
        params: { academicMediumId },
      }),
      invalidatesTags: (_result, _error, { assignmentTypeId }) => [
        academicType.assignmentType,
        { type: academicType.assignmentTypeList, id: ASSIGNMENT_TYPE_LIST_ID },
        { type: academicType.assignmentTypeDetail, id: assignmentTypeId },
        academicType.assignment,
        academicType.assignmentList,
        academicType.assignmentDetail,
      ],
    }),

    deleteAssignmentType: builder.mutation<
      MessageResponse,
      { assignmentTypeId: string; academicMediumId: string }
    >({
      query: ({ assignmentTypeId, academicMediumId }) => ({
        url: `/assignment-type/${assignmentTypeId}`,
        method: 'DELETE',
        params: { academicMediumId },
      }),
      invalidatesTags: (_result, _error, { assignmentTypeId }) => [
        academicType.assignmentType,
        { type: academicType.assignmentTypeList, id: ASSIGNMENT_TYPE_LIST_ID },
        { type: academicType.assignmentTypeDetail, id: assignmentTypeId },
        academicType.assignment,
        academicType.assignmentList,
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAssignmentTypesQuery,
  useGetAssignmentTypeByIdQuery,
  useAddAssignmentTypeMutation,
  useUpdateAssignmentTypeMutation,
  useDeleteAssignmentTypeMutation,
} = assignmentTypesApi;

export type { AssignmentTypeDto };
