import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';

export const weeklyLecturesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklyLectureSlots: builder.query({
      query: (params) => ({
        url: 'weekly-lecture-slots',
        method: 'GET',
        params: params || {},
      }),
      providesTags: [academicType.weeklyLectureSlot],
    }),

    createWeeklyLectureSlot: builder.mutation({
      query: (body) => ({
        url: 'weekly-lecture-slots',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: [academicType.weeklyLectureSlot],
    }),

    getStandardsByEducationMedium: builder.query({
      query: (educationMediumId) => ({
        url: `standards/${educationMediumId}`,
        method: 'GET',
      }),
      providesTags: [academicType.standard],
    }),

    getWeeklyLectureSlotById: builder.query({
      query: (lectureSlotId) => ({
        url: `weekly-lecture-slots/${lectureSlotId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: academicType.weeklyLectureSlot, id }],
    }),

    updateWeeklyLectureSlot: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `weekly-lecture-slots/${lectureSlotId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (result, error, { lectureSlotId }) => [
        academicType.weeklyLectureSlot,
        { type: academicType.weeklyLectureSlot, id: lectureSlotId },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWeeklyLectureSlotsQuery,
  useCreateWeeklyLectureSlotMutation,
  useGetStandardsByEducationMediumQuery,
  useGetWeeklyLectureSlotByIdQuery,
  useUpdateWeeklyLectureSlotMutation,
} = weeklyLecturesApi;
