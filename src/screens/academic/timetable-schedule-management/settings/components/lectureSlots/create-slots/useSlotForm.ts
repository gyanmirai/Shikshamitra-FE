'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddLectureSlotMutation,
  useGetLectureSlotByIdQuery,
  useUpdateLectureSlotMutation,
} from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

import { getInitialValues } from '../initialValues';
import { getValidationSchema } from '../validationSchema';
import { mapSlotConfigurations } from './utils/mapSlotPayload';
import { generateSlots, createDefaultConfig } from './utils/generateSlots';

interface IUseSlotFormParams {
  isEdit?: boolean;
  data?: any;
  handleClose?: (e: any, isSubmit: boolean) => void;
}

export const useSlotForm = ({ isEdit, data, handleClose }: IUseSlotFormParams) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { data: lectureSlots, isLoading: isLectureSlotsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotByIdQuery,
    params: data?.id,
    options: { skip: !data?.id },
  });

  const [addLectureSlot, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddLectureSlotMutation,
  });

  const [updateLectureSlot, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLectureSlotMutation,
  });

  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [medium]);

  const initialValues = useMemo(
    () => getInitialValues(classes, lectureSlots),
    [classes, lectureSlots]
  );

  const validationSchema = useMemo(() => getValidationSchema('07:00 AM', '12:30 PM'), []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const selectedClassName =
        allClass.find((c) => c.id === values.className)?.name || values.className;

      const slotConfigurationsPayload = mapSlotConfigurations(values.slotConfigurations);

      if (isEdit && data?.id) {
        const res = await updateLectureSlot({
          lectureSlotId: data.id,
          body: {
            standardId: values.className,
            previousStandardId: values.previousClassSlots || null,
            slotConfigurations: slotConfigurationsPayload,
          },
        });
        if (res.data) {
          shikshaMitraToast.success({
            message: `Lecture slots have been successfully updated for class ${selectedClassName}.`,
          });
          handleClose?.(null, true);
        }
      } else {
        const res = await addLectureSlot({
          standardId: values.className,
          previousStandardId: values.previousClassSlots || null,
          slotConfigurations: slotConfigurationsPayload,
        });
        if (res.data) {
          shikshaMitraToast.success({
            message: `Lecture slots have been successfully created for class ${selectedClassName}.`,
          });
          handleClose?.(null, true);
        }
      }
    },
  });

  // Ensure at least one slot configuration + one slot on mount
  useEffect(() => {
    if (!formik.values.slotConfigurations?.length) {
      formik.setFieldValue('slotConfigurations', [createDefaultConfig()]);
      return;
    }

    const first = formik.values.slotConfigurations[0];

    if (!first.timeSlots?.length && !first.totalSlots) {
      formik.setFieldValue('slotConfigurations[0].totalSlots', '1');
      formik.setFieldValue('slotConfigurations[0].timeSlots', generateSlots(1, 0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.slotConfigurations]);

  const handleAddSlotConfiguration = useCallback(() => {
    formik.setFieldValue('slotConfigurations', [
      ...formik.values.slotConfigurations,
      createDefaultConfig(),
    ]);
  }, [formik]);

  const handleRemoveSlotConfiguration = useCallback(
    (index: number) => {
      if (formik.values.slotConfigurations.length === 1) {
        shikshaMitraToast.error({ message: 'At least one slot configuration is required' });
        return;
      }
      const updated = formik.values.slotConfigurations.filter((_: any, i: number) => i !== index);
      formik.setFieldValue('slotConfigurations', updated);
    },
    [formik]
  );

  const handleTotalSlotsChange = useCallback(
    (configIndex: number, value: string) => {
      const slotsCount = parseInt(value, 10);

      formik.setFieldValue(`slotConfigurations[${configIndex}].totalSlots`, value);
      formik.setFieldTouched(`slotConfigurations[${configIndex}].totalSlots`, true, false);

      // Validate the field after value flush
      setTimeout(() => {
        formik.validateField(`slotConfigurations[${configIndex}].totalSlots`);
      }, 0);

      if (!value || isNaN(slotsCount) || slotsCount < 1 || slotsCount > 20) {
        formik.setFieldValue(`slotConfigurations[${configIndex}].timeSlots`, []);
        return;
      }

      formik.setFieldValue(
        `slotConfigurations[${configIndex}].timeSlots`,
        generateSlots(slotsCount, configIndex)
      );
    },
    [formik]
  );

  const handleToggleAccordion = useCallback(
    (configIndex: number) => {
      const currentExpanded = formik.values.slotConfigurations[configIndex].expanded;
      formik.setFieldValue(`slotConfigurations[${configIndex}].expanded`, !currentExpanded);
    },
    [formik]
  );

  const isSubmitting = useMemo(
    () => isAddLoading || isUpdateLoading,
    [isAddLoading, isUpdateLoading]
  );

  return {
    formik,
    allClass,
    isLectureSlotsLoading,
    isSubmitting,
    handleAddSlotConfiguration,
    handleRemoveSlotConfiguration,
    handleTotalSlotsChange,
    handleToggleAccordion,
  };
};
