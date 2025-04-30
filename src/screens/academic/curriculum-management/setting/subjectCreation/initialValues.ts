import type { ISubject } from './type';

export const getSubjectInitialValues = (editData?: ISubject | null) => ({
  subjectName: editData?.subjectName || '',
  subjectColor: editData?.subjectColor || '',
});
