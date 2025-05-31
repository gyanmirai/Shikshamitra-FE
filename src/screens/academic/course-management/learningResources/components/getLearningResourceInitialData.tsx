import type { IResourceData } from '../type';

export const getLearningResourceInitialData = (isEdit: boolean, data?: IResourceData | null) => ({
  id: isEdit && data ? data.id : Date.now().toString(),
  resourceTitle: isEdit && data ? data.resourceTitle : '',
  document: isEdit && data ? data.document : '',
  className: isEdit && data ? data.className : '',
  subject: isEdit && data ? data.subject : '',
  chapter: isEdit && data ? data.chapter : '',
  dateUploaded: isEdit && data ? data.dateUploaded : new Date().toLocaleDateString(),
});
