import type { ISubjectFormValues } from './type';

export const getNoOfLectureInitialValues = (
  editData: ISubjectFormValues | null
): ISubjectFormValues => {
  const subjects =
    editData?.subjects?.map(({ name, subjectCode, subjectColor, noOfLecture }, index) => ({
      id: `subject-${index}`,
      name,
      subjectCode,
      subjectColor,
      noOfLecture,
    })) ?? [];

  const totalLectures = subjects.reduce((sum, subj) => sum + subj.noOfLecture, 0);

  return {
    className: editData?.className || '',
    subjects,
    totalLectures,
  };
};
