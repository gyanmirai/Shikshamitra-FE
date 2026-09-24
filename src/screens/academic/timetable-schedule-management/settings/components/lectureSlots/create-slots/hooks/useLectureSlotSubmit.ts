import type { Standards } from 'src/types/school';

import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useAddLectureSlotMutation,
  useUpdateLectureSlotMutation,
} from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

import { mapSlotConfigurations } from '../utils/mapSlotPayload';
import { computeSchoolHours } from '../utils/computeSchoolHours';
import {
  getClassShiftInfo,
  getSlotTimingError,
  getClassShiftInfoFromSlot,
} from '../utils/classShiftTiming';

import type { LectureSlotShift } from '../utils/classShiftTiming';

interface SlotFormValues {
  className: string;
  previousClassSlots: string;
  slotConfigurations: Parameters<typeof mapSlotConfigurations>[0];
}

interface LectureSlotSubmitParams {
  allClass: Standards[];
  dataId?: string;
  existingClassSlotData?: LectureSlotShift;
  handleClose?: (event: unknown, isSubmit: boolean) => void;
  isEdit?: boolean;
  lectureSlots?: LectureSlotShift;
}

export const useLectureSlotSubmit = ({
  allClass,
  dataId,
  existingClassSlotData,
  handleClose,
  isEdit,
  lectureSlots,
}: LectureSlotSubmitParams) => {
  const [addLectureSlot, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddLectureSlotMutation,
  });
  const [updateLectureSlot, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLectureSlotMutation,
  });

  const submitLectureSlot = async (values: SlotFormValues) => {
    const selectedClass = allClass.find((item) => item.id === values.className);
    const selectedClassName = selectedClass?.name || values.className;
    const shiftInfo =
      getClassShiftInfo(selectedClass) ||
      getClassShiftInfoFromSlot(isEdit ? lectureSlots : existingClassSlotData);
    const timingError = getSlotTimingError(values.slotConfigurations, shiftInfo);
    if (timingError) {
      shikshaMitraToast.error({ message: timingError });
      return;
    }

    const body = {
      standardId: values.className,
      previousStandardId: values.previousClassSlots || null,
      schoolHours: computeSchoolHours(values.slotConfigurations),
      slotConfigurations: mapSlotConfigurations(values.slotConfigurations),
    };
    const response =
      isEdit && dataId
        ? await updateLectureSlot({ lectureSlotId: dataId, body })
        : await addLectureSlot(body);

    if (response.data) {
      shikshaMitraToast.success({
        message: `Lecture slots have been successfully ${isEdit ? 'updated' : 'created'} for class ${selectedClassName}.`,
      });
      handleClose?.(null, true);
    }
  };

  return { isSubmitting: isAddLoading || isUpdateLoading, submitLectureSlot };
};
