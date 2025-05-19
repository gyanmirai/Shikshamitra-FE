import * as Yup from 'yup';

export const checkOutValidationSchema = Yup.object().shape({
  checkOutNotes: Yup.string().required('Check-out notes are required'),
});

export const checkInValidationSchema = Yup.object().shape({
  checkInNotes: Yup.string().required('Check-in notes are required'),
});
