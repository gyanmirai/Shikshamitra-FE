import { getSubjectMasterStatusLabel } from '../subjectMasterStatus';

import type { ISubject } from './type';

export const getSubjectInitialValues = (editData?: ISubject | null) => ({
  subjectName: editData?.name || '',
  displayName: editData?.displayName || '',
  category: editData?.category || 'General',
  subjectColor: editData?.color || '',
  icon: editData?.icon || '',
  description: editData?.description || '',
  status: getSubjectMasterStatusLabel(editData?.status),
  sortOrder: editData?.sortOrder ?? '',
});

export type SubjectFormValues = ReturnType<typeof getSubjectInitialValues>;
