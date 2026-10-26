import { instituteSetupType } from 'src/redux/tagTypes';

import { instituteSetupApi } from '../instituteSetupApi';

export const roomsApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomImage: builder.query<{ contentType: string; content: string } | null, string>({
      query: (id) => `/institute-setup/rooms/${id}/image`,
      providesTags: [instituteSetupType.rooms],
      keepUnusedDataFor: 0,
    }),
    getRoomFeatures: builder.query<{ items: { id: string; name: string }[] }, void>({
      query: () => '/institute-setup/rooms/features',
      providesTags: [instituteSetupType.rooms],
    }),
    addRoomFeature: builder.mutation<{ id: string; name: string }, { name: string }>({
      query: (body) => ({ url: '/institute-setup/rooms/features', method: 'POST', body }),
      invalidatesTags: [instituteSetupType.rooms],
    }),
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
      invalidatesTags: [instituteSetupType.rooms, instituteSetupType.buildings],
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
      invalidatesTags: [instituteSetupType.rooms, instituteSetupType.buildings],
    }),

    deleteRoom: builder.mutation({
      query: (id) => ({
        url: `/app/room/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [instituteSetupType.rooms, instituteSetupType.buildings],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomImageQuery,
  useGetRoomFeaturesQuery,
  useAddRoomFeatureMutation,
  useGetRoomsQuery,
  useLazyGetRoomsQuery,
  useAddRoomMutation,
  useGetRoomByIdQuery,
  useUpdateRoomMutation,
  useDeleteRoomMutation,
} = roomsApi;
