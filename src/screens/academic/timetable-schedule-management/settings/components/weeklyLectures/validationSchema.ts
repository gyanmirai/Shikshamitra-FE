// utils/validationSchema.ts
import * as Yup from 'yup';

export const noOfLectureValidationSchema = Yup.object().shape({
  className: Yup.string().required('Class is required'),
  weeklyLectures: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required('ID is required'),
        weeklyLectures: Yup.number()
          .typeError('Weekly lecture count must be a number')
          .min(0, 'Lecture count must be 0 or more')
          .required('Weekly lecture count is required'),
      })
    )
    .required('Weekly lectures data is required'),
});
