import * as Yup from 'yup';

export const visitorValidationSchema = Yup.object().shape({
  visitorName: Yup.string().required('Visitor Name is required'),
  idProof: Yup.string().required('ID Proof is required'),
  proofNumber: Yup.string()
    .matches(/^\d+$/, 'Proof number must be numeric')
    .min(6, 'Proof number too short')
    .required('Proof Number is required'),
  contactNo: Yup.string()
    .matches(/^\d{10}$/, 'Contact number must be 10 digits')
    .required('Contact Number is required'),
  visitTime: Yup.date().nullable().required('Visit Time is required'),

  visitDate: Yup.date().nullable().required('Visit Date is required'),

  reasonForVisit: Yup.string().required('Reason is required'),
  status: Yup.string()
    .oneOf(['InHostel', 'Exited'], 'Invalid status')
    .required('Status is required'),
  relationship: Yup.string().required('Relationship is required'),
});
