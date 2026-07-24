'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { isNaN } from 'lodash';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetLectureSlotsQuery,
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

interface IClassShiftInfo {
  label: string;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
}

const parseShiftTime = (value?: string | null) => {
  if (!value) return null;
  const timeValue = value.length === 5 ? `${value}:00` : value;
  const parsed = dayjs(`2024-01-01T${timeValue}`);
  return parsed.isValid() ? parsed : null;
};

const getClassShiftInfo = (standard?: Standards | null): IClassShiftInfo | null => {
  if (!standard?.shiftId) {
    return null;
  }

  const start = parseShiftTime(standard.shift?.startTime);
  const end = parseShiftTime(standard.shift?.endTime);
  if (!start || !end || !end.isAfter(start)) {
    return {
      label: 'School shift assigned. Timing details are not loaded.',
      start: dayjs('2024-01-01T00:00:00'),
      end: dayjs('2024-01-01T23:59:59'),
    };
  }

  return {
    label: `${standard.shift?.shiftName || 'Assigned shift'} (${start.format('hh:mm A')} - ${end.format(
      'hh:mm A'
    )})`,
    start,
    end,
  };
};

const getClassShiftInfoFromSlot = (slot?: any): IClassShiftInfo | null => {
  if (!slot?.shiftId) {
    return null;
  }

  const start = parseShiftTime(slot.shiftStartTime);
  const end = parseShiftTime(slot.shiftEndTime);
  if (!start || !end || !end.isAfter(start)) {
    return {
      label: slot.shiftTimingLabel || 'School shift assigned. Timing details are not loaded.',
      start: dayjs('2024-01-01T00:00:00'),
      end: dayjs('2024-01-01T23:59:59'),
    };
  }

  return {
    label:
      slot.shiftTimingLabel ||
      `${slot.shiftName || 'Assigned shift'} (${start.format('hh:mm A')} - ${end.format('hh:mm A')})`,
    start,
    end,
  };
};

const getSlotTimingError = (
  slotConfigurations: any[],
  shiftInfo: IClassShiftInfo | null
): string | null => {
  if (!shiftInfo) {
    return 'Please assign the school shift to this class before configuring lecture slots.';
  }

  // Compare time-of-day only (minutes since midnight) to avoid false positives
  // caused by slot times carrying today's date while shiftInfo uses a fixed anchor date.
  const shiftStartMin = shiftInfo.start.hour() * 60 + shiftInfo.start.minute();
  const shiftEndMin = shiftInfo.end.hour() * 60 + shiftInfo.end.minute();

  const outsideShiftSlot = slotConfigurations
    .flatMap((config) => config.timeSlots || [])
    .find((slot) => {
      const start = slot.startTime ? dayjs(slot.startTime) : null;
      const end = slot.endTime ? dayjs(slot.endTime) : null;
      if (!start?.isValid() || !end?.isValid()) return false;
      const startMin = start.hour() * 60 + start.minute();
      const endMin = end.hour() * 60 + end.minute();
      return startMin < shiftStartMin || endMin > shiftEndMin;
    });

  if (outsideShiftSlot) {
    return `Lecture slot timing must be within the class shift timing ${shiftInfo.start.format(
      'hh:mm A'
    )} - ${shiftInfo.end.format('hh:mm A')}.`;
  }

  return null;
};

interface IUseSlotFormParams {
  isEdit?: boolean;
  data?: any;
  handleClose?: (e: any, isSubmit: boolean) => void;
}

export const useSlotForm = ({ isEdit, data, handleClose }: IUseSlotFormParams) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClasses] = useState<string>('');
  const [selectedClassSlotId, setSelectedClassSlotId] = useState<string | undefined>();

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const { data: classesByMedium } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassByMediumQuery,
    params: medium?.id,
    options: { skip: !medium?.id },
  });

  // Edit mode: load the slot being edited
  const { data: lectureSlots, isLoading: isLectureSlotsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotByIdQuery,
    params: data?.id,
    options: { skip: !data?.id },
  });

  // Add mode: all slots list — used to find if selected class already has a slot record
  const { data: allSlotsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id || !!isEdit },
  });

  // Add mode: full details of the selected class's existing slot record
  const { data: existingClassSlotData, isLoading: isExistingSlotLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotByIdQuery,
    params: selectedClassSlotId,
    options: { skip: !selectedClassSlotId || !!isEdit },
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
    const latestClasses = Array.isArray(classesByMedium) ? classesByMedium : [];
    const fallbackClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(latestClasses.length > 0 ? latestClasses : fallbackClasses);
    setClasses('');
  }, [classesByMedium, medium]);

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
      const selectedClass = allClass.find((c) => c.id === values.className);
      const shiftInfo =
        getClassShiftInfo(selectedClass) ||
        getClassShiftInfoFromSlot(isEdit ? lectureSlots : existingClassSlotData);
      const slotTimingError = getSlotTimingError(values.slotConfigurations, shiftInfo);
      if (slotTimingError) {
        shikshaMitraToast.error({ message: slotTimingError });
        return;
      }

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
    if (!formik.values.slotConfigurations?.length && !isExistingSlotLoading) {
      formik.setFieldValue('slotConfigurations', [createDefaultConfig()]);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.slotConfigurations, isExistingSlotLoading]);

  // Add mode: when an existing slot is found for the selected class, pre-populate configs
  useEffect(() => {
    if (!isEdit && selectedClassSlotId && existingClassSlotData) {
      const populated = getInitialValues('', existingClassSlotData);
      formik.setFieldValue('slotConfigurations', populated.slotConfigurations);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingClassSlotData]);

  const handleAddSlotConfiguration = useCallback(() => {
    formik.setFieldValue('slotConfigurations', [
      ...formik.values.slotConfigurations,
      createDefaultConfig(),
    ]);
  }, [formik]);

  // Add mode: when user picks a class, look up its existing slot record and pre-populate
  const handleClassChange = useCallback(
    (classId: string) => {
      formik.setFieldValue('className', classId);
      if (!isEdit) {
        const existing = (allSlotsData?.items ?? []).find((s: any) => s.standardId === classId);
        if (existing?.id) {
          setSelectedClassSlotId(existing.id);
        } else {
          setSelectedClassSlotId(undefined);
          formik.setFieldValue('slotConfigurations', []);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [formik, isEdit, allSlotsData]
  );

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
    (configIndex: number, value: number) => {
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
    },
    [allClass, existingClassSlotData, formik, isEdit, lectureSlots]
  );

  const selectedClass = allClass.find((c) => c.id === formik.values.className);
  const selectedClassShift =
    getClassShiftInfo(selectedClass) ||
    getClassShiftInfoFromSlot(isEdit ? lectureSlots : existingClassSlotData);
  const classShiftMessage = formik.values.className
    ? selectedClassShift?.label ||
      'Please assign the school shift to this class before configuring lecture slots.'
    : 'Select a class to view class timing.';
  const canConfigureSlots = Boolean(selectedClassShift);

  const isSubmitting = useMemo(
    () => isAddLoading || isUpdateLoading,
    [isAddLoading, isUpdateLoading]
  );

  return {
    formik,
    allClass,
    canConfigureSlots,
    classShiftMessage,
    selectedClassShift,
    isLectureSlotsLoading:
      isLectureSlotsLoading || (!!selectedClassSlotId && isExistingSlotLoading),
    isSubmitting,
    handleClassChange,
    handleAddSlotConfiguration,
    handleRemoveSlotConfiguration,
    handleTotalSlotsChange,
  };
};
