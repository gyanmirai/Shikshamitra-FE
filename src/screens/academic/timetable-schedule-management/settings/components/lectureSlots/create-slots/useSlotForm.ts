'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useMemo, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';

import { getInitialValues } from '../initialValues';
import { getValidationSchema } from '../validationSchema';
import { useSlotFormSync } from './hooks/useSlotFormSync';
import { useClassShiftData } from './hooks/useClassShiftData';
import { useLectureSlotData } from './hooks/useLectureSlotData';
import { useLectureSlotSubmit } from './hooks/useLectureSlotSubmit';
import { generateSlots, createDefaultConfig } from './utils/generateSlots';
import { getClassShiftInfo, getClassShiftInfoFromSlot } from './utils/classShiftTiming';

interface IUseSlotFormParams {
  isEdit?: boolean;
  data?: any;
  handleClose?: (e: any, isSubmit: boolean) => void;
}

const validationSchema = getValidationSchema();

export const useSlotForm = ({ isEdit, data, handleClose }: IUseSlotFormParams) => {
  const [selectedClassSlotId, setSelectedClassSlotId] = useState<string | undefined>();

  const medium = useSelector((state: RootState) => state.globalState.currentMedium) as Medium;
  const { allClass, isClassTimingLoading } = useClassShiftData(medium);
  const {
    allSlotsData,
    existingClassSlotData,
    isExistingSlotLoading,
    isLectureSlotsLoading,
    lectureSlots,
  } = useLectureSlotData({
    dataId: data?.id,
    isEdit,
    mediumId: medium?.id,
    selectedClassSlotId,
  });

  /**
   * Memoization Justification:
   * - Formik reinitializes when this object changes by reference.
   * - Keeping it stable prevents entered slot values from being reset by unrelated query renders.
   */
  const initialValues = useMemo(
    () => getInitialValues('', isEdit ? lectureSlots : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isEdit, lectureSlots]
  );

  const { isSubmitting, submitLectureSlot } = useLectureSlotSubmit({
    allClass,
    dataId: data?.id,
    existingClassSlotData,
    handleClose,
    isEdit,
    lectureSlots,
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: submitLectureSlot,
  });

  useSlotFormSync({
    existingClassSlotData,
    formik,
    isEdit,
    isExistingSlotLoading,
    selectedClassSlotId,
  });

  const handleAddSlotConfiguration = () => {
    formik.setFieldValue('slotConfigurations', [
      ...formik.values.slotConfigurations,
      createDefaultConfig(),
    ]);
  };

  const handleClassChange = (classId: string) => {
    formik.setFieldValue('className', classId);
    if (!isEdit) {
      const existing = (allSlotsData?.items ?? []).find((slot: any) => slot.standardId === classId);
      if (existing?.id) {
        setSelectedClassSlotId(existing.id);
      } else {
        setSelectedClassSlotId(undefined);
        formik.setFieldValue('slotConfigurations', []);
      }
    }
  };

  const handleRemoveSlotConfiguration = (index: number) => {
    if (formik.values.slotConfigurations.length === 1) {
      shikshaMitraToast.error({ message: 'At least one slot configuration is required' });
      return;
    }
    const updated = formik.values.slotConfigurations.filter(
      (_: any, itemIndex: number) => itemIndex !== index
    );
    formik.setFieldValue('slotConfigurations', updated);
  };

  const handleTotalSlotsChange = (configIndex: number, value: number) => {
    formik.setFieldValue(`slotConfigurations[${configIndex}].totalSlots`, value);
    formik.setFieldTouched(`slotConfigurations[${configIndex}].totalSlots`, true, false);

    // Validate the field after value flush
    setTimeout(() => {
      formik.validateField(`slotConfigurations[${configIndex}].totalSlots`);
    }, 0);

    if (isNaN(value) || value < 1 || value > 20) {
      formik.setFieldValue(`slotConfigurations[${configIndex}].timeSlots`, []);
      return;
    }

    const shiftInfo =
      getClassShiftInfo(allClass.find((c) => c.id === formik.values.className)) ||
      getClassShiftInfoFromSlot(isEdit ? lectureSlots : existingClassSlotData);
    formik.setFieldValue(
      `slotConfigurations[${configIndex}].timeSlots`,
      generateSlots(
        value,
        configIndex,
        formik.values.slotConfigurations[configIndex]?.timeSlots,
        shiftInfo?.start
      )
    );
  };

  const selectedClass = allClass.find((c) => c.id === formik.values.className);
  const selectedClassShift =
    getClassShiftInfo(selectedClass) ||
    getClassShiftInfoFromSlot(isEdit ? lectureSlots : existingClassSlotData);
  const classShiftMessage = isClassTimingLoading
    ? 'Refreshing class timing…'
    : formik.values.className
      ? selectedClassShift?.label ||
        'Please assign the school shift to this class before configuring lecture slots.'
      : 'Select a class to view class timing.';
  const canConfigureSlots = Boolean(selectedClassShift) && !isClassTimingLoading;
  return {
    formik,
    allClass,
    canConfigureSlots,
    classShiftMessage,
    selectedClassShift,
    isClassTimingLoading,
    isLectureSlotsLoading:
      isLectureSlotsLoading || (!!selectedClassSlotId && isExistingSlotLoading),
    isSubmitting,
    handleClassChange,
    handleAddSlotConfiguration,
    handleRemoveSlotConfiguration,
    handleTotalSlotsChange,
  };
};
