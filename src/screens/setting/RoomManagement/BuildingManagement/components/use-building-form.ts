import { useFormik, yupToFormErrors } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useAddBuildingMutation,
  useGetBuildingByIdQuery,
  useUpdateBuildingMutation,
} from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { createBuildingValidationSchema } from './validationSchema';
import { getFloorRoomLimitFailure } from '../services/floor-room-capacity';
import { buildingPayload, getBuildingInitialValues } from './initialValues';

import type { IBuilding, IBuildingFormProps } from '../types';

export function useBuildingForm({ editData, onClose, onBusyChange }: IBuildingFormProps) {
  const [initialValues] = useState(() => getBuildingInitialValues(editData));
  const [conflictCounts, setConflictCounts] = useState<Record<string, number>>({});
  const usage = useGetBuildingByIdQuery(editData?.id, {
    skip: !editData,
    refetchOnMountOrArgChange: true,
  });
  const currentBuilding = usage.currentData as IBuilding | undefined;
  const floors = (currentBuilding?.floors ?? editData?.floors ?? []).map((floor) => ({
    ...floor,
    roomCount: conflictCounts[floor.id] ?? floor.roomCount,
  }));
  const [addBuilding] = useAddBuildingMutation();
  const [updateBuilding] = useUpdateBuildingMutation();
  const saving = useRef(false);
  const focusedSubmit = useRef(0);
  const formik = useFormik({
    initialValues,
    validationSchema: createBuildingValidationSchema(floors),
    async onSubmit(values, helpers) {
      if (saving.current || (editData && (usage.isFetching || usage.isError))) return;
      saving.current = true;
      onBusyChange?.(true);
      helpers.setStatus(undefined);
      try {
        const payload = buildingPayload(values, editData);
        if (editData) await updateBuilding({ id: editData.id, body: payload }).unwrap();
        else await addBuilding(payload).unwrap();
        helpers.resetForm({ values });
        shikshaMitraToast.success({
          message: `"${values.buildingName.trim()}" Building ${editData ? 'updated' : 'added'} successfully`,
        });
        onClose(null, true);
      } catch (error) {
        const conflict = getFloorRoomLimitFailure(error, values.floors);
        if (conflict) {
          setConflictCounts((counts) => ({ ...counts, [conflict.floorId]: conflict.roomCount }));
          helpers.setFieldError(`floors.${conflict.index}.totalRoom`, conflict.message);
          helpers.setFieldTouched(`floors.${conflict.index}.totalRoom`, true, false);
          return;
        }
        const message =
          parseApiProblemDetail(error).detail || 'Unable to save the building. Try again.';
        helpers.setStatus(message);
        shikshaMitraToast.error({ message });
      } finally {
        saving.current = false;
        onBusyChange?.(false);
      }
    },
  });

  const refreshUsage = async () => {
    const result = await usage.refetch();
    if (result.isError || !result.data) return;
    const refreshedBuilding = result.data as IBuilding;
    setConflictCounts({});
    const errors = await createBuildingValidationSchema(refreshedBuilding.floors)
      .validate(formik.values, { abortEarly: false })
      .then(() => ({}))
      .catch(yupToFormErrors);
    formik.setErrors(errors);
  };

  useEffect(() => {
    if (formik.isSubmitting || !formik.submitCount || formik.isValid) return;
    if (focusedSubmit.current === formik.submitCount) return;
    focusedSubmit.current = formik.submitCount;
    document
      .querySelector<HTMLElement>(
        '[data-building-form] [aria-invalid="true"], [data-building-form] [aria-describedby="building-floors-error"]'
      )
      ?.focus();
  }, [formik.isSubmitting, formik.submitCount, formik.isValid]);

  return {
    ...formik,
    loadingUsage: Boolean(editData && usage.isFetching),
    usageError: Boolean(editData && usage.isError),
    refreshUsage,
  };
}
