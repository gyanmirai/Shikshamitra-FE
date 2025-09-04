import * as Yup from 'yup';

export const concessionValidation = Yup.object().shape({
  board: Yup.string().required('Board is required'),
  medium: Yup.string().required('Medium is required'),
  className: Yup.string().required('Class is required'),
  division: Yup.string().required('Division is required'),
  studentName: Yup.object().required('Student is required'),
  concessionType: Yup.string().required('Concession type is required'),
  reason: Yup.string().required('Reason is required'),
  feeHead: Yup.string().required('Fee head is required'),
});
