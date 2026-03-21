import type { IElectiveSubject } from '../type';

export const getElectiveSubjectInitialValues = (editData?: IElectiveSubject | null) => ({
  name: editData?.name || '',
  subjectIds: editData?.subjects?.length ? editData.subjects.map((subject) => subject.id) : [],
  color: editData?.color || '',
});
