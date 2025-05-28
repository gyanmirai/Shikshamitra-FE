import type { IResourceData } from '../type';

export const getLearningResourceInitialData = (
  isEdit: boolean,
  currentClass: string,
  currentSubject: string,
  data?: IResourceData | null
) => ({
  id: isEdit && data ? data.id : Date.now().toString(),
  resourceTitle: isEdit && data ? data.resourceTitle : '',
  document: isEdit && data ? data.document : null,
  className: currentClass,
  subject: isEdit && data ? data.subject : currentSubject,
  chapter: isEdit && data ? data.chapter : '',
  dateUploaded: isEdit && data ? data.dateUploaded : new Date().toLocaleDateString(),
});
