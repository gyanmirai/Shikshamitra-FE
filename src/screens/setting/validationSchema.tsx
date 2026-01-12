import * as Yup from 'yup';
import { matchIsValidTel } from 'mui-tel-input';

export const basicInformationvalidationSchema = Yup.object().shape({
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
  addressLine1: Yup.string().required('Building No./Flat/House No. is required'),
  addressLine2: Yup.string(),
  addressLine3: Yup.string(),

  country: Yup.object()
    .shape({ name: Yup.string().required('Country is required') })
    .default(() => ({ name: '' }))
    .required('Country is required'),

  city: Yup.object()
    .shape({ name: Yup.string().required('City is required') })
    .default(() => ({ name: '' }))
    .required('City is required'),
  stateProvince: Yup.object()
    .shape({ name: Yup.string().required('State is required') })
    .default(() => ({ name: '' }))
    .required('State is required'),
  contactNumber: Yup.string()
    .required('Contact Number is required')
    .test('Mobile NO', 'Parents ContactNo is not valid', (value) =>
      matchIsValidTel((value || '') as string)
    ),
  emailAddress: Yup.string().required('Email Address is required').email('Invalid email format'),
  principleSign: Yup.array().of(Yup.string()).min(1, 'At least one Principle Sign is required'),
});
