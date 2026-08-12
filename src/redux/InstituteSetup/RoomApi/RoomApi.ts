import { instituteSetupType } from 'src/redux/tagTypes';

import { instituteSetupApi } from '../instituteSetupApi';

export const roomsApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getRooms: builder.query({
      query: (params) => ({
        url: '/app/room',
        method: 'GET',
        params,
      }),
      providesTags: [instituteSetupType.rooms],
    }),

    addRoom: builder.mutation({
      query: (data) => ({
        url: '/app/room',
        method: 'POST',
        data,
      }),
      invalidatesTags: [instituteSetupType.rooms],
    }),

    getRoomById: builder.query({
      query: (id) => ({
        url: `/app/room/${id}`,
        method: 'GET',
      }),
      providesTags: [instituteSetupType.rooms],
    }),

    updateRoom: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/room/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [instituteSetupType.rooms],
    }),

    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/app/room/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [instituteSetupType.rooms],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomsQuery,
  useLazyGetRoomsQuery,
  useAddRoomMutation,
  useGetRoomByIdQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;
