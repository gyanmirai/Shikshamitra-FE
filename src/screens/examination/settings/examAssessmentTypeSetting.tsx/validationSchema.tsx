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
    category: Yup.string().nullable(),
    status: Yup.number().required('Status is required'),
    defaultTotalMarks: Yup.number()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .nullable()
      .min(1, 'Default Total Marks must be greater than 0'),
    defaultWeightage: Yup.number()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .nullable()
      .min(0, 'Weightage cannot be negative')
      .max(100, 'Weightage cannot exceed 100%'),
    defaultGradeScaleId: Yup.string().nullable(),
  });

export const assessmentTypeValidationSchema = Yup.object().shape({
  assessmentType: Yup.string()
    .required('Assessment type is required')
    .max(50, 'Assessment type must be at most 50 characters'),
});
