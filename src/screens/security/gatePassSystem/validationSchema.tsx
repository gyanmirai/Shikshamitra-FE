import * as Yup from 'yup';

export const gatePassValidationSchema = Yup.object().shape({
  studentName: Yup.string().required('Student Name is required'),
  studentId: Yup.string().required('Student ID is required'),
  reason: Yup.string().required('Reason is required'),
  validFrom: Yup.date().required('Valid From date is required'),
  validTo: Yup.date().required('Valid To date is required'),
  status: Yup.string().optional(),
  specailInstructions: Yup.string().optional(),
});
