import * as Yup from 'yup';

export const concessionValidation = Yup.object().shape({
  board: Yup.string().required('Board is required'),
  medium: Yup.string().required('Medium is required'),
  className: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  studentName: Yup.object().required('Student is required'),
  concessions: Yup.array()
    .min(1, 'At least one concession is required')
    .required('Concessions are required'),
});
