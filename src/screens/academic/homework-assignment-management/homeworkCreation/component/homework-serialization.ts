import type { Dayjs } from 'dayjs';

import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';

export interface HomeworkScheduleFormValue {
  divisionId: string;
  publishDate: Dayjs | null;
  dueDate: Dayjs | null;
}

export interface HomeworkAttachmentValue {
  url?: string;
  filePath?: string;
}

export interface HomeworkFormDataValues {
  standardId: string;
  subjectId: string;
  chapterId?: string;
  chapterIds?: string[];
  title: string;
  description?: string;
  homeworkTypeId: string;
  submissionType: number;
  attachments?: Array<File | HomeworkAttachmentValue | string>;
  divisions: HomeworkScheduleFormValue[];
}

export const serializeHomeworkFormData = (values: HomeworkFormDataValues): FormData => {
  const formData = new FormData();

  formData.append('StandardId', values.standardId);
  formData.append('SubjectId', values.subjectId);
  formData.append('Title', values.title.trim());
  formData.append('HomeworkTypeId', values.homeworkTypeId);
  formData.append('SubmissionType', String(values.submissionType));

  if (values.description?.trim()) {
    formData.append('Description', values.description);
  }

  const chapterIds = values.chapterIds?.length
    ? values.chapterIds
    : values.chapterId
      ? [values.chapterId]
      : [];
  chapterIds.forEach((chapterId) => formData.append('ChapterIds', chapterId));
  if (chapterIds[0]) formData.append('ChapterId', chapterIds[0]);

  values.attachments?.forEach((attachment) => {
    if (attachment instanceof File) return;
    const attachmentValue =
      typeof attachment === 'string' ? attachment : attachment.url || attachment.filePath;
    if (attachmentValue) formData.append('attachment', attachmentValue);
  });

  values.divisions.forEach((division, index) => {
    formData.append(`DivisionSchedules[${index}].DivisionId`, division.divisionId);
    if (division.publishDate) {
      formData.append(
        `DivisionSchedules[${index}].PublishAt`,
        dateConvertor(division.publishDate.format(dateFormat), false)
      );
    }
    if (division.dueDate) {
      formData.append(
        `DivisionSchedules[${index}].DueAt`,
        dateConvertor(division.dueDate.format(dateFormat), false)
      );
    }
  });

  return formData;
};
