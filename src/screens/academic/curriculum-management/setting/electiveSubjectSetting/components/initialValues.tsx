import type { IElectiveSubject } from '../type';

export const getElectiveSubjectInitialValues = (editData?: IElectiveSubject | null) => ({
  title: editData?.title || '',
  subjects: editData?.subjects?.length ? editData.subjects : [{ name: '' }],
  subjectColor: editData?.subjectColor || '',
});
