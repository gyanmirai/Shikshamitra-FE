import { api } from 'src/redux/service';
import { instituteSetupType } from 'src/redux/tagTypes';

export const roomTypeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRoomTypes: builder.query({
      query: () => ({
        url: '/app/room-type',
        method: 'GET',
      }),
      providesTags: [instituteSetupType.roomTypes],
    }),

    addRoomType: builder.mutation({
      query: (data) => ({
        url: '/app/room-type',
        method: 'POST',
        data,
      }),
      invalidatesTags: [instituteSetupType.roomTypes],
    }),

    getRoomTypeById: builder.query({
      query: (id) => ({
        url: `/app/room-type/${id}`,
        method: 'GET',
      }),
      providesTags: [instituteSetupType.roomTypes],
    }),

    updateRoomType: builder.mutation({
      query: ({ id, body }) => ({
        url: `/app/room-type/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              instituteSetupType.roomTypes,
              instituteSetupType.rooms,
              instituteSetupType.roomDetails,
            ],
    }),

    deleteRoomType: builder.mutation({
      query: (id) => ({
        url: `/app/room-type/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error) =>
        error
          ? []
          : [
              instituteSetupType.roomTypes,
              instituteSetupType.rooms,
              instituteSetupType.roomDetails,
            ],
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
