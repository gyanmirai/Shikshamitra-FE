import dayjs from 'dayjs';

export const getChapterInitialValues = (editData?: any) => {
  const initialValues = {
    chapterNo: editData?.chapterNo || 0,
    chapterName: editData?.chapterName || '',
    description: editData?.description || '',
    startDate: editData?.startDate ? dayjs(editData.startDate, 'DD-MM-YYYY') : null,
    endDate: editData?.endDate ? dayjs(editData.endDate, 'DD-MM-YYYY') : null,
  };
  return initialValues;
};
