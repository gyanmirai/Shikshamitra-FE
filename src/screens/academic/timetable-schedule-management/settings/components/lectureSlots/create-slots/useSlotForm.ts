'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
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

const computeSchoolHours = (slotConfigurations: any[]): string => {
  let minStartMins = Infinity;
  let maxEndMins = -Infinity;

  slotConfigurations.forEach((config) => {
    (config.timeSlots || []).forEach((slot: any) => {
      const start = slot.startTime ? dayjs(slot.startTime) : null;
      const end = slot.endTime ? dayjs(slot.endTime) : null;
      if (start?.isValid()) {
        const mins = start.hour() * 60 + start.minute();
        if (mins < minStartMins) minStartMins = mins;
      }
      if (end?.isValid()) {
        const mins = end.hour() * 60 + end.minute();
        if (mins > maxEndMins) maxEndMins = mins;
      }
    });
  });

  if (!Number.isFinite(minStartMins) || !Number.isFinite(maxEndMins)) return '';

  const fmt = (totalMins: number) =>
    dayjs()
      .hour(Math.floor(totalMins / 60))
      .minute(totalMins % 60)
      .format('hh:mm A');

  return `${fmt(minStartMins)} - ${fmt(maxEndMins)}`;
};

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
    () => getInitialValues(classes, isEdit ? lectureSlots : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [classes, isEdit, lectureSlots]
  );

  const validationSchema = useMemo(() => getValidationSchema(), []);

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const selectedClassName =
        allClass.find((c) => c.id === values.className)?.name || values.className;

      const slotConfigurationsPayload = mapSlotConfigurations(values.slotConfigurations);
      const schoolHours = computeSchoolHours(values.slotConfigurations);

      if (isEdit && data?.id) {
        const res = await updateLectureSlot({
          lectureSlotId: data.id,
          body: {
            standardId: values.className,
            previousStandardId: values.previousClassSlots || null,
            schoolHours,
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
          schoolHours,
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
