import * as Yup from 'yup';

export const electiveSubjectValidationSchema = (existingNames: Set<string>, editData?: any) =>
  Yup.object().shape({
    name: Yup.string()
      .trim()
      .required('Elective Group Name is required')
      .min(2, 'Minimum 2 characters required')
      .max(100, 'Maximum 100 characters allowed')
      .test('unique-elective-group', 'This elective group name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
    groupType: Yup.string().required('Group Type is required'),
    subjectIds: Yup.array().min(2, 'At least two subjects are required'),
    color: Yup.string().required('Elective Group Color is required'),
    sortOrder: Yup.number()
      .transform((value, originalValue) => (originalValue === '' ? undefined : value))
      .min(1, 'Sort order must be at least 1')
      .max(999999, 'Sort order cannot exceed 999999')
      .nullable(),
  });
