import type { IElectiveSubject } from '../type';

export const getElectiveSubjectInitialValues = (editData?: IElectiveSubject | null) => ({
  name: editData?.name || '',
  subjectIds: editData?.subjectIds?.length ? editData.subjectIds : [],
  color: editData?.color || '',
});
