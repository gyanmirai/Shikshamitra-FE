import * as yup from 'yup';

export const validationSchema = yup.object().shape({
  totalMarks: yup.number().required('Total Marks is required'),
  marks: yup
    .number()
    .required('Obtained Marks is required')
    // eslint-disable-next-line func-names
    .test('marks', 'Cannot exceed total marks', function (value) {
      return !value || !this.parent.totalMarks || value <= this.parent.totalMarks;
    }),
  feedback: yup.string().max(500, 'Feedback must be less than 500 characters'),
});
