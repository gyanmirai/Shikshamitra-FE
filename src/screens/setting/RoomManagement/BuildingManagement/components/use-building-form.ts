import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useAddBuildingMutation,
  useUpdateBuildingMutation,
} from 'src/redux/InstituteSetup/BuildingApi/BuildingApi';

import { buildingValidationSchema } from './validationSchema';
import { buildingPayload, getBuildingInitialValues } from './initialValues';

import type { IBuildingFormProps } from '../types';

export function useBuildingForm({ editData, onClose, onBusyChange }: IBuildingFormProps) {
  const [initialValues] = useState(() => getBuildingInitialValues(editData));
  const [addBuilding] = useAddBuildingMutation();
  const [updateBuilding] = useUpdateBuildingMutation();
  const saving = useRef(false);
  const formik = useFormik({
    initialValues,
    validationSchema: buildingValidationSchema,
    async onSubmit(values, helpers) {
      if (saving.current) return;
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

  useEffect(() => {
    if (formik.isSubmitting || !formik.submitCount || formik.isValid) return;
    document
      .querySelector<HTMLElement>(
        '[data-building-form] [aria-invalid="true"], [data-building-form] [aria-describedby="building-floors-error"]'
      )
      ?.focus();
  }, [formik.isSubmitting, formik.submitCount, formik.isValid]);

  return formik;
}
