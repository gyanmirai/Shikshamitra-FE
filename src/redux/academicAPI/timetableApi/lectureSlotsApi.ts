import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export const lectureSlotsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getLectureSlotsByMedium: builder.query({
      query: (mediumId) => ({
        url: `/academics/timetable/lecture-slots/by-medium/${mediumId}`,
        method: 'GET',
      }),
      providesTags: [academicType.lectureSlot],
    }),

    addLectureSlot: builder.mutation({
      query: (body) => ({
        url: '/academics/timetable/settings/lecture-slots',
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lectureSlot],
    }),

    getLectureSlots: builder.query({
      query: ({ AcademicMediumId }: { AcademicMediumId: string }) => ({
        url: '/academics/timetable/settings/lecture-slots',
        method: 'GET',
        params: { AcademicMediumId },
      }),
      providesTags: [academicType.lectureSlot],
    }),

    getLectureSlotById: builder.query({
      query: (lectureSlotId) => ({
        url: `/academics/timetable/settings/lecture-slots/${lectureSlotId}`,
        method: 'GET',
      }),
      providesTags: [academicType.lectureSlot],
    }),

    updateLectureSlot: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `/academics/timetable/settings/lecture-slots/${lectureSlotId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.lectureSlot],
    }),

    assignLectureSlotToClasses: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `academics/timetable/settings/lecture-slots/${lectureSlotId}/assign`,
        method: 'POST',
        body,
      }),
      invalidatesTags: [academicType.lectureSlot],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLectureSlotsByMediumQuery,
  useAddLectureSlotMutation,
  useGetLectureSlotByIdQuery,
  useUpdateLectureSlotMutation,
  useAssignLectureSlotToClassesMutation,
  useGetLectureSlotsQuery,
} = lectureSlotsApi;
