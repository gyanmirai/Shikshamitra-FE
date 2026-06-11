import * as Yup from 'yup';

export const electiveSubjectValidationSchema = (existingNames: Set<string>, editData?: any) =>
  Yup.object().shape({
    name: Yup.string()
      .required('Elective Group Name is required')
      .test('unique-elective-group', 'This elective group name already exists', (value) => {
        if (!value?.trim()) return true;
        const trimmed = value.trim().toLowerCase();
        // Allow saving the same name when editing the current record
        if (editData && editData.name.trim().toLowerCase() === trimmed) return true;
        return !existingNames.has(trimmed);
      }),
    subjectIds: Yup.array().min(2, 'At least two subjects are required'),
    color: Yup.string().required('Elective Group Color is required'),
  });
