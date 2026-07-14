import type { IElectiveSubject } from '../type';

export const getElectiveSubjectInitialValues = (editData?: IElectiveSubject | null) => ({
  name: editData?.name || '',
  subjectIds: editData?.subjects?.length ? editData.subjects.map((subject) => subject.id) : [],
  color: editData?.color || '',
  groupType: editData?.groupType || 'Language',
  description: editData?.description || '',
  status: getStatusLabel(editData?.status),
  sortOrder: editData?.sortOrder ?? '',
});

const getStatusLabel = (status?: IElectiveSubject['status']) => {
  if (status === 2 || status === 'Archived') return 'Archived';
  if (status === 1 || status === 'Inactive') return 'Inactive';
  return 'Active';
};
