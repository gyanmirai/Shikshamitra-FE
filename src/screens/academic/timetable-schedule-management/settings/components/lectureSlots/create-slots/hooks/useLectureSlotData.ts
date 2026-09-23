import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetLectureSlotsQuery,
  useGetLectureSlotByIdQuery,
} from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

interface LectureSlotDataParams {
  dataId?: string;
  isEdit?: boolean;
  mediumId?: string;
  selectedClassSlotId?: string;
}

export const useLectureSlotData = ({
  dataId,
  isEdit,
  mediumId,
  selectedClassSlotId,
}: LectureSlotDataParams) => {
  const { data: lectureSlots, isLoading: isLectureSlotsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotByIdQuery,
    params: dataId,
    options: { skip: !dataId },
  });

  const { data: allSlotsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: mediumId },
    options: { skip: !mediumId || Boolean(isEdit) },
  });

  const { data: existingClassSlotData, isLoading: isExistingSlotLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotByIdQuery,
    params: selectedClassSlotId,
    options: { skip: !selectedClassSlotId || Boolean(isEdit) },
  });

  return {
    allSlotsData,
    existingClassSlotData,
    isExistingSlotLoading,
    isLectureSlotsLoading,
    lectureSlots,
  };
};
