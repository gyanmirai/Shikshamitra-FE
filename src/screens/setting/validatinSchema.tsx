import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

export const basicInformationValidationSchema = Yup.object().shape({
  instituteName: Yup.string()
    .required('Institute Name is required')
    .min(2, 'Institute Name must be at least 2 characters')
    .max(100, 'Institute Name must not exceed 100 characters'),
  instituteLogo: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one Institute Logo is required')
    .required('Institute Logo is required'),
  instituteBanner: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one Institute Banner is required')
    .required('Institute Banner is required'),
  addressLine1: Yup.string().required('Building / Flat / House No is required'),
  addressLine2: Yup.string().required('Street / Road Name is required'),
  addressLine3: Yup.string().required('Area / Locality / Landmark is required'),
  city: Yup.object()
    .shape({ name: Yup.string().required('City is required') })
    .required('City is required'),
  stateProvince: Yup.object()
    .shape({ name: Yup.string().required('State is required') })
    .required('State is required'),
  // zipPostalCode: Yup.string()
  //   .required('ZIP/Postal Code is required')
  //   .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid ZIP/Postal Code format'),
  country: Yup.object()
    .shape({ name: Yup.string().required('Country is required') })
    .required('Country is required'),
  contactNumber: Yup.string()
    .required('Contact Number is required')
    .test('Mobile NO', 'Parents ContactNo is not valid', (value) =>
      matchIsValidTel((value || '') as string)
    ),
  emailAddress: Yup.string().required('Email Address is required').email('Invalid email format'),
  principleSign: Yup.array().of(Yup.string()).min(1, 'At least one Principle Sign is required'),
});
