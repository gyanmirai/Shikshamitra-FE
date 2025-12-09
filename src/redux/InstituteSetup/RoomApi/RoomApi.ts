import { instituteSetupApi } from '../instituteSetupApi';

export const roomsApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: () => ({
        url: '/rooms',
        method: 'GET',
      }),
      providesTags: ['Rooms'],
    }),

    addRoom: builder.mutation({
      query: (data) => ({
        url: '/rooms',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['Rooms'],
    }),

    getRoomById: builder.query({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'GET',
      }),
      providesTags: ['Rooms'],
    }),

    updateRoom: builder.mutation({
      query: ({ id, body }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Rooms'],
    }),

    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Rooms'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomsQuery,
  useAddRoomMutation,
  useGetRoomByIdQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;
