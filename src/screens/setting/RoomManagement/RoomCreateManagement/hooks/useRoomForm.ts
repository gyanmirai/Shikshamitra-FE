import { useRef } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetRoomTypesQuery } from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';
import {
  useAddRoomMutation,
  useUpdateRoomMutation,
} from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { readRoomImage } from '../services/room-image';
import { roomFormSchema, totalRoomBenches, getRoomFormValues } from '../services/room-layout';

import type { IRoom } from '../types';
import type { RoomFormValues, BuildingOption, RoomTypeOption } from '../types/room-form';

export function useRoomForm(editData: IRoom | null | undefined, onClose: () => void) {
  const buildingsQuery = useGetBuildingsQuery(undefined);
  const typesQuery = useGetRoomTypesQuery(undefined);
  const [addRoom, addState] = useAddRoomMutation();
  const [updateRoom, updateState] = useUpdateRoomMutation();
  const requestPending = useRef(false);
  const buildings: BuildingOption[] = buildingsQuery.data || [];
  const roomTypes: RoomTypeOption[] = typesQuery.data?.items || [];

  const formik = useFormik<RoomFormValues>({
    initialValues: getRoomFormValues(editData),
    validationSchema: roomFormSchema,
    onSubmit: async (values, helpers) => {
      if (requestPending.current) return;
      requestPending.current = true;
      helpers.setStatus(undefined);
      const building = buildings.find((item) => item.id === values.building);
      const floor = building?.floors?.find((item) => item.id === values.floor);
      const roomType = roomTypes.find((item) => item.id === values.roomType);
      const totalBenches = totalRoomBenches(values.columnRows);
      const payload = {
        ...editData,
        roomName: values.roomName.trim(),
        capacity: totalBenches * Number(values.benchCapacity),
        buildingId: values.building,
        buildingName: building?.buildingName || '',
        floorId: values.floor,
        floorName: floor?.floorName || '',
        roomTypeId: values.roomType,
        roomTypeName: roomType?.roomTypeName || '',
        totalBenches,
        benchCapacity: Number(values.benchCapacity),
        columnRows: values.columnRows.map(Number),
        benchesPerRow: Math.max(...values.columnRows.map(Number)),
        benchesPerColumn: Number(values.columns),
        features: values.features,
      };
      try {
        const image = values.imageFile ? await readRoomImage(values.imageFile) : undefined;
        const body = { ...payload, image, removeImage: values.removeImage ?? false };
        if (editData) {
          await updateRoom({
            id: editData.id,
            body: {
              id: editData.id,
              creationTime: editData.creationTime,
              creatorId: editData.creatorId,
              lastModificationTime: editData.lastModificationTime,
              lastModifierId: editData.lastModifierId,
              ...body,
            },
          }).unwrap();
        } else {
          await addRoom(body).unwrap();
        }
        shikshaMitraToast.success({
          message: `"${values.roomName}" Room ${editData ? 'updated' : 'added'} successfully`,
        });
        helpers.resetForm();
        onClose();
      } catch (error) {
        helpers.setStatus(
          parseApiProblemDetail(error).detail || 'Room could not be submitted. Try again.'
        );
      } finally {
        requestPending.current = false;
      }
    },
  });

  return {
    formik,
    buildings,
    roomTypes,
    floors: buildings.find((building) => building.id === formik.values.building)?.floors || [],
    saving: formik.isSubmitting || addState.isLoading || updateState.isLoading,
    loadingOptions: buildingsQuery.isFetching || typesQuery.isFetching,
    optionsError: buildingsQuery.isError || typesQuery.isError,
    retryOptions: () => {
      buildingsQuery.refetch();
      typesQuery.refetch();
    },
  };
}
