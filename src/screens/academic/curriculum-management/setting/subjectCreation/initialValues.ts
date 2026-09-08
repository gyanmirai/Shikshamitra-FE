import type { ISubject } from './type';

export const getSubjectInitialValues = (editData?: ISubject | null) => ({
  subjectName: editData?.name || '',
  displayName: editData?.displayName || '',
  category: editData?.category || 'General',
  subjectColor: editData?.color || '',
  icon: editData?.icon || '',
  description: editData?.description || '',
  status:
    editData?.status === 2 || editData?.status === 'Archived'
      ? 'Archived'
      : editData?.status === 1 || editData?.status === 'Inactive'
        ? 'Inactive'
        : 'Active',
  sortOrder: editData?.sortOrder ?? '',
});

export type SubjectFormValues = ReturnType<typeof getSubjectInitialValues>;
