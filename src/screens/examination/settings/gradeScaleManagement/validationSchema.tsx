import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Grading Scale Title is Required'),
  totalMarks: Yup.string().required('Total Marks is Required'),
  gradingScale: Yup.array().of(
    Yup.object().shape({
      minMarks: Yup.number().required('Min Marks is Required'),
      maxMarks: Yup.number()
        .required('Max Marks is Required')
        .min(Yup.ref('minMarks'), 'Max Marks must be greater than Min Marks'),
      grade: Yup.string().required('Grade is Required'),
    })
  ),
});
