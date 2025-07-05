import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  name: Yup.string().required('Grading Scale Title is Required'),
  totalMarks: Yup.string().required('Total Marks is Required'),
  gradingScale: Yup.array().of(
    Yup.object().shape({
      minMarks: Yup.number().required('Min Marks is Required'),
      maxMarks: Yup.number()
        .required('Max Marks Required')
        .min(Yup.ref('minMarks'), 'Cannot exceed total marks'),
      grade: Yup.string().required('Grade is Required'),
    })
  ),
});
