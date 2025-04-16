import type { ITeacher } from './type';

export const getAssignTeacherInitialValues = (selectedTeacher: ITeacher | null) => ({
  assignedTeacher: selectedTeacher?.assignedTeacher || [],
});
