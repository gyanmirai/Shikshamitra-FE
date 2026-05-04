export const getNoOfLectureInitialValues = (editData: any | null, selectedClass?: string): any => {
  const subjects =
    editData?.subjects?.map(
      (
        {
          subjectId,
          subjectName,
          subjectCode,
          subjectColor,
          weeklyLectures,
          electiveGroupId,
          subjectType,
          electiveGroupName,
          ...rest
        }: any,
        index: any
      ) => ({
        ...rest,
        id: subjectId || `subject-${index}`,
        subjectId,
        name: electiveGroupName || subjectName || '',
        subjectCode,
        subjectColor,
        noOfLecture: weeklyLectures || 0,
        electiveGroupId: electiveGroupId || null,
        subjectType: electiveGroupId ? 1 : 0,
      })
    ) ?? [];

  const totalLectures = subjects.reduce(
    (sum: any, subj: any) => sum + (Number(subj.noOfLecture) || 0),
    0
  );

  return {
    id: editData?.id || '',
    className: editData?.standardName ? editData.standardName : selectedClass || '',
    subjects,
    totalLectures,
    classId: editData?.standardId || selectedClass || '',
  };
};
