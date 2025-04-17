// validations/teacherReassignValidation.ts
import * as Yup from 'yup';

export const teacherReassignValidationSchema = Yup.object({
  assignedTeacher: Yup.array().of(Yup.string()).min(1, 'At least one assigned teacher is required'),
});
