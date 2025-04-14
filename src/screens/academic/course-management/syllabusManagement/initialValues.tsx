import dayjs from 'dayjs';

export const getChapterInitialValues = (editData?: any) => {
  const initialValues = {
    chapterNo: editData?.chapterNo || 0,
    chapterName: editData?.chapterName || '',
    assignedTeacher: editData?.assignedTeacher || '',
    content: editData?.content || '',
    startTime: editData?.startTime ? dayjs(editData.startTime) : null,
    endTime: editData?.endTime ? dayjs(editData.endTime) : null,
    timeLine: editData?.timeLine ? dayjs(editData.timeLine) : null,
  };
  return initialValues;
};
