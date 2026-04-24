import type { ISubjectFormValues } from './type';

export const getNoOfLectureInitialValues = (
  editData: ISubjectFormValues | null,
  selectedClass?: string
): any => {
  const subjects =
    editData?.subjects?.map(
      (
        { id, subjectId, name, subjectCode, subjectColor, noOfLecture, electiveGroupId },
        index
      ) => ({
        id: id || `subject-${index}`,
        subjectId: subjectId || id,
        name,
        subjectCode,
        subjectColor,
        noOfLecture,
        electiveGroupId: electiveGroupId || null,
      })
    ) ?? [];

  const totalLectures = subjects.reduce<number>(
    (sum, subj) => sum + (Number(subj.noOfLecture) || 0),
    0
  );

  return {
    id: editData?.id,
    className: editData?.className ? editData.className : selectedClass || '',
    subjects,
    totalLectures,
    classId: '',
  };
};
