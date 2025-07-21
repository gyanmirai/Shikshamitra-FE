import { generateDummySubjects } from './createWeeklyLectures';

import type { ISubjectFormValues } from './type';

export const getNoOfLectureInitialValues = (
  editData: ISubjectFormValues | null,
  selectedClass?: string
): any => {
  const subjects =
    editData?.subjects?.map(({ name, subjectCode, subjectColor, noOfLecture }, index) => ({
      id: `subject-${index}`,
      name,
      subjectCode,
      subjectColor,
      noOfLecture,
    })) ??
    generateDummySubjects().map((subj, index) => ({
      id: `subject-${index}`,
      ...subj,
      noOfLecture: '',
    }));

  const totalLectures = subjects.reduce<number>(
    (sum, subj) => sum + (Number(subj.noOfLecture) || 0),
    0
  );

  return {
    className: editData?.className ? editData.className : selectedClass || '',
    subjects,
    totalLectures,
  };
};
