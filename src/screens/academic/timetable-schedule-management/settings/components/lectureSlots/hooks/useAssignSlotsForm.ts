import type { RootState } from 'src/redux/store';
import type { Standards } from 'src/types/school';

import * as Yup from 'yup';
import { useRef } from 'react';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetClassByMediumQuery } from 'src/redux/class/classApi';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useAcademicSetupFormState } from 'src/screens/academic/setup/embedding';
import {
  useGetLectureSlotsQuery,
  useAssignLectureSlotToClassesMutation,
} from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

export interface AssignSlotsProps {
  onClose: (event: null, isSubmit: boolean) => void;
  lectureSlotId?: string;
  sourceClassName?: string;
  onStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
}

export function useAssignSlotsForm({ onClose, lectureSlotId, onStateChange }: AssignSlotsProps) {
  const submitting = useRef(false);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const classesQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassByMediumQuery,
    params: medium?.id,
    options: { skip: !medium?.id },
    popupConfig: { error: false },
  });
  const slotsQuery = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
    popupConfig: { error: false },
  });
  const [assignLectureSlot, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignLectureSlotToClassesMutation,
    popupConfig: { error: false },
  });
  const classes: Standards[] = Array.isArray(classesQuery.currentData)
    ? classesQuery.currentData
    : [];
  const configuredIds = new Set<string>(
    (slotsQuery.currentData?.items ?? []).map((slot: { standardId: string }) => slot.standardId)
  );
  const options = classes.map((standard) => ({
    id: standard.id,
    name: standard.name,
    disabledReason: !standard.shiftId
      ? 'School shift not assigned'
      : configuredIds.has(standard.id)
        ? 'Already configured'
        : '',
  }));
  const disabledIds = options.filter((option) => option.disabledReason).map((option) => option.id);
  const loading = Boolean(medium?.id && (classesQuery.isFetching || slotsQuery.isFetching));
  const loadError = Boolean(classesQuery.isError || slotsQuery.isError);
  const ready = Boolean(
    medium?.id &&
    lectureSlotId &&
    classesQuery.isSuccess &&
    slotsQuery.isSuccess &&
    !loading &&
    !loadError
  );
  const hasEligibleClasses = options.some((option) => !option.disabledReason);
  const formik = useFormik({
    initialValues: { classNames: [] as string[] },
    validationSchema: Yup.object({
      classNames: Yup.array().min(1, 'Please select at least one class'),
    }),
    onSubmit: async (values, helpers) => {
      if (submitting.current || !ready || !hasEligibleClasses) return;
      if (
        values.classNames.some(
          (id) => !options.some((option) => option.id === id && !option.disabledReason)
        )
      ) {
        helpers.setFieldError('classNames', 'Select available target classes before submitting.');
        return;
      }
      submitting.current = true;
      helpers.setStatus(undefined);
      try {
        const result = await assignLectureSlot({
          lectureSlotId,
          body: { selectedStandardIds: values.classNames },
        });
        if (result.error) {
          const { detail } = parseApiProblemDetail(result.error);
          helpers.setStatus(
            detail && detail !== 'Something went wrong'
              ? detail
              : 'Lecture slots could not be assigned. Your selection is retained. Try submitting again.'
          );
          return;
        }
        shikshaMitraToast.success({ message: 'Slots assigned successfully.' });
        helpers.resetForm();
        onClose(null, true);
      } catch {
        helpers.setStatus(
          'Lecture slots could not be assigned. Your selection is retained. Try submitting again.'
        );
      } finally {
        submitting.current = false;
      }
    },
  });
  const busy = isLoading || formik.isSubmitting;
  useAcademicSetupFormState({ dirty: formik.dirty, busy }, onStateChange);
  return {
    formik,
    busy,
    options,
    disabledIds,
    loading,
    loadError,
    ready,
    hasEligibleClasses,
    hasMedium: Boolean(medium?.id),
    hasSource: Boolean(lectureSlotId),
    refresh: () => {
      if (!medium?.id || busy) return;
      classesQuery.refetch();
      slotsQuery.refetch();
    },
  };
}
