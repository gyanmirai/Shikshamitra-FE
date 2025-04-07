import * as yup from 'yup';

export const validationSchema = [
  // Step 0: Select Exam Type
  yup.object().shape({
    examType: yup.string().required('Exam Type is required'),
    examName: yup.string().required('Exam Name is required'),
    className: yup.string().required('Class is required'),
    divisions: yup.array().min(1, 'At least one division is required'),
    subjects: yup.array().min(1, 'At least one subject is required'),
  }),

  yup.object().shape({}),
  yup.object().shape({}),

  // Step 2: Evaluation Criteria
  //   yup.object().shape({
  //     subjects: yup.array().of(
  //       yup.object().shape({
  //         examDate: yup.date().required('Exam date is required'),
  //         examTime: yup.string().required('Exam time is required'),
  //         examDuration: yup
  //           .number()
  //           .required('Exam duration is required')
  //           .positive('Duration must be positive'),
  //         totalMarks: yup
  //           .number()
  //           .required('Total marks required')
  //           .positive('Total marks must be positive'),
  //         passingMarks: yup
  //           .number()
  //           .required('Passing marks required')
  //           .min(0, 'Must be at least 0')
  //           .max(yup.ref('totalMarks'), 'Passing marks must be less than total'),
  //       })
  //     ),
  //   }),

  // Step 3: Assign Teacher & Review
  yup.object().shape({}),

  //   yup.object().shape({
  //     subjects: yup.array().of(
  //       yup.object().shape({
  //         invigilationTeacher: yup.string().required('Invigilation teacher is required'),
  //         teacher: yup.string().required('Subject teacher is required'),
  //       })
  //     ),
  //     description: yup.string().required('Description is required'),
  //   }),
];
