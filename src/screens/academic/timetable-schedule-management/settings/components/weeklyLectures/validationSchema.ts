import * as Yup from 'yup';

export const noOfLectureValidationSchema = Yup.object().shape({
  className: Yup.string().required('Class is required'),
  subjects: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string().required('Subject name is required'),
        subjectColor: Yup.string().required('Subject color is required'),
        noOfLecture: Yup.number()
          .required('Weekly Lectures are required')
          .min(0, 'Weekly Lectures cannot be negative')
          .max(100, 'Too many lectures'),
      })
    )
    .required('At least one subject is required'),
});
