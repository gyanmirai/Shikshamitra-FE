import { academicApi } from '../academicApi';

export const lectureSlotsApi = academicApi.injectEndpoints({
  endpoints: (builder) => ({
    getLectureSlotsByMedium: builder.query({
      query: (mediumId) => ({
        url: `academics/timetable/lecture-slots/by-medium/${mediumId}`,
        method: 'GET',
      }),
      providesTags: ['LectureSlot'],
    }),

    addLectureSlot: builder.mutation({
      query: (body) => ({
        url: 'academics/timetable/lecture-slots',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['LectureSlot'],
    }),

    getLectureSlotById: builder.query({
      query: (lectureSlotId) => ({
        url: `academics/timetable/lecture-slots/${lectureSlotId}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'LectureSlot', id }],
    }),

    updateLectureSlot: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `academics/timetable/lecture-slots/${lectureSlotId}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: (result, error, { lectureSlotId }) => [
        'LectureSlot',
        { type: 'LectureSlot', id: lectureSlotId },
      ],
    }),

    assignLectureSlotToClasses: builder.mutation({
      query: ({ lectureSlotId, body }) => ({
        url: `academics/timetable/lecture-slots/${lectureSlotId}/assign`,
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['LectureSlot'],
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
