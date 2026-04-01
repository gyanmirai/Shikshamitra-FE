import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export const lectureSlotsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getLectureSlotsByMedium: builder.query({
      query: (mediumId) => ({
        url: `academics/timetable/lecture-slots/by-medium/${mediumId}`,
        method: 'GET',
      }),
      providesTags: [academicType.lectureSlot],
    }),

    addLectureSlot: builder.mutation({
      query: (body) => ({
        url: 'academics/timetable/lecture-slots',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [academicType.lectureSlot],
    }),

    getLectureSlotById: builder.query({
      query: (lectureSlotId) => ({
        url: `academics/timetable/lecture-slots/${lectureSlotId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: academicType.lectureSlot, id }],
    }),

    updateLectureSlot: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `academics/timetable/lecture-slots/${lectureSlotId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (result, error, { lectureSlotId }) => [
        academicType.lectureSlot,
        { type: academicType.lectureSlot, id: lectureSlotId },
      ],
    }),

    assignLectureSlotToClasses: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `academics/timetable/lecture-slots/${lectureSlotId}/assign`,
        method: 'POST',
        data: body,
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
} = lectureSlotsApi;
