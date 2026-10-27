import type { IRoom } from 'src/screens/setting/RoomManagement/RoomCreateManagement/types';

import { instituteSetupType } from 'src/redux/tagTypes';

import { roomFormData } from './room-contracts';
import { instituteSetupApi } from '../instituteSetupApi';

import type { RoomPage, RoomSaveInput, RoomListParams } from './room-contracts';

export const roomsApi = instituteSetupApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoomImage: builder.query<Blob, string>({
      query: (id) => ({
        url: `/institute-setup/rooms/${id}/image/file`,
        responseHandler: async (response) => (response.ok ? response.blob() : response.json()),
      }),
      providesTags: (_result, _error, id) => [{ type: instituteSetupType.roomImages, id }],
      keepUnusedDataFor: 0,
    }),
    getRoomFeatures: builder.query<{ items: { id: string; name: string }[] }, void>({
      query: () => '/institute-setup/rooms/features',
      providesTags: [instituteSetupType.roomFeatures],
    }),
    addRoomFeature: builder.mutation<{ id: string; name: string }, { name: string }>({
      query: (body) => ({ url: '/institute-setup/rooms/features', method: 'POST', body }),
      invalidatesTags: (_result, error) => (error ? [] : [instituteSetupType.roomFeatures]),
    }),
    getRooms: builder.query<RoomPage, RoomListParams | void>({
      query: (params) => ({
        url: '/app/room',
        method: 'GET',
        params: params || undefined,
      }),
      providesTags: [instituteSetupType.rooms],
    }),

    addRoom: builder.mutation<IRoom, RoomSaveInput>({
      query: (data) => ({
        url: '/institute-setup/rooms',
        method: 'POST',
        body: roomFormData(data),
      }),
      invalidatesTags: (_result, error) =>
        error ? [] : [instituteSetupType.rooms, instituteSetupType.buildings],
    }),

    getRoomById: builder.query<IRoom, string>({
      query: (id) => ({
        url: `/app/room/${id}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, id) => [{ type: instituteSetupType.roomDetails, id }],
    }),

    updateRoom: builder.mutation<IRoom, { id: string; body: RoomSaveInput }>({
      query: ({ id, body }) => ({
        url: `/institute-setup/rooms/${id}`,
        method: 'PUT',
        body: roomFormData(body),
      }),
      invalidatesTags: (_result, error, { id }) =>
        error
          ? []
          : [
              instituteSetupType.rooms,
              instituteSetupType.buildings,
              { type: instituteSetupType.roomDetails, id },
              { type: instituteSetupType.roomImages, id },
            ],
    }),

    deleteRoom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/app/room/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, error, id) =>
        error
          ? []
          : [
              instituteSetupType.rooms,
              instituteSetupType.buildings,
              { type: instituteSetupType.roomDetails, id },
              { type: instituteSetupType.roomImages, id },
            ],
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
