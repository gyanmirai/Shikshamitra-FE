import { useRef } from 'react';
import { useFormik } from 'formik';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetRoomTypesQuery } from 'src/redux/InstituteSetup/RoomTypeApi/roomTypeApi';
import {
  useAddRoomMutation,
  useUpdateRoomMutation,
} from 'src/redux/InstituteSetup/RoomApi/RoomApi';

import { useRoomCapacity } from './use-room-capacity';
import { roomFloorLimitCode, getRoomFloorCapacity } from '../services/room-capacity';
import { roomFormSchema, totalRoomBenches, getRoomFormValues } from '../services/room-layout';

import type { IRoom } from '../types';
import type { BuildingOption, RoomFormValues, RoomTypeOption } from '../types/room-form';

export function useRoomForm(editData: IRoom | null | undefined, onClose: () => void) {
  const capacityState = useRoomCapacity(editData);
  const { query: buildingsQuery, buildings } = capacityState;
  const typesQuery = useGetRoomTypesQuery(undefined);
  const [addRoom, addState] = useAddRoomMutation();
  const [updateRoom, updateState] = useUpdateRoomMutation();
  const requestPending = useRef(false);
  const roomTypes: RoomTypeOption[] = typesQuery.data?.items || [];

  const formik = useFormik<RoomFormValues>({
    initialValues: getRoomFormValues(editData),
    validationSchema: roomFormSchema,
    onSubmit: async (values, helpers) => {
      if (
        requestPending.current ||
        buildingsQuery.isFetching ||
        buildingsQuery.isError ||
        capacityState.isBlocked(values)
      )
        return;
      requestPending.current = true;
      helpers.setStatus(undefined);
      const building = buildings.find((item) => item.id === values.building);
      const floor = building?.floors?.find((item) => item.id === values.floor);
      const roomType = roomTypes.find((item) => item.id === values.roomType);
      const totalBenches = totalRoomBenches(values.columnRows, values.benchCapacity);
      const payload = {
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
        benchesPerRow: Math.max(0, ...values.columnRows.map(Number)),
        benchesPerColumn: Number(values.columns),
        features: values.features,
      };
      try {
        const body = {
          ...payload,
          image: values.imageFile,
          removeImage: values.removeImage ?? false,
        };
        if (editData) await updateRoom({ id: editData.id, body }).unwrap();
        else await addRoom(body).unwrap();
        shikshaMitraToast.success({
          message: `"${values.roomName}" Room ${editData ? 'updated' : 'added'} successfully`,
        });
        helpers.resetForm();
        onClose();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        if (problem.errorCode === roomFloorLimitCode) await capacityState.handleConflict(values);
        else helpers.setStatus(problem.detail || 'Room could not be submitted. Try again.');
      } finally {
        requestPending.current = false;
      }
    },
  });

  const refreshBuildings = async () => {
    const result = await capacityState.refresh();
    if (!result.error) {
      const building = (result.data as BuildingOption[] | undefined)?.find(
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
    capacity: getRoomFloorCapacity(buildings, formik.values, editData),
    capacityBlocked: capacityState.isBlocked(formik.values),
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
