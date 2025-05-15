import * as Yup from 'yup';

export const visitorWalkInValidationSchema = Yup.object().shape({
  vistorName: Yup.string().required('Visitor name is required'),
  visitorEmail: Yup.string().email('Enter a valid email').required('Visitor email is required'),
  visitorPhone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
    .required('Visitor phone is required'),
  visitingTime: Yup.string().required('Visiting time is required'),
  visitingDate: Yup.string().required('Visiting date is required'),
  visitingPurpose: Yup.string().required('Visiting purpose is required'),
});
