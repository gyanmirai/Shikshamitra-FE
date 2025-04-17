import type { IResourceData } from '../type';

export const getLearningResourceInitialData = (
  isEdit: boolean,
  currentClass: string,
  currentSubject: string,
  data?: IResourceData | null
) => ({
  id: isEdit && data ? data.id : Date.now().toString(),
  resourceTitle: isEdit && data ? data.resourceTitle : '',
  typeOfResource: isEdit && data ? data.typeOfResource : '',
  className: currentClass,
  subject: isEdit && data ? data.subject : currentSubject,
  description: isEdit && data ? data.description : '',
  dateUploaded: isEdit && data ? data.dateUploaded : new Date().toLocaleDateString(),
  status: isEdit && data ? data.status : 'draft',
});
