import { instituteSetupType } from 'src/redux/tagTypes';

import { instituteSetupApi } from '../instituteSetupApi';

export const roomsApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: () => ({
        url: '/rooms',
        method: 'GET',
      }),
      providesTags: [instituteSetupType.rooms],
    }),

    addRoom: builder.mutation({
      query: (data) => ({
        url: '/rooms',
        method: 'POST',
        data,
      }),
      invalidatesTags: [instituteSetupType.rooms],
    }),

    getRoomById: builder.query({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'GET',
      }),
      providesTags: [instituteSetupType.rooms],
    }),

    updateRoom: builder.mutation({
      query: ({ id, body }) => ({
        url: `/rooms/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [instituteSetupType.rooms],
    }),

    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/rooms/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [instituteSetupType.rooms],
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
