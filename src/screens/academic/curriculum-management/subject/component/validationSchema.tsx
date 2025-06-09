import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  className: Yup.string().required('Class is required'),
  subjectName: Yup.string().required('Subject Name is required'),
  subjectType: Yup.string().oneOf(['core', 'Elective']).required('Subject Type is required'),
  status: Yup.string().required('Status is required'),

  // Validate each subject in the array
  subjects: Yup.array()
    .of(
      Yup.object().shape({
        subjectCode: Yup.string().required('Subject Code is required'),
        subjectName: Yup.string().required('Subject Name is required'),
        subjectColor: Yup.string().required('Subject Color is required'),
      })
    )
    .min(1, 'At least one subject is required'),
});
