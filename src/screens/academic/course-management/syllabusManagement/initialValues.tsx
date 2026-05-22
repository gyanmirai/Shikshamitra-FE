import dayjs from 'dayjs';

import type { IChapter } from './type';

export const getChapterInitialValues = (editData?: IChapter | null) => {
  const initialValues = {
    chapterNo: editData?.chapterNumber ?? 0,
    chapterName: editData?.chapterName || '',
    description: editData?.description || '',
    startDate: editData?.chapterStartTime ? dayjs(editData.chapterStartTime) : null,
    endDate: editData?.chapterEndTime ? dayjs(editData.chapterEndTime) : null,
    documents: [] as string[],
  };
  return initialValues;
};
