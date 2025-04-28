import * as Yup from 'yup';

export const visitorValidationSchema = Yup.object().shape({
  visitorName: Yup.string().trim().required('Visitor Name is required'),

  idProof: Yup.string().trim().required('ID Proof is required'),

  aadharNumber: Yup.string()
    .trim()
    .matches(/^\d{12}$/, 'Aadhar Number must be 12 digits')
    .required('Aadhar Number is required'),

  contactNo: Yup.string()
    .trim()
    .matches(/^\d{10}$/, 'Contact Number must be 10 digits')
    .required('Contact Number is required'),

  visingWhome: Yup.string().trim().required('Visiting Whom is required'),

  reasonForVisit: Yup.string().trim().required('Reason for Visit is required'),

  entryTime: Yup.date().nullable().required('Entry Time is required'),

  exitTime: Yup.date().nullable().required('Exit Time is required'),
});
