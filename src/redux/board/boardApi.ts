import type { Board } from 'src/types/school';

import { boardType, organizationType, academicCalendarType } from 'src/redux/tagTypes';

import { api } from '../service';

// EducationBoardDto includes the board's own calendar in the scoped hierarchy response.
export interface AcademicHierarchyBoard extends Board {
  startDate: string;
  endDate: string;
}

export const boardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAcademicHierarchy: builder.query<{ items: AcademicHierarchyBoard[] }, string>({
      query: (academicYearId) => ({
        url: '/app/education-board/hierarchy',
        params: { academicYearId },
      }),
      providesTags: [boardType.board],
    }),
    getBoardOptions: builder.query<{ value: number; label: string }[], void>({
      query: () => ({ url: '/app/education-board/options' }),
    }),
    getBoards: builder.query({
      query: () => ({ url: '/app/education-board', redirect: 'follow' }),
      providesTags: [boardType.board],
    }),
    getBoardById: builder.query({
      query: (id) => ({ url: `/app/education-board/${id}` }),
      providesTags: [boardType.board],
    }),
    addBoard: builder.mutation({
      query: (body) => ({
        url: '/app/education-board',
        method: 'POST',
        body,
      }),
      invalidatesTags: [boardType.board, organizationType.academicOrganizationOptions],
    }),
    updateBoard: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/education-board/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [
        boardType.board,
        organizationType.academicOrganizationOptions,
        academicCalendarType.calendar,
        academicCalendarType.calendarDay,
        academicCalendarType.checkDate,
        academicCalendarType.auditLog,
      ],
    }),
    deleteBoard: builder.mutation({
      query: (id) => ({
        url: `/app/education-board/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [boardType.board, organizationType.academicOrganizationOptions],
    }),
  }),
});

export const {
  useGetAcademicHierarchyQuery,
  useGetBoardOptionsQuery,
  useAddBoardMutation,
  useDeleteBoardMutation,
  useGetBoardByIdQuery,
  useGetBoardsQuery,
  useLazyGetBoardByIdQuery,
  useLazyGetBoardsQuery,
  useUpdateBoardMutation,
} = boardApi;
