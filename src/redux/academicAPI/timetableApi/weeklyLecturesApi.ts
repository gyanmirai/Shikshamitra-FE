import { academicType } from 'src/redux/tagTypes';

import { academicApi } from '../academicApi';
import { fetchAllTimetableSettings } from './fetchAllTimetableSettings';

export const weeklyLecturesApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getWeeklyLectureSlots: builder.query({
      queryFn: ({ AcademicMediumId }: { AcademicMediumId: string }, _api, _options, baseQuery) =>
        fetchAllTimetableSettings(
          baseQuery,
          '/academics/timetable/settings/weekly-lecture-slots',
          AcademicMediumId
        ),
      providesTags: [academicType.weeklyLectureSlot],
    }),

    createWeeklyLectureSlot: builder.mutation({
      query: ({ academicMediumId, standardId, subjects }) => ({
        url: '/academics/timetable/settings/weekly-lecture-slots',
        method: 'POST',
        params: { academicMediumId },
        body: { standardId, subjects },
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
        url: `/academics/timetable/settings/weekly-lecture-slots/${lectureSlotId}`,
        method: 'GET',
      }),
      providesTags: [academicType.weeklyLectureSlot],
    }),

    updateWeeklyLectureSlot: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `/academics/timetable/settings/weekly-lecture-slots/${lectureSlotId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [academicType.weeklyLectureSlot],
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
