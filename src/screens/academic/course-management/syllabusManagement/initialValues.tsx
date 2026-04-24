import dayjs from 'dayjs';

export const getChapterInitialValues = (editData?: Record<string, unknown>) => {
  const initialValues = {
    chapterNo: editData?.chapterNumber ?? editData?.chapterNo ?? null,
    chapterName: editData?.chapterName || '',
    description: editData?.description || '',
    startDate: editData?.chapterStartTime
      ? dayjs(editData.chapterStartTime)
      : editData?.startDate
        ? dayjs(editData.startDate, 'DD-MM-YYYY')
        : null,
    endDate: editData?.chapterEndTime
      ? dayjs(editData.chapterEndTime)
      : editData?.endDate
        ? dayjs(editData.endDate, 'DD-MM-YYYY')
        : null,
  };
  return initialValues;
};
