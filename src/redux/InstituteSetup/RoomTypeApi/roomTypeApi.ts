import { instituteSetupApi } from '../instituteSetupApi';

export const roomTypeApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomTypes: builder.query({
      query: () => ({
        url: '/rooms-management/room-types',
        method: 'GET',
      }),
      providesTags: ['RoomTypes'],
    }),

    addRoomType: builder.mutation({
      query: (data) => ({
        url: '/rooms-management/room-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: ['RoomTypes'],
    }),

    getRoomTypeById: builder.query({
      query: (id) => ({
        url: `/rooms-management/room-types/${id}`,
        method: 'GET',
      }),
      providesTags: ['RoomTypes'],
    }),

    updateRoomType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/rooms-management/room-types/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['RoomTypes'],
    }),

    deleteRoomType: builder.mutation({
      query: (id) => ({
        url: `/rooms-management/room-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RoomTypes'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetRoomTypesQuery,
  useAddRoomTypeMutation,
  useUpdateRoomTypeMutation,
  useDeleteRoomTypeMutation,
  useGetRoomTypeByIdQuery,
} = roomTypeApi;
