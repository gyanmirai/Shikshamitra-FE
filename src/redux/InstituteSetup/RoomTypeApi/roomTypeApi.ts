import { instituteSetupApi } from '../instituteSetupApi';
import { instituteSetupType } from 'src/redux/tagTypes';


export const roomTypeApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomTypes: builder.query({
      query: () => ({
        url: '/rooms-management/room-types',
        method: 'GET',
      }),
      providesTags: [instituteSetupType.roomTypes],
    }),

    addRoomType: builder.mutation({
      query: (data) => ({
        url: '/rooms-management/room-types',
        method: 'POST',
        data,
      }),
      invalidatesTags: [instituteSetupType.roomTypes],
    }),

    getRoomTypeById: builder.query({
      query: (id) => ({
        url: `/rooms-management/room-types/${id}`,
        method: 'GET',
      }),
      providesTags: [instituteSetupType.roomTypes],
    }),

    updateRoomType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/rooms-management/room-types/${id}`,
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: [instituteSetupType.roomTypes],
    }),

    deleteRoomType: builder.mutation({
      query: (id) => ({
        url: `/rooms-management/room-types/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [instituteSetupType.roomTypes],
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
  useLazyGetRoomTypesQuery,
} = roomTypeApi;
