import * as Yup from 'yup';

export const examTypeValidationSchema = (existingNames: Set<string>, editData?: any) =>
  Yup.object().shape({
    examType: Yup.string()
      .required('Exam Type is required')
      .test('unique-exam-type', 'This exam type name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.examType.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
  });

export const assessmentTypeValidationSchema = Yup.object().shape({
  assessmentType: Yup.string()
    .required('Assessment type is required')
    .max(50, 'Assessment type must be at most 50 characters'),
});
