import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetRoomTypesQuery } from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';
import { useGetBuildingsQuery } from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';
import {
  useAddRoomMutation,
  useUpdateRoomMutation,
} from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { readRoomImage } from '../services/room-image';
import { roomFloorLimitCode, getRoomFloorCapacity } from '../services/room-capacity';
import { roomFormSchema, totalRoomBenches, getRoomFormValues } from '../services/room-layout';

import type { IRoom } from '../types';
import type { RoomFormValues, BuildingOption, RoomTypeOption } from '../types/room-form';

export function useRoomForm(editData: IRoom | null | undefined, onClose: () => void) {
  const buildingsQuery = useGetBuildingsQuery(undefined);
  const typesQuery = useGetRoomTypesQuery(undefined);
  const [addRoom, addState] = useAddRoomMutation();
  const [updateRoom, updateState] = useUpdateRoomMutation();
  const requestPending = useRef(false);
  const [rejectedFloor, setRejectedFloor] = useState<{ building: string; floor: string }>();
  const buildings: BuildingOption[] = buildingsQuery.data || [];
  const roomTypes: RoomTypeOption[] = typesQuery.data?.items || [];

  const formik = useFormik<RoomFormValues>({
    initialValues: getRoomFormValues(editData),
    validationSchema: roomFormSchema,
    onSubmit: async (values, helpers) => {
      if (
        requestPending.current ||
        buildingsQuery.isFetching ||
        buildingsQuery.isError ||
        getRoomFloorCapacity(buildings, values, editData)?.isFull ||
        (rejectedFloor?.building === values.building && rejectedFloor?.floor === values.floor)
      )
        return;
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
        const problem = parseApiProblemDetail(error);
        if (problem.errorCode === roomFloorLimitCode) {
          setRejectedFloor({ building: values.building, floor: values.floor });
          const refreshed = await buildingsQuery.refetch();
          const latest = getRoomFloorCapacity(refreshed.data || [], values, editData);
          if (
            !refreshed.error &&
            latest?.hasCounts &&
            latest.floor.roomCount! < latest.floor.totalRoom!
          ) {
            setRejectedFloor(undefined);
          }
        } else helpers.setStatus(problem.detail || 'Room could not be submitted. Try again.');
      } finally {
        requestPending.current = false;
      }
    },
  });

  const capacity = getRoomFloorCapacity(buildings, formik.values, editData);
  const capacityBlocked = Boolean(
    capacity?.isFull ||
    (rejectedFloor?.building === formik.values.building &&
      rejectedFloor?.floor === formik.values.floor)
  );
  const refreshBuildings = async () => {
    const result = await buildingsQuery.refetch();
    if (!result.error) {
      setRejectedFloor(undefined);
      const building = (result.data as BuildingOption[]).find(
        (item) => item.id === formik.values.building
      );
      if (!building) formik.setFieldValue('building', '');
      if (!building?.floors.some((floor) => floor.id === formik.values.floor)) {
        formik.setFieldValue('floor', '');
      }
    }
  };

  return {
    formik,
    buildings,
    roomTypes,
    capacity,
    capacityBlocked,
    refreshBuildings,
    floors: buildings.find((building) => building.id === formik.values.building)?.floors || [],
    saving: formik.isSubmitting || addState.isLoading || updateState.isLoading,
    loadingOptions: buildingsQuery.isFetching || typesQuery.isFetching,
    optionsError: buildingsQuery.isError || typesQuery.isError,
    retryOptions: () => {
      refreshBuildings();
      typesQuery.refetch();
    },
  };
}
