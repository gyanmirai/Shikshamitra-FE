import { academicType } from 'src/redux/tagTypes';
import { AssignmentStatus } from 'src/enums/assignment';

import { academicApi } from '../../academicApi';

import type {
  AssignmentV2Dto,
  GetAssignmentsParams,
  AssignmentV2Response,
  AssignmentMutationArgs,
  AssignmentV2ListResponse,
  AssignmentV2CreateResponse,
  UpdateAssignmentMutationArgs,
  AssignmentStatusUpdateResponse,
} from '../contracts';

const ASSIGNMENT_LIST_ID = 'LIST';

const assignmentInvalidationTags = [
  academicType.assignment,
  { type: academicType.assignmentList, id: ASSIGNMENT_LIST_ID },
  academicType.assignmentSubmissions,
  academicType.chapter,
  academicType.assessmentRubric,
] as const;

export const assignmentApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAssignments: builder.query<AssignmentV2ListResponse, GetAssignmentsParams>({
      query: ({ academicMediumId, ...params }) => ({
        url: '/academic/assignments',
        method: 'GET',
        params: { academicMediumId, ...params },
      }),
      providesTags: (result) => [
        academicType.assignment,
        { type: academicType.assignmentList, id: ASSIGNMENT_LIST_ID },
        ...(result?.items.map(({ id }) => ({ type: academicType.assignmentDetail, id })) ?? []),
      ],
    }),

    getAssignmentById: builder.query<
      AssignmentV2Response,
      { assignmentId: string; academicMediumId?: string }
    >({
      query: ({ assignmentId, academicMediumId }) => ({
        url: `/academic/assignments/${assignmentId}`,
        method: 'GET',
        params: academicMediumId ? { academicMediumId } : undefined,
      }),
      providesTags: (_result, _error, { assignmentId }) => [
        academicType.assignment,
        { type: academicType.assignmentDetail, id: assignmentId },
      ],
    }),

    addAssignment: builder.mutation<AssignmentV2CreateResponse, AssignmentMutationArgs>({
      query: ({ academicMediumId, body }) => ({
        url: '/academic/assignments',
        method: 'POST',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: assignmentInvalidationTags,
    }),

    deleteAssignment: builder.mutation<void, string>({
      query: (assignmentId) => ({
        url: `/academic/assignments/${assignmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, assignmentId) => [
        ...assignmentInvalidationTags,
        { type: academicType.assignmentDetail, id: assignmentId },
      ],
    }),

    updateAssignment: builder.mutation<AssignmentV2Response, UpdateAssignmentMutationArgs>({
      query: ({ assignmentId, academicMediumId, body }) => ({
        url: `/academic/assignments/${assignmentId}`,
        method: 'PUT',
        params: { academicMediumId },
        body,
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        ...assignmentInvalidationTags,
        { type: academicType.assignmentDetail, id: assignmentId },
      ],
    }),

    updateAssignmentStatus: builder.mutation<
      AssignmentStatusUpdateResponse,
      { assignmentId: string; status: AssignmentStatus }
    >({
      query: ({ assignmentId, status }) => ({
        url: `/academic/assignments/${assignmentId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { assignmentId }) => [
        ...assignmentInvalidationTags,
        { type: academicType.assignmentDetail, id: assignmentId },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetAssignmentsQuery,
  useGetAssignmentByIdQuery,
  useAddAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation,
  useUpdateAssignmentStatusMutation,
} = assignmentApi;

export type { AssignmentV2Dto };
