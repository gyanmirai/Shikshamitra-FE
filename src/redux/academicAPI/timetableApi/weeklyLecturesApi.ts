import { academicApi } from '../academicApi';

export const weeklyLecturesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklyLectureSlots: builder.query({
      query: (params) => ({
        url: 'weekly-lecture-slots',
        method: 'GET',
        params: params || {},
      }),
      providesTags: ['WeeklyLectureSlot'],
    }),

    createWeeklyLectureSlot: builder.mutation({
      query: (body) => ({
        url: 'weekly-lecture-slots',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['WeeklyLectureSlot'],
    }),

    getStandardsByEducationMedium: builder.query({
      query: (educationMediumId) => ({
        url: `standards/${educationMediumId}`,
        method: 'GET',
      }),
      providesTags: ['Standard'],
    }),

    getWeeklyLectureSlotById: builder.query({
      query: (lectureSlotId) => ({
        url: `weekly-lecture-slots/${lectureSlotId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'WeeklyLectureSlot', id }],
    }),

    updateWeeklyLectureSlot: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `weekly-lecture-slots/${lectureSlotId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (result, error, { lectureSlotId }) => [
        'WeeklyLectureSlot',
        { type: 'WeeklyLectureSlot', id: lectureSlotId },
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
